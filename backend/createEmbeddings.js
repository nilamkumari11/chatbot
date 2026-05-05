import readPDF from "./utils/readPdf.js";
import chunkText from "./utils/chunk.js";
import getEmbedding from "./utils/embedding.js";
import fs from "fs";

async function main() {
    const text = await readPDF("./data/notes.txt"); // read
    const chunks = chunkText(text); // chunk

    let result = [];

    for(let chunk of chunks){
        const embedding = await getEmbedding(chunk);  
        result.push({ text:chunk, embedding}); // push text + vector
    }

    fs.writeFileSync("./storage/vectors.json", JSON.stringify(result)); // write in vector.json
}

main()