import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        try {
            // 1. Check for Admin/Staff session
            const session = localStorage.getItem('session');
            if (session) {
                const parsed = JSON.parse(session);
                const access_token = parsed?.access_token || parsed?.token;
                if (access_token) {
                    config.headers.Authorization = `Bearer ${access_token}`;
                    return config;
                }
            }

            // 2. Check for Credit Partner token
            const partnerToken = localStorage.getItem('partner_token');
            if (partnerToken) {
                config.headers.Authorization = `Bearer ${partnerToken}`;
                return config;
            }
        } catch (e) {
            console.error('Session/Token parse error:', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 400 || error.response?.status === 401) {
            const message = error.response?.data?.error || '';
            if (message.includes('token') || message.includes('Token')) {
                console.warn('Invalid token - clearing session');
                localStorage.removeItem('session');
                localStorage.removeItem('user');
                localStorage.removeItem('profile');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth Services
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    verifyLoginOTP: async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    },
    getProfile: async (id) => {
        const response = await api.get(`/auth/profile/${id}`);
        return response.data;
    },
    getAllProfiles: async () => {
        const response = await api.get('/auth/profiles');
        return response.data;
    },
    updateProfile: async (id, profileData) => {
        const response = await api.put(`/auth/profile/${id}`, profileData);
        return response.data;
    },
    changePassword: async (userId, currentPassword, newPassword) => {
        const response = await api.post('/auth/change-password', { userId, currentPassword, newPassword });
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.delete(`/auth/profile/${id}`);
        return response.data;
    }
};

// Lead Services
export const leadService = {
    getAllLeads: async (userId, role) => {
        const response = await api.get('/leads', { params: { userId, role } });
        return response.data;
    },
    createLead: async (leadData) => {
        const response = await api.post('/leads', leadData);
        return response.data;
    },
    updateStatus: async (leadId, statusData) => {
        const response = await api.patch(`/leads/${leadId}/status`, statusData);
        return response.data;
    },
    updateLead: async (leadId, leadData) => {
        const response = await api.put(`/leads/${leadId}`, leadData);
        return response.data;
    },
    sendFormLink: async (leadData) => {
        const response = await api.post('/leads/send-link', leadData);
        return response.data;
    },
    submitPublicForm: async (formData) => {
        const response = await api.post('/leads/public-submit', formData);
        return response.data;
    }
};

// Bank Services
export const bankService = {
    getAllBanks: async () => {
        const response = await api.get('/banks');
        return response.data;
    },
    addBank: async (bankData) => {
        const response = await api.post('/banks', bankData);
        return response.data;
    }
};

// Case Services
export const caseService = {
    getCaseByLead: async (leadId) => {
        const response = await api.get(`/cases/lead/${leadId}`);
        return response.data;
    },
    updateStage: async (stageData) => {
        const response = await api.post('/cases/update-stage', stageData);
        return response.data;
    },
    getAllHistory: async () => {
        const response = await api.get('/cases/history');
        return response.data;
    }
};

// Commission Services
export const commissionService = {
    getAll: async () => {
        const response = await api.get('/commissions');
        return response.data;
    }
};

// Document Services
export const documentService = {
    upload: async (formData) => {
        const response = await api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getForCase: async (leadId) => {
        const response = await api.get(`/documents/lead/${leadId}`);
        return response.data;
    },
    uploadPublicDocument: async (formData) => {
        const response = await api.post('/documents/public-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    },
    getAllTypes: async () => {
        const response = await api.get('/documents/types');
        return response.data;
    },
    createType: async (typeData) => {
        const response = await api.post('/documents/types', typeData);
        return response.data;
    },
    updateType: async (id, typeData) => {
        const response = await api.put(`/documents/types/${id}`, typeData);
        return response.data;
    },
    deleteType: async (id) => {
        const response = await api.delete(`/documents/types/${id}`);
        return response.data;
    }
};

// Notification Services
export const notificationService = {
    getAll: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    markRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },
    markAllRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    }
};

// Credit Partner Services
export const lendingPartnerService = {
    getAll: async () => {
        const response = await api.get('/lending-partners');
        return response.data;
    },
    create: async (partnerData) => {
        const response = await api.post('/lending-partners', partnerData);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/lending-partners/${id}`, data);
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.patch(`/lending-partners/${id}/status`, { status });
        return response.data;
    },
    resetPassword: async (id, password) => {
        const response = await api.patch(`/lending-partners/${id}/reset-password`, { password });
        return response.data;
    },
    login: async (email, password) => {
        const response = await api.post('/lending-partners/login', { email, password });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/lending-partners/${id}`);
        return response.data;
    },
    getStats: async (id) => {
        const response = await api.get(`/lending-partners/${id}/stats`);
        return response.data;
    },
    getLogs: async (id) => {
        const response = await api.get(`/lending-partners/${id}/logs`);
        return response.data;
    }
};

// Partner Profile Sharing Services
export const partnerProfileService = {
    share: async (shareData) => {
        const response = await api.post('/partner-profiles/share', shareData);
        return response.data;
    },
    getForPartner: async (partnerId) => {
        const response = await api.get(`/partner-profiles/partner/${partnerId}`);
        return response.data;
    },
    updateDecision: async (id, decisionData) => {
        const response = await api.patch(`/partner-profiles/${id}/decision`, decisionData);
        return response.data;
    },
    getLeadShares: async (leadId) => {
        const response = await api.get(`/partner-profiles/lead/${leadId}/shares`);
        return response.data;
    }
};

// Partner File Exchange Services
export const partnerFileService = {
    upload: async (fileData) => {
        const response = await api.post('/partner-files/upload', fileData);
        return response.data;
    },
    getForPartner: async (partnerId) => {
        const response = await api.get(`/partner-files/partner/${partnerId}`);
        return response.data;
    },
    getForLead: async (leadId) => {
        const response = await api.get(`/partner-files/lead/${leadId}`);
        return response.data;
    },
    updateDecision: async (id, decisionData) => {
        const response = await api.patch(`/partner-files/${id}/decision`, decisionData);
        return response.data;
    }
};

// Submission Services
export const submissionService = {
    getAll: async () => {
        const response = await api.get('/submissions');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/submissions/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/submissions/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/submissions/${id}`);
        return response.data;
    },
    convertToApplication: async (id) => {
        const response = await api.post(`/submissions/${id}/convert`);
        return response.data;
    }
};

// Application Services
export const applicationService = {
    getAll: async () => {
        const response = await api.get('/applications');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/applications/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/applications/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/applications/${id}`);
        return response.data;
    },
    addNote: async (id, note) => {
        const response = await api.post(`/applications/${id}/notes`, { note });
        return response.data;
    }
};

