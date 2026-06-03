import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== "dist") {
        searchDir(fullPath);
      }
    } else {
      if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".json") || file.endsWith(".html") || file.endsWith(".css")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (content.includes("No disallowed content detected")) {
          console.log(`Found in: ${fullPath}`);
        }
      }
    }
  }
}

searchDir(rootDir);
