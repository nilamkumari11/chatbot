import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

async function getEmbedding(text){
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method:"POST",
            headers:{"content-Type" : "application/json"},
            body: JSON.stringify({
                content : { parts: [{ text }]}
            })
        }
    );

    const data = await response.json(); // api response to js object 
    // console.log(data);   // check
    return data.embedding.values; // embedding vector
}

export default getEmbedding;