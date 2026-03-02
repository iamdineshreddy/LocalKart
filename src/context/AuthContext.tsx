import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { getCurrentLocation, storeLocation } from '../utils/location';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller' | 'delivery_partner' | 'admin';
    isVerified: boolean;
    addresses?: any[];
    kyc?: {
        status: string;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (phone: string, otp: string) => Promise<void>;
    requestOTP: (phone: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const { user } = await api.getCurrentUser();
            setUser(user);

            // Update location
            try {
                const location = await getCurrentLocation();
                storeLocation(location.latitude, location.longitude);
                await api.updateLocation(location.latitude, location.longitude);
            } catch (error) {
                console.log('Location error:', error);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
        } finally {
            setIsLoading(false);
        }
    };

    const requestOTP = async (phone: string) => {
        await api.requestOTP(phone);
    };

    const login = async (phone: string, otp: string) => {
        const { user: userData } = await api.verifyOTP(phone, otp);
        setUser(userData);
    };

    const logout = () => {
        api.logout();
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...data } : null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                requestOTP,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
