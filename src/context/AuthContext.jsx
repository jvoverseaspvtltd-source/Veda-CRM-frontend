import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage to avoid hydration mismatch
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    
    const [profile, setProfile] = useState(() => {
        try {
            const savedProfile = localStorage.getItem('profile');
            return savedProfile ? JSON.parse(savedProfile) : null;
        } catch {
            return null;
        }
    });
    
    const [loading, setLoading] = useState(false);

    // Helper check for role-based access
    const hasRole = useMemo(() => (roles) => {
        if (!profile) return false;
        return roles.includes(profile.role);
    }, [profile]);

    const signIn = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            
            if (data.user && data.profile) {
                setUser(data.user);
                setProfile(data.profile);
                
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('profile', JSON.stringify(data.profile));
                localStorage.setItem('session', JSON.stringify(data.session));
                localStorage.setItem('user_type', data.user_type);

                if (data.user_type === 'Partner') {
                    localStorage.setItem('partner', JSON.stringify(data.profile));
                    localStorage.setItem('partner_token', data.session.access_token);
                }
            }

            return { data, error: null };
        } catch (error) {
            console.error('Login failed:', error);
            const responseData = error.response?.data || {};
            return {
                data: null,
                error: responseData.error || 'Login failed'
            };
        }
    };

    const verifySignIn = async (email, otp) => {
        try {
            const data = await authService.verifyLoginOTP(email, otp);
            setUser(data.user);
            setProfile(data.profile);

            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('profile', JSON.stringify(data.profile));
            localStorage.setItem('session', JSON.stringify(data.session));

            return { data, error: null };
        } catch (error) {
            console.error('OTP Verification failed:', error);
            return {
                data: null,
                error: error.response?.data?.error || 'Invalid OTP'
            };
        }
    };

    const signOut = () => {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        localStorage.removeItem('session');
        localStorage.removeItem('user_type');
        localStorage.removeItem('partner');
        localStorage.removeItem('partner_token');
    };

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        signIn,
        verifySignIn,
        signOut,
        hasRole
    }), [user, profile, loading, hasRole]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
