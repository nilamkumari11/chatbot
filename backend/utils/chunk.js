export default function chunkText(text, size=300){
    const words = text.split(" ");
    let chunks = [];

    for(let i=0; i<words.length; i+=size){
        chunks.push(words.slice(i, i+size).join(" "));
    }

    return chunks;
}