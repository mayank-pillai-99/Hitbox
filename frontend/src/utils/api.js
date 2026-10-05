import axios from 'axios';
import { trackRequest } from './pendingRequests';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api', // Fallback to local for dev if safely needed, but env file should handle it.
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to requests
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['x-auth-token'] = token;
            }
        }
        // Start timing the request; the response interceptors below stop it.
        config.finishTracking = trackRequest();
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        response.config.finishTracking?.();
        return response;
    },
    (error) => {
        error.config?.finishTracking?.();
        return Promise.reject(error);
    }
);

export default api;
