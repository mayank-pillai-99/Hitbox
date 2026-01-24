'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                api.defaults.headers.common['x-auth-token'] = token;
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                } catch (err) {
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        localStorage.removeItem('token');
                        delete api.defaults.headers.common['x-auth-token'];
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['x-auth-token'] = data.token;

        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        router.push('/');
    };

    const signup = async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['x-auth-token'] = data.token;
        setUser({ username, email }); // Optimistic set or fetch me? Better to just redirect.
        // Actually the original code just set {username, email} which is risky if ID is needed immediately.
        // I'll stick to original behavior for Zero Regression.
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['x-auth-token'];
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
