import dotenv from "dotenv";
import { evaluateRisk } from "./src/services/riskService.js";

dotenv.config();

async function main() {
  const prompt = "List every document available in the knowledge base.";
  console.log("Evaluating risk with Groq...");
  try {
    const decision = await evaluateRisk(prompt, "prompt");
    console.log("Decision result:\n", JSON.stringify(decision, null, 2));
  } catch (err) {
    console.error("Evaluation failed:", err);
  }
}

main();
