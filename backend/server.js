const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

console.log("Server file loaded");

app.post('/getResponse', async (req, res) => {
  console.log("Route hit");

  try {
    const userMessage = req.body.msg;

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
              parts: [{ text: userMessage }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 100,   // limit tokens 
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

    res.json({ reply });

  } catch (error) {
    console.error("ERROR:", error);
    res.json({ reply: "Error occurred" });
  }
});

app.listen(3000, () => {
  console.log("server running at port 3000");
});