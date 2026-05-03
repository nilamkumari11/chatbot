import readPDF from "./utils/readPdf.js";
import chunkText from "./utils/chunk.js";
import getEmbedding from "./utils/embedding.js";
import fs from "fs";

async function main() {
    const text = await readPDF("./data/notes.txt");
    const chunks = chunkText(text);

    let result = [];

    for(let chunk of chunks){
        const embedding = await getEmbedding(chunk);
        result.push({ text:chunk, embedding});
    }

    fs.writeFileSync("./storage/vectors.json", JSON.stringify(result));
}

main()