export const ImageEvents = {
    /**
     * Output of LLM
     */
    OBJECT_DETECTION_COMPLETED: 'OBJECT_DETECTION_COMPLETED',
    /**
     * Output Azure Vision
     */
    TEXT_DETECTION_COMPLETED: 'TEXT_DETECTION_COMPLETED',
    /**
     * Output ChatGPT
     */
    STRUCTURE_GENERATION_COMPLETED: 'STRUCTURE_GENERATION_COMPLETED',
} as const;
