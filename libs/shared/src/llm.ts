export type ObjectDetectionResponseItem = {
    class: string;
    coordinates: [number, number, number, number];
};

export type ObjectDetectionResponse = ObjectDetectionResponseItem[];
