import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Make sure this matches your backend URL
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
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
