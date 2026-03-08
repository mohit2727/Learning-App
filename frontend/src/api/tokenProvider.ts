let globalGetToken: (() => Promise<string | null>) | null = null;

export const setGlobalTokenProvider = (provider: () => Promise<string | null>) => {
    globalGetToken = provider;
};

export const getAuthToken = async (): Promise<string | null> => {
    if (globalGetToken) {
        return await globalGetToken();
    }
    return null;
};
