export type ObjectDetectionResponseItem = {
    confidence: number;
    class: string;
    class_id: number;
    coordinates: [number, number, number, number];
};

export type ObjectDetectionResponse = ObjectDetectionResponseItem[];
