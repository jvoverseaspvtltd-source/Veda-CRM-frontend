import React, { createContext, useContext, useState, useEffect } from 'react';

const PartnerAuthContext = createContext(null);

export const PartnerAuthProvider = ({ children }) => {
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            // Priority 1: Partner-specific keys
            let savedPartner = localStorage.getItem('partner');
            let token = localStorage.getItem('partner_token');
            
            // Priority 2: Fallback to unified session if user type is Partner
            if (!token || !savedPartner) {
                const unifiedSession = localStorage.getItem('session');
                const userType = localStorage.getItem('user_type');
                if (unifiedSession && userType === 'Partner') {
                    const sessionData = JSON.parse(unifiedSession);
                    token = sessionData.access_token;
                    savedPartner = localStorage.getItem('profile');
                    
                    // Synchronize for consistency
                    if (token) localStorage.setItem('partner_token', token);
                    if (savedPartner) localStorage.setItem('partner', savedPartner);
                }
            }

            if (savedPartner && savedPartner !== 'undefined' && token) {
                setPartner(JSON.parse(savedPartner));
            }
        } catch (e) {
            console.error('Failed to parse partner session:', e);
            localStorage.removeItem('partner');
            localStorage.removeItem('partner_token');
        }
        setLoading(false);
    }, []);

    const login = (partnerData, token) => {
        localStorage.setItem('partner', JSON.stringify(partnerData));
        localStorage.setItem('partner_token', token);
        setPartner(partnerData);
    };

    const logout = () => {
        localStorage.removeItem('partner');
        localStorage.removeItem('partner_token');
        setPartner(null);
    };

    return (
        <PartnerAuthContext.Provider value={{ partner, login, logout, loading }}>
            {children}
        </PartnerAuthContext.Provider>
    );
};

export const usePartnerAuth = () => useContext(PartnerAuthContext);
