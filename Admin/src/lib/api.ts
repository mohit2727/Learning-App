import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
});

// ─── Token Management ────────────────────────────────────────────────────────
let _token: string | null = null;
let _getToken: (() => Promise<string | null>) | null = null;

export const setAuthToken = (token: string | null) => { _token = token; };
export const setTokenRefresher = (fn: () => Promise<string | null>) => { _getToken = fn; };

// ─── Request Interceptor: attach token ──────────────────────────────────────
api.interceptors.request.use(async (config) => {
    if (_getToken) {
        try {
            const fresh = await _getToken();
            if (fresh) _token = fresh;
        } catch { /* keep existing */ }
    }
    if (_token) {
        config.headers.Authorization = `Bearer ${_token}`;
    }
    return config;
});

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || error.message;
        const config = error.config;

        // 401 — Unauthorized
        if (status === 401) {
            console.error('[API 401] Unauthorized request. Possibly missing Firebase Service Account in Backend.');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                // Only redirect if not already on login
                // window.location.href = '/login'; 
            }
            return Promise.reject(new Error('Unauthorized. Please check Backend Firebase configuration.'));
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

