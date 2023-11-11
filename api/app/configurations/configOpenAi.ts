import OpenAI from 'openai';
import { environment } from './environment.js';

export function configOpenAi() {
    return new OpenAI({
        organization: environment.APP_OPENAI_ORGANIZATION,
        apiKey: environment.APP_OPENAI_API_KEY,
    });
}

// router.get('/', async (req: Request, res: Response) => {
//     const body: OpenAI.ChatCompletionCreateParams = {
//         messages: [{ role: 'user', content: 'Say this is a test' }],
//         model: 'gpt-3.5-turbo',
//     };
//     const chatCompletion = await openai.chat.completions.create(body);
//
//     res.send({
//         input: body,
//         output: chatCompletion,
//     });
//     return;
// });
