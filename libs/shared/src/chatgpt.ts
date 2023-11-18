export type ExpectedChatGPTComponentOutput = {
    type: string;
    class: string;
    label: string;
    orderX: number;
    orderY: number;
};

export type ExpectedChatGPTOutput = ExpectedChatGPTComponentOutput[][];
