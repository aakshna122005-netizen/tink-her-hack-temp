'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { IS_DEMO_MODE, DEMO_USER } from '@/lib/demo-data';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (IS_DEMO_MODE) {
            // In demo mode, restore session from localStorage
            const demoSession = localStorage.getItem('demo_user');
            if (demoSession) {
                setUser(JSON.parse(demoSession));
            }
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
            getSocket(localStorage.getItem('token'));
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        // Demo mode login — accepts any credential
        if (IS_DEMO_MODE) {
            const demoUser = { ...DEMO_USER, email };
            localStorage.setItem('demo_user', JSON.stringify(demoUser));
            localStorage.setItem('token', 'demo-token-000');
            setUser(demoUser);
            return demoUser;
        }

        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        getSocket(data.token);
        return data.user;
    };

    const register = async (name, email, password) => {
        // Demo mode registration — succeeds immediately
        if (IS_DEMO_MODE) {
            const demoUser = { ...DEMO_USER, name, email };
            localStorage.setItem('demo_user', JSON.stringify(demoUser));
            localStorage.setItem('token', 'demo-token-000');
            setUser(demoUser);
            return demoUser;
        }

        const { data } = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        getSocket(data.token);
        return data.user;
    };

    const selectRole = async (role) => {
        if (IS_DEMO_MODE) {
            const updated = { ...user, role, onboarded: true };
            localStorage.setItem('demo_user', JSON.stringify(updated));
            setUser(updated);
            return updated;
        }
        const { data } = await api.post('/auth/select-role', { role });
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('demo_user');
        setUser(null);
        if (!IS_DEMO_MODE) disconnectSocket();
    };

    const updateUser = (updates) => {
        setUser((prev) => ({ ...prev, ...updates }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, selectRole, logout, updateUser, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
