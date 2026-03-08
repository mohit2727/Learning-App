import apiClient from './apiClient';

export const authService = {
    sendOTP: async (mobile: string) => {
        const response = await apiClient.post('/users/send-otp', { mobile });
        return response.data;
    },

    verifyOTP: async (mobile: string, otp: string) => {
        const response = await apiClient.post('/users/verify-otp', { mobile, otp });
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/users/profile');
        return response.data;
    },
};