// Dashboard Services
export const dashboardService = {
    getStats: async (userId, role) => {
        const response = await api.get('/dashboard/stats', { params: { userId, role } });
        return response.data;
    }
};

// Profile Services
export const profileService = {
    getStats: async (userId) => {
        const response = await api.get('/profile/stats', { params: { userId } });
        return response.data;
    },
    update: async (userId, data) => {
        const response = await api.post('/profile/update', { userId, ...data });
        return response.data;
    },
    updateGoals: async (userId, goals) => {
        const response = await api.post('/profile/update-goals', { userId, goals });
        return response.data;
    },
    uploadAvatar: async (userId, avatarUrl) => {
        const response = await api.post('/profile/upload-avatar', { userId, avatarUrl });
        return response.data;
    },
    getAllEmployees: async () => {
        const response = await api.get('/profile/employees');
        return response.data;
    }
};

// Treasury Services (Inflow/Outflow)
export const inflowService = {
    getAll: async () => {
        const response = await api.get('/inflow');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/inflow', data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/inflow/${id}`);
        return response.data;
    }
};

export const outflowService = {
    getAll: async () => {
        const response = await api.get('/outflow');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/outflow', data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/outflow/${id}`);
        return response.data;
    }
};

// Help Desk / Support Services
export const supportService = {
    createTicket: async (ticketData) => {
        const response = await api.post('/support/tickets', ticketData);
        return response.data;
    },
    getTickets: async (userId, userType) => {
        const response = await api.get('/support/tickets', { params: { userId, userType } });
        return response.data;
    },
    getMessages: async (ticketId) => {
        const response = await api.get(`/support/tickets/${ticketId}/messages`);
        return response.data;
    },
    sendMessage: async (messageData) => {
        const response = await api.post('/support/messages', messageData);
        return response.data;
    },
    updateStatus: async (ticketId, status) => {
        const response = await api.patch(`/support/tickets/${ticketId}/status`, { status });
        return response.data;
    }
};

