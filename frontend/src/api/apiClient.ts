import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// For Android emulator, use 10.0.2.2. For iOS or real device, use your local IP.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://learning-app-4xa9.onrender.com/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

import { getItemAsync } from '../utils/storage';

// Token is managed and synchronized via AuthSync component using the tokenProvider.ts

import { getAuthToken } from './tokenProvider';

apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await getAuthToken();
            console.log("Axios Interceptor Token:", token ? "Token is present" : "Token is null or undefined");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error setting auth token", error);
        }
        return config;
    },
);
import Toast from 'react-native-toast-message';

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const { config, response } = error;

        // Handle 401 Unauthorized
        if (response && response.status === 401) {
            console.error("Unauthorized (401)");
            Toast.show({
                type: 'error',
                text1: 'Session Expired',
                text2: 'Please log in again.'
            });
            // Optional: trigger logout/redirect
            return Promise.reject(error);
        }

        // Handle 429 Too Many Requests
        if (response && response.status === 429) {
            console.error("Rate limit hit (429)");
            Toast.show({
                type: 'error',
                text1: 'Too Many Requests',
                text2: 'Please try again in a few minutes.'
            });
            return Promise.reject(new Error("Too many requests. Please try again in a few minutes."));
        }

        // Retry logic for 5xx errors
        if (response && response.status >= 500 && !config._retry) {
            config._retry = true;
            console.log("Retrying request due to 5xx error...");
            return new Promise(resolve => {
                setTimeout(() => resolve(apiClient(config)), 2000);
            });
        }

        // Generic error toast for non-component level calls if needed
        if (!response) {
            Toast.show({
                type: 'error',
                text1: 'Network Error',
                text2: 'Please check your internet connection.'
            });
        }

        return Promise.reject(error);
    }
);

export default apiClient;
