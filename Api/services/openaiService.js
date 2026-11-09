import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether run from repo root or Api folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let openai = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
    try {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    } catch (err) {
        console.error("Failed to initialize OpenAI client:", err?.message);
    }
}

export default openai;
