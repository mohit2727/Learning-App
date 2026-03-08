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

// We need to fetch the token Clerk uses. Clerk's key format is usually `__clerk_client_jwt`.
// However, the easiest way to inject the hook into Axios is to either pass it from a component 
// or read SecureStore directly if we know the key.
// But another robust way is to export a function to set the token globally, or just read it from SecureStore.

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
