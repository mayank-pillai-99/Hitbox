'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Load user on start
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // We don't have a /me endpoint yet, but usually we'd fetch user data here.
                    // For now, we'll decode the token or just trust it exists until it fails.
                    // Ideally, add a GET /api/auth/me endpoint to backend.
                    // Assuming we might add that later, strictly for now let's just keep 'loading' false if no token.
                    // Actually, let's keep it simple: if token exists, we are "logged in" for UI purposes,
                    // but real verification happens on API calls.
                    // BETTER: Let's assume we store user info in localStorage too for now or fetch it.
                } catch (error) {
                    console.error("Auth load error", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        // Ideally fetch user data here
        setUser({ email }); // Temporary, update when we have user data endpoint
        router.push('/');
    };

    const signup = async (username, email, password) => {
        const res = await api.post('/auth/register', { username, email, password });
        localStorage.setItem('token', res.data.token);
        setUser({ username, email });
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
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
