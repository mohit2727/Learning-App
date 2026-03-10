import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
});

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error.message;
        const config = error.config;

        // 401 — redirect to login
        if (status === 401 && typeof window !== 'undefined') {
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // 5xx — retry once after 1 second
        if (status >= 500 && !config._retried) {
            config._retried = true;
            await new Promise(r => setTimeout(r, 1000));
            return api(config);
        }

        // 429 — rate limited
        if (status === 429) {
            return Promise.reject(new Error('Too many requests. Please try again later.'));
        }

        return Promise.reject(new Error(message || 'An unexpected error occurred.'));
    }
);

export default api;
