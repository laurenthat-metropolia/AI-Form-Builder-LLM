export type ExpectedChatGPTOutputForFinalJSON = {
    name: string;
    components: {
        type: string;
        class: string;
        label: string;
    }[];
};
