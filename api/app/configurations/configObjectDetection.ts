import fetch from 'node-fetch';

type DetectionResponse = {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
    class: string;
    class_id: number;
    coordinates: number[];
}[];

export function configObjectDetection() {
    const api = 'http://localhost:8001/llm/predict';

    const recognizeObjects = async (
        imageUrl: string,
        model: string = 'roboflow',
    ): Promise<DetectionResponse | null> => {
        const url = new URL(api);
        url.searchParams.set('image_url', imageUrl);
        url.searchParams.set('model_name', model);
        const response = await fetch(url.href, {
            method: 'post',
            body: null,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const hasGoodStatus = [200, 201, 202].includes(response.status);
        if (!hasGoodStatus) {
            return null;
        }

        return (await response.json()) as DetectionResponse;
    };

    return {
        recognizeObjects,
    };
}
