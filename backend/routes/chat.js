import fs from "fs";
import getEmbedding from "../utils/embedding.js";
import cosineSimilarity from "../utils/similarity.js";

const data = JSON.parse(fs.readFileSync("./storage/vectors.json"));

async function getRelevantChunks(question) {
  const qEmbedding = await getEmbedding(question);

  let scored = data.map(item => ({
    text: item.text,
    score: cosineSimilarity(qEmbedding, item.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);

  const topChunks = scored.slice(0, 3).map(i => i.text);

  return topChunks.join("\n");
}

export default getRelevantChunks;