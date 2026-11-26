import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SESSION_KEY, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearSession = async () => {
        try {
            await SecureStore.deleteItemAsync(SESSION_KEY);
        } catch (error) {
            console.error('Error eliminando sesión:', error);
        } finally {
            setSession(null);
        }
    };

    useEffect(() => {
        setUnauthorizedHandler(() => {
            setSession(null);
        });

        const checkSession = async () => {
            try {
                const stored = await SecureStore.getItemAsync(SESSION_KEY);
            if (stored) {
                setSession(JSON.parse(stored));
            }
            } catch (error) {
                console.error('Error verificando sesión:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    const saveSession = async (sessionData) => {
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));
        setSession(sessionData);
    };

    return (
        <AuthContext.Provider
        value={{
            session,
            user: session?.user || null,
            token: session?.token || null,
            isLoading,
            saveSession,
            logout: clearSession,
        }}
        >
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);