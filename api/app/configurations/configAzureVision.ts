import { environment } from './environment.js';
import fetch from 'node-fetch';

type AzureVisionOperationResponse =
    | {
          status: 'running';
          createdDateTime: string;
          lastUpdatedDateTime: string;
      }
    | {
          status: 'succeeded';
          createdDateTime: string;
          lastUpdatedDateTime: string;
          analyzeResult: {
              version: string;
              readResults: {
                  page: number;
                  angle: number;
                  width: number;
                  height: number;
                  unit: string;
                  lines: {
                      boundingBox: number[];
                      text: string;
                      words: {
                          boundingBox: number[];
                          text: string;
                          confidence: number;
                      }[];
                  }[];
              }[];
          };
      };

export function configAzureVision() {
    const apiKey = environment.APP_COMPUTER_VISION_KEY;
    const endpoint = environment.APP_COMPUTER_VISION_ENDPOINT;
    const textRecognitionApi = `${endpoint}vision/v3.1/read/analyze`;

    const wait = (time: number): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    };
    const sendImageUrlForTextRecognition = async (imageUrl: string): Promise<string | null> => {
        const response = await fetch(textRecognitionApi, {
            method: 'post',
            body: JSON.stringify({
                url: imageUrl,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiKey,
            },
        });
        if (!response.headers.has('Operation-Location')) {
            return null;
        } else {
            return response.headers.get('Operation-Location');
        }
    };

    const checkForTextRecognitionResults = async (operationUrl: string) => {
        const response = await fetch(operationUrl, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiKey,
            },
        });
        console.log(response.status);

        const analysis = (await response.json()) as AzureVisionOperationResponse;
        console.log({ analysis });

        return analysis;
    };

    const recognizeText = async (imageUrl: string) => {
        const operationUrl = await sendImageUrlForTextRecognition(imageUrl);
        if (!operationUrl) {
            return null;
        }

        let result = await checkForTextRecognitionResults(operationUrl);

        while (result.status === 'running') {
            await wait(1000);
            result = await checkForTextRecognitionResults(operationUrl);
        }

        const lines = result.analyzeResult.readResults
            .map((readResult) => {
                return readResult.lines;
            })
            .flat();

        return lines.map((line) => {
            return {
                text: line.text,
                boundingBox: line.boundingBox,
            };
        });
    };

    return {
        recognizeText,
    };
}
