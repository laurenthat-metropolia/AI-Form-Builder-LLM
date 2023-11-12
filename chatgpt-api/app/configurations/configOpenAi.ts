import OpenAI from 'openai';
import { environment } from './environment.js';

export function configOpenAi() {
    return new OpenAI({
        organization: environment.APP_OPENAI_ORGANIZATION,
        apiKey: environment.APP_OPENAI_API_KEY,
    });
}
