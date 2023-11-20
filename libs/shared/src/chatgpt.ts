export type ExpectedChatGPTOutput = {
    name: string;
    components: {
        type: string;
        class: string;
        label: string;
        orderX: number;
        orderY: number;
    }[][];
};
