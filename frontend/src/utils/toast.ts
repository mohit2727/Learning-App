import Toast from 'react-native-toast-message';

export const showToast = (type: 'success' | 'error' | 'info', text1: string, text2?: string) => {
    Toast.show({
        type,
        text1,
        text2,
        position: 'top',
        topOffset: 60,
        visibilityTime: 4000,
    });
};

export const toast = {
    success: (text1: string, text2?: string) => showToast('success', text1, text2),
    error: (text1: string, text2?: string) => showToast('error', text1, text2),
    info: (text1: string, text2?: string) => showToast('info', text1, text2),
};
