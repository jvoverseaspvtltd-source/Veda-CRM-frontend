import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedProfile = localStorage.getItem('profile');

        if (savedUser && savedProfile) {
            setUser(JSON.parse(savedUser));
            setProfile(JSON.parse(savedProfile));
        }
        setLoading(false);
    }, []);

    const signIn = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            
            // Unified session handling
            if (data.user && data.profile) {
                setUser(data.user);
                setProfile(data.profile);
                
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('profile', JSON.stringify(data.profile));
                localStorage.setItem('session', JSON.stringify(data.session));
                localStorage.setItem('user_type', data.user_type);

                // For legacy compatibility with partner components
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

            // Save to local storage for persistence
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('profile', JSON.stringify(data.profile));
            localStorage.setItem('session', JSON.stringify(data.session));

            return { data, error: null };
        } catch (error) {
            console.error('OTP Verification failed (Step 2):', error);
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

    // Helper check for role-based access
    const hasRole = (roles) => {
        if (!profile) return false;
        return roles.includes(profile.role);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signIn, verifySignIn, signOut, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
