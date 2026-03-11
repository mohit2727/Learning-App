import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// For Android emulator, use 10.0.2.2. For iOS or real device, use your local IP.
const API_URL = 'http://10.80.127.71:5000/api';

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
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