// Tracking Module Services (Incoming/Outgoing)
export const trackingService = {
    uploadPackage: async (packageData) => {
        // packageData contains: { partner_id, direction, package_name, file_data (base64) }
        const response = await api.post('/tracking/upload', packageData);
        return response.data;
    },
    getPackagesByPartner: async (partnerId, direction) => {
        const response = await api.get(`/tracking/partner/${partnerId}`, { params: { direction } });
        return response.data;
    },
    updateStatus: async (type, id, status, note, actorId) => {
        const response = await api.patch(`/tracking/status/${type}/${id}`, { status, note, actor_id: actorId });
        return response.data;
    },
    grantDownload: async (docId, adminId) => {
        const response = await api.patch(`/tracking/grant-download/${docId}`, { admin_id: adminId });
        return response.data;
    },
    bulkStatusUpdate: async (type, ids, status, note, actorId) => {
        const response = await api.patch('/tracking/bulk-status', { type, ids, status, note, actor_id: actorId });
        return response.data;
    },
    assignPackage: async (id, data) => {
        const response = await api.patch(`/tracking/assign/${id}`, data);
        return response.data;
    },
    requestDownload: async (docId, partnerId) => {
        const response = await api.post(`/tracking/request-download/${docId}`, { partner_id: partnerId });
        return response.data;
    },
    sendMessage: async (packageId, messageData) => {
        const response = await api.post(`/tracking/chat/${packageId}`, messageData);
        return response.data;
    },
    getDownloadRequests: async () => {
        const response = await api.get('/tracking/download-requests');
        return response.data;
    },
    deleteDocument: async (docId, userId, userRole) => {
        const response = await api.delete(`/tracking/documents/${docId}`, {
            data: { user_id: userId, user_role: userRole }
        });
        return response.data;
    },
    approveDownloadRequest: async (requestId, docId) => {
        const response = await api.post(`/tracking/approve-download/${docId}`, { requestId });
        return response.data;
    },
    deletePackage: async (packageId, userId, userRole) => {
        const response = await api.delete(`/tracking/packages/${packageId}`, {
            data: { user_id: userId, user_role: userRole }
        });
        return response.data;
    }
};

// Case Document Exchange (Internal)
export const zipService = {
    getTransactions: async (params = {}) => {
        const response = await api.get('/zip-transactions', { params });
        return response.data;
    },
    getTransactionsByPartner: async (partnerId, direction) => {
        const response = await api.get('/zip-transactions', { params: { partnerId, direction } });
        return response.data;
    },
    getForCase: async (leadId) => {
        const response = await api.get('/zip-transactions', { params: { leadId } });
        return response.data;
    },
    getTransaction: async (id) => {
        const response = await api.get(`/zip-transactions/${id}`);
        return response.data;
    },
    upload: async (formData) => {
        const response = await api.post('/zip-transactions/upload', formData, {
            headers: { 
                'Content-Type': undefined
            }
        });
        return response.data;
    },
    downloadDocument: async (docId) => {
        const response = await api.get(`/zip-transactions/documents/${docId}/download`);
        return response.data;
    },
    previewDocument: async (docId) => {
        const response = await api.get(`/zip-transactions/documents/${docId}/preview`);
        return response.data;
    },
    streamDocument: async (docId) => {
        const response = await api.get(`/zip-transactions/documents/${docId}/stream`, { responseType: 'blob' });
        return response.data;
    },
    deleteDocument: async (docId) => {
        const response = await api.delete(`/zip-transactions/documents/${docId}`);
        return response.data;
    },
    updateDocumentStatus: async (docId, data) => {
        const response = await api.patch(`/zip-transactions/documents/${docId}/status`, data);
        return response.data;
    },
    updateTransactionStatus: async (id, status) => {
        const response = await api.patch(`/zip-transactions/${id}/status`, { status });
        return response.data;
    },
    getMessages: async (transactionId) => {
        const response = await api.get(`/zip-transactions/${transactionId}/messages`);
        return response.data;
    },
    sendMessage: async (transactionId, message) => {
        const response = await api.post(`/zip-transactions/${transactionId}/messages`, { message });
        return response.data;
    },
    requestDownload: async (transactionId) => {
        const response = await api.post('/zip-transactions/download-request', { transactionId });
        return response.data;
    },
    getDownloadRequests: async () => {
        const response = await api.get('/zip-transactions/download-requests');
        return response.data;
    },
    approveDownloadRequest: async (id) => {
        const response = await api.patch(`/zip-transactions/download-requests/${id}/approve`);
        return response.data;
    },
    rejectDownloadRequest: async (id, reason) => {
        const response = await api.patch(`/zip-transactions/download-requests/${id}/reject`, { reason });
        return response.data;
    },
    deleteTransaction: async (id) => {
        const response = await api.delete(`/zip-transactions/${id}`);
        return response.data;
    }
};

export default api;
