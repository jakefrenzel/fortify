'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import type { User, AuthContextType } from '@/types/auth';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Check if user is authenticated
    const checkAuth = async () => {
        try {
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);

        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (username: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            
            const response = await authAPI.login({ username, password });
            
            if (response.user) {
                setUser(response.user);
            }
        } catch (err:  any) {
            setError(err.message);
            throw err; // Re-throw so components can handle it
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = async () => {
        try {
            setError(null);

            await authAPI.logout();
            setUser(null);

        } catch (err: any) {
            setError(err.message);
            console.error('Logout error:', err);
        }
    };

const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}