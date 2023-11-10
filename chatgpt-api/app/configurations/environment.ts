import { cleanEnv, host, str } from 'envalid';
import { config } from 'dotenv';

// Load environment variables from a file named .env
config();
export const environment = cleanEnv(process.env, {
    APP_OPENAI_ORGANIZATION: str(),
    APP_OPENAI_API_KEY: str(),
});
