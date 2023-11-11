import { cleanEnv, host, str } from 'envalid';
import { config } from 'dotenv';

// Load environment variables from a file named .env
config();
export const environment = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production'] }),
    APP_OAUTH2_CLIENT_ID: str(),
    APP_OAUTH2_CLIENT_SECRET: str(),
    APP_OAUTH2_CALLBACK_URL: str(),
    APP_JWT_SECRET: str(),
    APP_JWT_ISSUER: host(),
    APP_JWT_AUDIENCE: host(),
    APP_SESSION_SECRET: str(),
    APP_ANDROID_SHA256_CERT_FINGERPRINT: str(),
    APP_S3_ENDPOINT: str(),
    APP_S3_ACCESS_KEY: str(),
    APP_S3_SECRET_KEY: str(),
    APP_COMPUTER_VISION_KEY: str(),
    APP_COMPUTER_VISION_ENDPOINT: str(),
    APP_OPENAI_ORGANIZATION: str(),
    APP_OPENAI_API_KEY: str(),
});
