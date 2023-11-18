export const safeParse = (input: any): any => {
    try {
        return JSON.parse(input);
    } catch (e) {
        return null;
    }
};
