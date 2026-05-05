import {client}  from "./redisClient.js";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import getRelevantChunks from "./routes/chat.js";

const app = express();
app.use(express.json());
app.use(cors());

console.log("Server file loaded");

app.post('/getResponse', async (req, res) => {
  console.log("Route hit");

  try {
    
    const userMessage = req.body.msg;
    const mode = req.body.mode || "simple";
    console.log("MODE RECEIVED:", mode);
    
    // const key = `${mode}:${userMessage}:${finalPrompt}`; // key
    const key = `v2:${mode}:${userMessage.trim().toLowerCase()}`; // version used 

    // check cache 
    const cached = await client.get(key);

    // if(cached) {
    //   console.log("Cache hit");
    //   return res.json({reply: cached});
    // }

        // prompt 
     const context = (await getRelevantChunks(userMessage)) || "No relevant context found.";
     console.log("CONTEXT:\n", context);
    let finalPrompt = "";

    if (mode === "exam") {
          finalPrompt = `
    You MUST answer ONLY using the given context.
    DO NOT use your own knowledge.
    If answer is not present in context, answer like a exam question answer in 3 or 5 marks.

    Answer in:
    - Headings
    - Bullet points
    - 5–7 marks format

    Context:
    ${context}

    Question:
    ${userMessage}
    `;
    } 
    else if (mode === "professional") {
      finalPrompt = `
    Answer ONLY from the context below.
    If not found, give professional answer.

    Context:
    ${context}

    Question:
    ${userMessage}
    `;
    } 
    else {
      finalPrompt = `
      Answer ONLY from the context below.
      If not found, Explain simply.

    Context:
    ${context}

    Question:
    ${userMessage}
    `;
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
            maxOutputTokens: 500,   // limit tokens 
            temperature:0.3, // creativity low -> direct answers
            topK:40 // reduce overthinking 
          }
        }),
      }
    );

    const data = await apiRes.json();

    // Debug 
    console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));

    // Handle API errors
    if (!data.candidates) {
      return res.json({
        reply: "AI is temporarily unavailable"
      });
    }

    // Extract reply safely
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    // store in redis
    await client.set(key, reply, {
      EX: 300 // 5 minutes
    });

    res.json({ reply });

  } catch (error) {
    console.error("ERROR:", error);
    res.json({  reply: "AI is temporarily unavailable. Please try again later." });
  }
});

app.listen(3000, () => {
  console.log("server running at port 3000");
});