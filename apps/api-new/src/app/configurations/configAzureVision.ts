import { environment } from './environment';
import fetch from 'node-fetch';
import { AzureVisionOperationResponse, TextDetectionResponse } from '@draw2form/shared';

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
    console.log(`Azure Api | sendImageUrlForTextRecognition:  status: ${response.status}`);

    const hasGoodStatus = [200, 201, 202].includes(response.status);
    if (!hasGoodStatus) {
        console.error(await response.json());
        return null;
    }
    if (!response.headers.has('Operation-Location')) {
        return null;
    } else {
        return response.headers.get('Operation-Location');
    }
};

const checkForTextRecognitionResults = async (operationUrl: string) => {
    try {
        const response = await fetch(operationUrl, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': apiKey,
            },
        });
        console.log(`Azure Api | checkForTextRecognitionResults:  status: ${response.status}`);
        const hasGoodStatus = [200, 201, 202].includes(response.status);
        if (!hasGoodStatus) {
            return null;
        }
        return (await response.json()) as AzureVisionOperationResponse;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const recognizeText = async (imageUrl: string): Promise<TextDetectionResponse | null> => {
    try {
        const operationUrl = await sendImageUrlForTextRecognition(imageUrl);
        if (!operationUrl) {
            return null;
        }

        let result = await checkForTextRecognitionResults(operationUrl);
        if (!result) {
            return null;
        }

        while (result.status === 'running') {
            await wait(1000);
            result = await checkForTextRecognitionResults(operationUrl);
            if (!result) {
                return null;
            }
        }

        const lines = result.analyzeResult.readResults
            .map((readResult) => {
                return readResult.lines;
            })
            .flat();

        return lines.map((line) => {
            const xCoordinates = line.boundingBox.filter((c, index) => index % 2 === 0);
            const yCoordinates = line.boundingBox.filter((c, index) => index % 2 !== 0);
            const x0 = Math.min(...xCoordinates);
            const y0 = Math.min(...yCoordinates);
            const x1 = Math.max(...xCoordinates);
            const y1 = Math.max(...yCoordinates);

            return {
                text: line.text,
                coordinates: [x0, y0, x1, y1],
            };
        });
    } catch (e) {
        console.error(e);
        return null;
    }
};
