import fetch from 'node-fetch';

export type ObjectDetectionResponseItem = {
    confidence: number;
    class: string;
    class_id: number;
    coordinates: [number, number, number, number];
};

export type ObjectDetectionResponse = ObjectDetectionResponseItem[];

const api = 'http://127.0.0.1:8001/llm/predict';

export const recognizeObjects = async (
    imageUrl: string,
    model: string = 'roboflow',
): Promise<ObjectDetectionResponse | null> => {
    try {
        const url = new URL(api);
        url.searchParams.set('image_url', imageUrl);
        url.searchParams.set('model_name', model);
        const response = await fetch(url.href, {
            method: 'post',
            body: null,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log(`LLM Api | checkForTextRecognitionResults:  status: ${response.status}`);
        const hasGoodStatus = [200, 201, 202].includes(response.status);
        if (!hasGoodStatus) {
            return null;
        }

        const responseBody = (await response.json()) as ObjectDetectionResponse;

        const output: ObjectDetectionResponse = responseBody.map((item) => {
            return {
                class: item.class,
                coordinates: item.coordinates,
                class_id: item.class_id,
                confidence: item.confidence,
            };
        });
        return output;
    } catch (e) {
        console.error(e);
        return null;
    }
};
