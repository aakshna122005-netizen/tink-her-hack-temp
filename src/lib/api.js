import axios from 'axios';
import { IS_DEMO_MODE } from '@/lib/demo-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 8000, // 8s timeout so demo fallback kicks in quickly
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && token !== 'demo-token-000') {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401s — skip redirect in demo mode
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!IS_DEMO_MODE && error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default api;
