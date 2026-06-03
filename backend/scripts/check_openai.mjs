import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// load backend .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { evaluateRisk } = await import('../src/services/riskService.js');

async function main(){
  try{
    const decision = await evaluateRisk('OpenAI key verification prompt', 'prompt');
    console.log(JSON.stringify({ ok: true, decision }, null, 2));
  } catch (err){
    console.error(JSON.stringify({ ok: false, error: String(err) }));
    process.exit(1);
  }
}

main();
