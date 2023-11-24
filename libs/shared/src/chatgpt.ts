export type ExpectedChatGPTOutputForFinalJSON = {
    name: string;
    components: {
        type: string;
        kind: string;
        label: string;
    }[];
};
