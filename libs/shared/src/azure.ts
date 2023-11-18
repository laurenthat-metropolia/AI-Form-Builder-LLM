export type AzureVisionOperationResponse =
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

export type TextDetectionResponseItem = {
    text: string;
    coordinates: [number, number, number, number];
};

export type TextDetectionResponse = TextDetectionResponseItem[];
