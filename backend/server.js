import {client}  from "./redisClient.js";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import getRelevantChunks from "./routes/chat.js";
import cosineSimilarity from "./utils/similarity.js";
import getEmbedding from "./utils/embedding.js";

const app = express(); // server created 
app.use(express.json()); // read json body 
app.use(cors()); // allows frontend to call body 

console.log("Server file loaded");

app.post('/getResponse', async (req, res) => { // frontend request 
  console.log("Route hit");

  try {
    
    const userMessage = req.body.msg;
    const qEmbedding = await getEmbedding(userMessage);
    const mode = req.body.mode || "simple";
    console.log("MODE RECEIVED:", mode);
    
    const key = `v3:${mode}:${userMessage.trim().toLowerCase()}`; // version used 

    // check cache 
    const cached = await client.get(key);

    if(cached) {
      console.log("Cache hit");

      try {
        const parsed = JSON.parse(cached);
        return res.json({ reply: parsed.reply }); // ✅ FIXED
      } catch {
        return res.json({ reply: cached }); // fallback for old cache
      }
    }

    // SEMANTIC CACHE 

    const keys = await client.keys("v2:*");

    let bestMatch = null; // best cached answer
    let bestScore = 0; // highest similarity

    for (let k of keys) {
      const value = await client.get(k);

      try {
        const parsed = JSON.parse(value); // redis store string -> convert to object

        if (!parsed.embedding) continue; // ignore old cache 

        const score = cosineSimilarity(qEmbedding, parsed.embedding);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = parsed;
        }

      } catch (err) {
        // ignore old cache (string format)
      }
    }

    if (bestScore > 0.9 && bestMatch) {
      console.log("Semantic cache hit:", bestScore);
      return res.json({ reply: bestMatch.reply });
    }

    // prompt 
    // const context = (await getRelevantChunks(userMessage)) || "No relevant context found."; 
    const ragResult = await getRelevantChunks(userMessage);

    const context = ragResult.text;
    const similarityScore = ragResult.score;
    console.log("CONTEXT:\n", context); 

    // check if context is actually useful
    const hasValidContext =
    context &&
    similarityScore > 0.5; // threshold

    console.log("HAS VALID CONTEXT:", hasValidContext);

    // prompt building
    let finalPrompt = "";

    if (mode === "exam") {

      if (hasValidContext) {
        finalPrompt = `
    Use the context if it is relevant.
  If the context is not relevant, answer normally using your own knowledge.
  Don't mention about the context just start answering normally.

    Answer in:
    - Headings
    - Bullet points
    - 5–7 marks format

    Context:
    ${context}

    Question:
    ${userMessage}
    `;
      } else {
        finalPrompt = `
    Answer the question in exam format (5–7 marks).

    Question:
    ${userMessage}
    `;
      }

    } 
    else if (mode === "professional") {

      if (hasValidContext) {
        finalPrompt = `
    Use the context if it is relevant.
    If the context is not relevant, answer normally using your own knowledge.
    Don't mention about the context just start answering normally.

    Context:
    ${context}

    Question:
    ${userMessage}
    `;
      } else {
        finalPrompt = `
    Answer this in a professional way:

    ${userMessage}
    `;
      }

    } 
    else {

      if (hasValidContext) {
        finalPrompt = `
      Use the context if it is relevant.
      If the context is not relevant, answer normally using your own knowledge.
      Don't mention about the context just start answering normally.

      Context:
      ${context}

      Question:
      ${userMessage}
      `;
      } else {
        finalPrompt = `
      Explain this in simple language:

      ${userMessage}
      `;
      }

    }

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: finalPrompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 500,   
            temperature:0.3, 
            topK:40 
          }
        }),
      }
    );

    const data = await apiRes.json();

    console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));

    if (!data.candidates) {
      return res.json({
        reply: "AI is temporarily unavailable"
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    // store in redis
    const invalidReplies = [
    "AI is temporarily unavailable",
    "No response",
    "The provided context does not contain"
  ];

  const shouldCache = !invalidReplies.some(msg =>
    reply.toLowerCase().includes(msg.toLowerCase())
  );

  if (shouldCache) {
    await client.set(
      key,
      JSON.stringify({
        question: userMessage,
        embedding: qEmbedding,
        reply: reply
      }),
      { EX: 300 }
    );

    console.log("Stored in cache");
  } else {
    console.log("Skipped bad response cache");
  }

    res.json({ reply });

  } catch (error) {
    console.error("ERROR:", error);
    res.json({ reply: "AI is temporarily unavailable. Please try again later." });
  }
});

app.listen(3000, () => {
  console.log("server running at port 3000");
});