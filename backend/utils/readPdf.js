import fs from "fs";

function readText(path) {
  return fs.readFileSync(path, "utf-8");
}

export default readText;