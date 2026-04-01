import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Tooltip,
    Grid,
    Stack,
    Avatar,
    alpha,
    useTheme,
    InputAdornment,
    Divider,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Snackbar,
} from '@mui/material';
import {
    Plus,
    Edit,
    Power,
    Search,
    Mail,
    Phone,
    ExternalLink,
    History,
    Eye,
    EyeOff,
    Copy,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    TrendingUp,
    Building2,
    KeyRound,
    MapPin,
    UserCircle,
    Download,
    CheckCircle2,
    Info,
    Lock,
    Shield,
    Globe,
    User
} from 'lucide-react';
import { lendingPartnerService, bankService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Document, 
    Page, 
    Text, 
    View, 
    StyleSheet, 
    PDFDownloadLink, 
    Image, 
    Font 
} from '@react-pdf/renderer';

// Register a clean font for PDF
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCOjAkZ986L5GVpUlSdyLxBQYZ-ZA.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcC7jAkZ986L5GVpMYRSWpLO6vmDdBvFAmNJ1A.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcC7jAkZ986L5GVpMYRSWpLO6vmDdBvFAmNJ1A.ttf', fontWeight: 700 }, // Bold
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcC7jAkZ986L5GVpjt8SdyLxBQYZ-ZA.ttf', fontWeight: 900 }
    ]
});

// ─── PDF Document Component (Premium Finance Style) ─────────────────────────
const PDFStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#ffffff' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 30, 
        borderBottomWidth: 2, 
        borderBottomColor: '#0f172a', 
        paddingBottom: 20 
    },
    logoSection: { flexDirection: 'column' },
    logoLabel: { fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: -1 },
    headerSubtitle: { fontSize: 10, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1.5 },
    badge: { 
        backgroundColor: '#f0fdf4', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 6, 
        border: '1px solid #dcfce7' 
    },
    badgeText: { fontSize: 9, color: '#166534', fontWeight: 700, letterSpacing: 0.5 },

    divider: { 
        height: 4, 
        backgroundColor: '#2563eb', 
        marginBottom: 25 
    },

    titleSection: { marginBottom: 30 },
    mainTitle: { fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
    subTitle: { fontSize: 11, color: '#64748b' },
    docId: { fontSize: 9, color: '#94a3b8', marginTop: 4 },

    section: { marginBottom: 25 },
    sectionHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15,
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 8
    },
    sectionLabel: { fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 },
    sectionIcon: { marginRight: 8 },
    
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
    fieldBox: { width: '47%', marginBottom: 15 },
    fieldLabel: { fontSize: 8, color: '#94a3b8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
    fieldValue: { fontSize: 11, color: '#1e293b', fontWeight: 600 },
    fieldValueLarge: { fontSize: 13, color: '#0f172a', fontWeight: 700 },

    credentialCard: { 
        backgroundColor: '#f8fafc', 
        borderRadius: 10, 
        padding: 20, 
        border: '1px solid #e2e8f0',
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
        marginTop: 10,
        marginBottom: 20
    },
    credentialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
    credentialDivider: { 
        borderBottom: '1px dashed #cbd5e1', 
        marginVertical: 15 
    },
    passwordBox: { 
        backgroundColor: '#ffffff', 
        border: '2px dashed #2563eb', 
        padding: 15, 
        marginTop: 12, 
        alignItems: 'center',
        borderRadius: 8
    },
    passwordLabel: { fontSize: 9, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
    passwordText: { fontSize: 18, fontWeight: 700, color: '#dc2626', letterSpacing: 3 },

    accessCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 8,
        padding: 15,
        marginTop: 10,
        border: '1px solid #bfdbfe'
    },
    accessRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
    accessLabel: { fontSize: 9, color: '#1e40af', fontWeight: 600, width: 100 },
    accessValue: { fontSize: 10, color: '#1e293b', fontWeight: 700, flex: 1 },

    supportCard: {
        backgroundColor: '#fefce8',
        borderRadius: 8,
        padding: 15,
        marginTop: 15,
        border: '1px solid #fef08a'
    },
    supportTitle: { fontSize: 10, fontWeight: 700, color: '#854d0e', marginBottom: 10 },
    supportRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
    supportLabel: { fontSize: 9, color: '#92400e', width: 120 },
    supportValue: { fontSize: 10, color: '#713f12', fontWeight: 600 },

    noteBox: { 
        backgroundColor: '#fef3c7', 
        padding: 12, 
        borderRadius: 6, 
        marginTop: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b'
    },
    noteText: { fontSize: 9, color: '#92400e', lineHeight: 1.5 },

    nextSteps: {
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
        padding: 15,
        marginTop: 15,
        border: '1px solid #bbf7d0'
    },
    nextStepsTitle: { fontSize: 10, fontWeight: 700, color: '#166534', marginBottom: 8 },
    stepRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
    stepNumber: { 
        width: 18, 
        height: 18, 
        borderRadius: 9, 
        backgroundColor: '#10b981', 
        color: '#fff', 
        fontSize: 9, 
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: 18,
        marginRight: 8
    },
    stepText: { fontSize: 9, color: '#166534', flex: 1, lineHeight: 1.4 },

    footer: { 
        position: 'absolute', 
        bottom: 30, 
        left: 40, 
        right: 40, 
        borderTopWidth: 1, 
        borderTopColor: '#f1f5f9', 
        paddingTop: 15, 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    },
    footerLeft: { flexDirection: 'column' },
    footerRight: { alignItems: 'flex-end' },
    footerText: { fontSize: 8, color: '#94a3b8', marginBottom: 2 },
    footerConfidential: { fontSize: 9, color: '#dc2626', fontWeight: 700 }
});

const CredentialsPDF = ({ creds, createdBy }) => (
    <Document>
        <Page size="A4" style={PDFStyles.page}>
            {/* Header */}
            <View style={PDFStyles.header}>
                <View style={PDFStyles.logoSection}>
                    <Text style={PDFStyles.logoLabel}>VEDA CRM</Text>
                    <Text style={PDFStyles.headerSubtitle}>Premium Credit Partner Onboarding</Text>
                </View>
                <View style={PDFStyles.badge}>
                    <Text style={PDFStyles.badgeText}>CREDIT PARTNER ACCESS</Text>
                </View>
            </View>

            {/* Accent Divider */}
            <View style={PDFStyles.divider} />

            {/* Title */}
            <View style={PDFStyles.titleSection}>
                <Text style={PDFStyles.mainTitle}>Credit Partner Access Credentials</Text>
                <Text style={PDFStyles.subTitle}>Official onboarding credentials for the Veda Loans Credit Partner Portal</Text>
                <Text style={PDFStyles.docId}>Document ID: {creds.partner_id} | Issued: {new Date(creds.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</Text>
            </View>

            {/* Partner Information */}
            <View style={PDFStyles.section}>
                <View style={PDFStyles.sectionHeader}>
                    <Text style={PDFStyles.sectionLabel}>01. Partner Information</Text>
                </View>
                <View style={PDFStyles.grid}>
                    <View style={PDFStyles.fieldBox}>
                        <Text style={PDFStyles.fieldLabel}>Company / Business Name</Text>
                        <Text style={PDFStyles.fieldValueLarge}>{creds.company_name}</Text>
                    </View>
                    <View style={PDFStyles.fieldBox}>
                        <Text style={PDFStyles.fieldLabel}>Partner ID</Text>
                        <Text style={PDFStyles.fieldValueLarge}>{creds.partner_id}</Text>
                    </View>
                    <View style={PDFStyles.fieldBox}>
                        <Text style={PDFStyles.fieldLabel}>Partner Type</Text>
                        <Text style={PDFStyles.fieldValue}>{creds.partner_type || 'Credit Partner'}</Text>
                    </View>
                    <View style={PDFStyles.fieldBox}>
                        <Text style={PDFStyles.fieldLabel}>Branch / Location</Text>
                        <Text style={PDFStyles.fieldValue}>{creds.branch_name || 'Headquarters'}</Text>
                    </View>
                    <View style={PDFStyles.fieldBox}>
                        <Text style={PDFStyles.fieldLabel}>Contact Person</Text>
                        <Text style={PDFStyles.fieldValue}>{creds.full_name || creds.company_name}</Text>
                    </View>
                    <View style={PDFStyles.fieldBox}>
                        <Text style={PDFStyles.fieldLabel}>System Role</Text>
                        <Text style={PDFStyles.fieldValue}>{creds.role || 'Credit Partner'}</Text>
                    </View>
                </View>
            </View>

            {/* Login Credentials */}
            <View style={PDFStyles.section}>
                <View style={PDFStyles.sectionHeader}>
                    <Text style={PDFStyles.sectionLabel}>02. Portal Login Credentials</Text>
                </View>
                <View style={PDFStyles.credentialCard}>
                    <View style={PDFStyles.credentialRow}>
                        <View>
                            <Text style={PDFStyles.fieldLabel}>Portal Username (Corporate Email)</Text>
                            <Text style={PDFStyles.fieldValueLarge}>{creds.email}</Text>
                        </View>
                    </View>
                    
                    <View style={PDFStyles.credentialDivider} />
                    
                    <View style={PDFStyles.passwordBox}>
                        <Text style={PDFStyles.passwordLabel}>Initial Generated Password (One-Time)</Text>
                        <Text style={PDFStyles.passwordText}>{creds.password}</Text>
                    </View>

                    <View style={PDFStyles.noteBox}>
                        <Text style={PDFStyles.noteText}>
                            <Text style={{ fontWeight: 700 }}>SECURITY NOTICE:</Text> This is a system-generated one-time password. The partner MUST change their password immediately upon first login to the portal. Do not share these credentials with unauthorized personnel.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Portal Access Information */}
            <View style={PDFStyles.section}>
                <View style={PDFStyles.sectionHeader}>
                    <Text style={PDFStyles.sectionLabel}>03. Portal Access Information</Text>
                </View>
                <View style={PDFStyles.accessCard}>
                    <View style={PDFStyles.accessRow}>
                        <Text style={PDFStyles.accessLabel}>Portal URL</Text>
                        <Text style={PDFStyles.accessValue}>veda-partner-portal.onrender.com</Text>
                    </View>
                    <View style={PDFStyles.accessRow}>
                        <Text style={PDFStyles.accessLabel}>API Base URL</Text>
                        <Text style={PDFStyles.accessValue}>api.vedaloans.in/v1</Text>
                    </View>
                    <View style={PDFStyles.accessRow}>
                        <Text style={PDFStyles.accessLabel}>Access Level</Text>
                        <Text style={PDFStyles.accessValue}>Credit Partner - External</Text>
                    </View>
                </View>
            </View>

            {/* Support Information */}
            <View style={PDFStyles.supportCard}>
                <Text style={PDFStyles.supportTitle}>Dedicated Support Contact</Text>
                <View style={PDFStyles.supportRow}>
                    <Text style={PDFStyles.supportLabel}>Support Email</Text>
                    <Text style={PDFStyles.supportValue}>support@vedaloans.in</Text>
                </View>
                <View style={PDFStyles.supportRow}>
                    <Text style={PDFStyles.supportLabel}>Partner Helpline</Text>
                    <Text style={PDFStyles.supportValue}>+91 11 4567 8900</Text>
                </View>
                <View style={PDFStyles.supportRow}>
                    <Text style={PDFStyles.supportLabel}>Relationship Manager</Text>
                    <Text style={PDFStyles.supportValue}>{createdBy || 'Veda CRM Team'}</Text>
                </View>
            </View>

            {/* Next Steps */}
            <View style={PDFStyles.nextSteps}>
                <Text style={PDFStyles.nextStepsTitle}>Important Next Steps</Text>
                <View style={PDFStyles.stepRow}>
                    <Text style={PDFStyles.stepNumber}>1</Text>
                    <Text style={PDFStyles.stepText}>Share these credentials securely with the credit partner via encrypted email or secure messaging.</Text>
                </View>
                <View style={PDFStyles.stepRow}>
                    <Text style={PDFStyles.stepNumber}>2</Text>
                    <Text style={PDFStyles.stepText}>Partner must change their password immediately upon first portal login.</Text>
                </View>
                <View style={PDFStyles.stepRow}>
                    <Text style={PDFStyles.stepNumber}>3</Text>
                    <Text style={PDFStyles.stepText}>Complete KYC/verification documents via the partner portal if not already done.</Text>
                </View>
            </View>

            {/* Footer */}
            <View style={PDFStyles.footer}>
                <View style={PDFStyles.footerLeft}>
                    <Text style={PDFStyles.footerText}>Created by: {createdBy || 'Veda CRM Admin'}</Text>
                    <Text style={PDFStyles.footerText}>{new Date(creds.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</Text>
                </View>
                <View style={PDFStyles.footerRight}>
                    <Text style={PDFStyles.footerConfidential}>⚠ CONFIDENTIAL - INTERNAL USE ONLY</Text>
                    <Text style={PDFStyles.footerText}>Veda Loans CRM | www.vedaloans.in</Text>
                </View>
            </View>
        </Page>
    </Document>
);

// ─── Status Chip ─────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => (
    <Chip
        label={status}
        size="small"
        sx={{
            fontWeight: 800,
            fontSize: '0.7rem',
            bgcolor: status === 'Active' ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
            color: status === 'Active' ? '#059669' : '#d97706',
            border: '1px solid',
            borderColor: status === 'Active' ? alpha('#10b981', 0.3) : alpha('#f59e0b', 0.3),
        }}
    />
);

const partnerRoles = [
    'Relationship Manager',
    'Branch Manager',
    'Sales Manager',
    'Credit Manager',
    'Processing Officer',
    'Field Executive',
    'DSA Agent'
];

const partnerTypes = [
    { value: 'Bank', label: '🏦 Bank' },
    { value: 'NBFC', label: '🏛️ NBFC (Non-Banking Finance Company)' },
    { value: 'HFC', label: '🏠 HFC (Housing Finance Company)' },
    { value: 'Fintech', label: '💳 Fintech Partner' },
    { value: 'Credit Partner', label: '🤝 Credit Partner' },
    { value: 'DSA', label: '📋 DSA (Direct Selling Agent)' },
    { value: 'Others', label: '📦 Others' }
];

// ─── Main Component ───────────────────────────────────────────────────────────
const CreditPartners = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // All | Active | Inactive
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Create/Edit modal
    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', 
        bank_id: '', 
        branch_name: '', 
        email: '', 
        phone: '', 
        password: '', 
        status: 'Active', 
        partner_role: 'Relationship Manager',
        partner_type: 'Credit Partner',
        designation: '',
        department: ''
    });
    const [banks, setBanks] = useState([]);
    const [formError, setFormError] = useState(null);

    // Activity Log modal
    const [logOpen, setLogOpen] = useState(false);
    const [logPartner, setLogPartner] = useState(null);
    const [selectedLogs, setSelectedLogs] = useState([]);
    const [logLoading, setLogLoading] = useState(false);

    // Reset Password modal
    const [resetOpen, setResetOpen] = useState(false);
    const [resetPartner, setResetPartner] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    // Success Credential Modal
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState(null);

    const { profile: currentUser } = useAuth();
    const isAdmin = ['Super Admin', 'Admin'].includes(currentUser?.role);


    // ── Snackbar ───────────────────────────────────────────────────────────
    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // ── Data Fetch ─────────────────────────────────────────────────────────
    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setFormError(null);
            
            // Fetch independently so failure in one doesn't crash the other
            const fetchPartners = async () => {
                try {
                    const data = await lendingPartnerService.getAll();
                    setPartners(data || []);
                } catch (err) {
                    console.error('Fetch Partners failed:', err);
                    showSnackbar('Failed to fetch partners', 'error');
                }
            };

            const fetchBanks = async () => {
                try {
                    const data = await bankService.getAllBanks();
                    setBanks(data || []);
                } catch (err) {
                    console.error('Fetch Banks failed:', err);
                    showSnackbar('Failed to fetch banks', 'error');
                }
            };

            await Promise.all([fetchPartners(), fetchBanks()]);
        } catch (err) {
            console.error('[LENDING_PARTNERS] Init Error:', err);
        } finally {
            setLoading(false);
        }
    }, [showSnackbar]);

    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

    // ── Derived / Filtered Data ────────────────────────────────────────────
    const filtered = useMemo(() => {
        return (partners || []).filter(p => {
            if (!p) return false;
            const name = p.name || '';
            const bank = p.bank_name || '';
            const branch = p.branch_name || '';
            const email = p.email || '';
            const query = (searchQuery || '').toLowerCase();

            const matchSearch =
                name.toLowerCase().includes(query) ||
                bank.toLowerCase().includes(query) ||
                branch.toLowerCase().includes(query) ||
                email.toLowerCase().includes(query);
            const matchStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [partners, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        const pts = partners || [];
        return {
            total: pts.length,
            active: pts.filter(p => p?.status === 'Active').length,
            inactive: pts.filter(p => p?.status === 'Inactive').length,
        };
    }, [partners]);

    // ── Create / Edit ──────────────────────────────────────────────────────
    const handleOpenModal = (mode, partner = null) => {
        setModalMode(mode);
        setFormError(null);
        setShowPassword(false);
        if (partner) {
            setFormData({ 
                ...partner, 
                password: '',
                partner_type: partner.partner_type || 'Credit Partner',
                designation: partner.designation || '',
                department: partner.department || ''
            });
        } else {
            setFormData({ 
                name: '', 
                bank_id: '', 
                branch_name: '', 
                email: '', 
                phone: '', 
                password: '', 
                status: 'Active', 
                partner_role: 'Relationship Manager',
                partner_type: 'Credit Partner',
                designation: '',
                department: ''
            });
        }
        setOpenModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.bank_id) {
            setFormError('Name, Bank and Email are required.');
            return;
        }
        try {
            setSaving(true);
            setFormError(null);
            
            // Find bank name for hybrid support
            const selectedBank = banks.find(b => b.id === formData.bank_id);
            const payload = {
                ...formData,
                bank_name: selectedBank ? selectedBank.name : ''
            };

            if (modalMode === 'add') {
                const response = await lendingPartnerService.create(payload);
                showSnackbar('Partner created successfully!');
                
                // If backend returned credentials, show the success screen
                if (response.credentials) {
                    setGeneratedCredentials(response.credentials);
                    setOpenSuccessModal(true);
                    setOpenModal(false); // Close the entry modal
                }
            } else {
                await lendingPartnerService.update(formData.id, payload);
                showSnackbar('Partner updated successfully!');
                setOpenModal(false);
            }
            fetchInitialData();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Operation failed. Try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Toggle Status ──────────────────────────────────────────────────────
    const handleToggleStatus = async (partner) => {
        const newStatus = partner.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await lendingPartnerService.updateStatus(partner.id, newStatus);
            setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, status: newStatus } : p));
            showSnackbar(`Partner ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
        } catch {
            showSnackbar('Failed to update status', 'error');
        }
    };

    // ── Activity Log ───────────────────────────────────────────────────────
    const handleOpenLog = async (partner) => {
        setLogPartner(partner);
        setLogOpen(true);
        setLogLoading(true);
        try {
            const data = await lendingPartnerService.getLogs(partner.id);
            setSelectedLogs(data || []);
        } catch {
            setSelectedLogs([]);
        } finally {
            setLogLoading(false);
        }
    };

    // ── Reset Password ─────────────────────────────────────────────────────
    const handleOpenReset = (partner) => {
        setResetPartner(partner);
        setNewPassword(Math.random().toString(36).slice(-10) + 'V@1');
        setResetOpen(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword) return;
        try {
            setResetLoading(true);
            await lendingPartnerService.resetPassword(resetPartner.id, newPassword);
            showSnackbar('Password reset successfully!');
            setResetOpen(false);
        } catch {
            showSnackbar('Failed to reset password', 'error');
        } finally {
            setResetLoading(false);
        }
    };

    // ── Copy to Clipboard ──────────────────────────────────────────────────
    const copyToClipboard = (text, label = 'Copied!') => {
        navigator.clipboard.writeText(text);
        showSnackbar(label);
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>

            {/* ── Header ──────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, color: 'primary.main' }}>
                        Credit Partners
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Manage bank partners, portal access &amp; activity tracking
                    </Typography>
                </Box>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => handleOpenModal('add')}
                        sx={{ borderRadius: 3, px: 3, py: 1.2, fontWeight: 700, flexShrink: 0 }}
                    >
                        Add Credit Partner
                    </Button>
                )}
            </Box>

            {/* ── Stats Bar ───────────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Partners', value: stats?.total || 0, icon: <Users size={20} />, color: '#6366f1' },
                    { label: 'Active', value: stats?.active || 0, icon: <CheckCircle size={20} />, color: '#10b981' },
                    { label: 'Inactive', value: stats?.inactive || 0, icon: <XCircle size={20} />, color: '#f59e0b' },
                ].map((s) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
                        <Paper
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: alpha(s.color, 0.15),
                                bgcolor: alpha(s.color, 0.04),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ color: s.color, bgcolor: alpha(s.color, 0.1), p: 1.2, borderRadius: 2, display: 'flex' }}>
                                {s.icon}
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: s.color, lineHeight: 1 }}>
                                    {s.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {s.label}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* ── Search + Filter Bar ──────────────────────────────────── */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    placeholder="Search by name, bank, branch or email..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1, minWidth: 220 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={16} color="#94a3b8" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2.5 }
                    }}
                />
                <Tabs
                    value={statusFilter}
                    onChange={(_, v) => setStatusFilter(v)}
                    sx={{
                        bgcolor: alpha(theme.palette.divider, 0.06),
                        borderRadius: 2.5,
                        minHeight: 38,
                        px: 0.5,
                        '& .MuiTab-root': { minHeight: 38, py: 0, fontWeight: 700, fontSize: '0.8rem', borderRadius: 2 },
                        '& .Mui-selected': { color: 'primary.main' },
                        '& .MuiTabs-indicator': { display: 'none' },
                    }}
                >
                    <Tab label={`All (${stats.total})`} value="All" />
                    <Tab label={`Active (${stats.active})`} value="Active" />
                    <Tab label={`Inactive (${stats.inactive})`} value="Inactive" />
                </Tabs>
            </Box>

            {/* ── Partners Grid ────────────────────────────────────────── */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                    <CircularProgress size={48} thickness={4} />
                </Box>
            ) : filtered.length === 0 ? (
                <Paper
                    sx={{
                        p: 8,
                        textAlign: 'center',
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.divider, 0.04),
                        border: '2px dashed',
                        borderColor: 'divider',
                    }}
                >
                    <Building2 size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {searchQuery || statusFilter !== 'All' ? 'No partners match your filter' : 'No credit partners yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchQuery ? 'Try a different search term' : 'Add your first bank partner to get started'}
                    </Typography>
                    {!searchQuery && statusFilter === 'All' && (
                        <Button variant="outlined" sx={{ mt: 3, borderRadius: 2 }} onClick={() => handleOpenModal('add')}>
                            Add First Partner
                        </Button>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {(filtered || []).map((partner) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={partner?.id || Math.random()}>
                            <Card
                                sx={{
                                    height: '100%',
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: partner?.status === 'Active'
                                        ? alpha(theme.palette.divider, 0.1)
                                        : alpha('#f59e0b', 0.2),
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                                        borderColor: 'primary.main',
                                    },
                                }}
                            >
                                {/* Status accent bar */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        width: '100%',
                                        height: 3,
                                        bgcolor: partner.status === 'Active' ? '#10b981' : '#f59e0b',
                                    }}
                                />

                                <CardContent sx={{ p: 3.5 }}>
                                    {/* Top Row */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                                            <Avatar
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 3,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: 'primary.main',
                                                    fontWeight: 900,
                                                    fontSize: '1.3rem',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {partner?.name?.charAt(0) || 'P'}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 800,
                                                        lineHeight: 1.2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {partner?.name || 'Unknown Partner'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mt: 0.2 }}>
                                                    {partner.partner_role || 'Relationship Manager'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.8, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        label={partner?.partner_id || 'ID Pending'}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            fontWeight: 800,
                                                            bgcolor: 'primary.main',
                                                            color: '#fff',
                                                        }}
                                                    />
                                                    <Chip
                                                        icon={<Building2 size={11} />}
                                                        label={partner?.bank_name || 'No Bank'}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            fontWeight: 700,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                            color: 'primary.main',
                                                        }}
                                                    />
                                                    {partner.branch_name && (
                                                        <Chip
                                                            icon={<MapPin size={11} />}
                                                            label={partner.branch_name}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                                                color: 'secondary.main',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Action buttons */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
                                            <StatusChip status={partner.status} />
                                        </Box>
                                    </Box>

                                    <Divider sx={{ mb: 2, opacity: 0.5 }} />

                                    {/* Contact Info */}
                                    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Mail size={14} color="#94a3b8" />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '0.8rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    flex: 1,
                                                }}
                                            >
                                                {partner.email}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Phone size={14} color="#94a3b8" />
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: partner.phone ? 'text.primary' : 'text.disabled' }}>
                                                {partner.phone || 'Phone not added'}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Footer Actions */}
                                    <Box sx={{ pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                Since {partner?.created_at ? new Date(partner.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Unknown'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="Activity Log">
                                                    <IconButton size="small" onClick={() => handleOpenLog(partner)}>
                                                        <History size={15} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reset Password">
                                                    <IconButton size="small" onClick={() => handleOpenReset(partner)}>
                                                        <KeyRound size={15} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Partner">
                                                    <IconButton size="small" onClick={() => handleOpenModal('edit', partner)}>
                                                        <Edit size={15} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={partner.status === 'Active' ? 'Deactivate' : 'Activate'}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggleStatus(partner)}
                                                        sx={{ color: partner.status === 'Active' ? 'warning.main' : 'success.main' }}
                                                    >
                                                        <Power size={15} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                        <Button
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            endIcon={<ExternalLink size={13} />}
                                            onClick={() => navigate(`/lending-partners/${partner.id}`)}
                                            sx={{ mt: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '0.78rem' }}
                                        >
                                            Operational Profile
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* Create / Edit Modal                                        */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ 
                    sx: { 
                        borderRadius: 5,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
                    } 
                }}
            >
                <DialogTitle sx={{ p: 4, pb: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 3, display: 'flex' }}>
                            {modalMode === 'add' ? <Plus size={24} /> : <Edit size={24} />}
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>
                                {modalMode === 'add' ? 'Onboard New Credit Partner' : 'Edit Partner Details'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {modalMode === 'add' 
                                    ? 'Setup portal access and mapping for a new external partner.' 
                                    : 'Update existing partner profile and system permissions.'}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                        {formError && (
                            <Alert severity="error" variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
                                {formError}
                            </Alert>
                        )}

                        <Grid container spacing={3}>
                            {/* Identity Section */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                                    Business Details
                                </Typography>
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Company / Business Name"
                                        fullWidth
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. HDFC Bank - SME Cell"
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                    <TextField
                                        select
                                        label="Partner Type"
                                        fullWidth
                                        required
                                        value={formData.partner_type}
                                        onChange={(e) => setFormData(p => ({ ...p, partner_type: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    >
                                        {partnerTypes.map(type => (
                                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        label="Designation / Role"
                                        fullWidth
                                        placeholder="e.g. Senior Manager, Credit Head"
                                        value={formData.designation}
                                        onChange={(e) => setFormData(p => ({ ...p, designation: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                </Stack>
                            </Grid>

                            {/* Mapping Section */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                                    Organization Mapping
                                </Typography>
                                <Stack spacing={2.5}>
                                    <TextField
                                        select
                                        label="Select Bank Parent"
                                        fullWidth
                                        required
                                        value={formData.bank_id}
                                        onChange={(e) => setFormData(p => ({ ...p, bank_id: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    >
                                        {banks.map(bank => (
                                            <MenuItem key={bank.id} value={bank.id}>{bank.name}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        label="Branch / Department"
                                        fullWidth
                                        placeholder="e.g. Gurugram Hub, SME Division"
                                        value={formData.department}
                                        onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                    <TextField
                                        label="Specific Branch Location"
                                        fullWidth
                                        placeholder="e.g. Gurugram Hub"
                                        value={formData.branch_name}
                                        onChange={(e) => setFormData(p => ({ ...p, branch_name: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                </Stack>
                            </Grid>

                            {/* Contact Section */}
                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1, mt: 1 }}>
                                    Contact Person & System Role
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Contact Person Full Name"
                                            fullWidth
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                            placeholder="e.g. Rajesh Kumar"
                                            InputProps={{ 
                                                sx: { borderRadius: 3 },
                                                startAdornment: <InputAdornment position="start"><UserCircle size={18} /></InputAdornment>
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            select
                                            label="System Role / Access Level"
                                            fullWidth
                                            value={formData.partner_role}
                                            onChange={(e) => setFormData(p => ({ ...p, partner_role: e.target.value }))}
                                            InputProps={{ sx: { borderRadius: 3 } }}
                                        >
                                            {partnerRoles.map(role => (
                                                <MenuItem key={role} value={role}>{role}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Official Email Address"
                                            fullWidth
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                            placeholder="partner@bank.com"
                                            InputProps={{ 
                                                sx: { borderRadius: 3 },
                                                startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment>
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Contact Number"
                                            fullWidth
                                            value={formData.phone}
                                            onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="+91 XXXXX XXXXX"
                                            InputProps={{ 
                                                sx: { borderRadius: 3 },
                                                startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment>
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {modalMode === 'edit' && (
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        select
                                        label="Account Status"
                                        fullWidth
                                        value={formData.status}
                                        onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    >
                                        <MenuItem value="Active">✅ Active Access</MenuItem>
                                        <MenuItem value="Inactive">⏸️ Suspended / Inactive</MenuItem>
                                    </TextField>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 4, pt: 1, gap: 1.5 }}>
                    <Button 
                        onClick={() => setOpenModal(false)} 
                        sx={{ fontWeight: 700, color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={saving}
                        fullWidth={modalMode === 'add'}
                        sx={{ 
                            fontWeight: 800, 
                            px: 4, 
                            py: 1.5,
                            borderRadius: 3,
                            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        {saving ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : modalMode === 'add' ? (
                            'Create Partner & Generate Credentials'
                        ) : (
                            'Save Profile Changes'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* Activity Log Modal                                         */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog
                open={logOpen}
                onClose={() => setLogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>
                    Activity Log — {logPartner?.name}
                </DialogTitle>
                <DialogContent dividers>
                    {logLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedLogs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Clock size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
                            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>
                                No activity recorded yet for this partner.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                        <TableCell sx={{ fontWeight: 800 }}>Time</TableCell>
                                        <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                                        <TableCell sx={{ fontWeight: 800 }}>Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedLogs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                                                {new Date(log.created_at).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={log.action} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.82rem' }}>{log.details || '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setLogOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* Reset Password Modal                                       */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog
                open={resetOpen}
                onClose={() => setResetOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>🔑 Reset Password — {resetPartner?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            A new password will be set for this partner's portal access. Share it with them securely.
                        </Typography>
                        <TextField
                            label="New Password"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputProps={{
                                sx: { borderRadius: 2 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Copy">
                                            <IconButton size="small" onClick={() => copyToClipboard(newPassword, 'Password copied!')}>
                                                <Copy size={15} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Generate">
                                            <IconButton size="small" onClick={() => setNewPassword(Math.random().toString(36).slice(-10) + 'V@1')}>
                                                <RefreshCw size={15} />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setResetOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleResetPassword}
                        disabled={resetLoading || !newPassword}
                        sx={{ fontWeight: 700, borderRadius: 2.5 }}
                    >
                        {resetLoading ? <CircularProgress size={18} color="inherit" /> : 'Reset Password'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Snackbar ──────────────────────────────────────────────── */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {/* Success / Credentials Modal (Invoice Style)                */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog
                open={openSuccessModal}
                onClose={() => setOpenSuccessModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, overflow: 'hidden' }
                }}
            >
                {/* Header with accent bar */}
                <Box sx={{ 
                    bgcolor: '#0f172a', 
                    color: '#fff', 
                    p: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background pattern */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0, right: 0,
                        width: 200, height: 200,
                        background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                    }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                                p: 1.5, 
                                bgcolor: '#10b981', 
                                borderRadius: 2, 
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CheckCircle2 size={28} strokeWidth={2.5} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                                    Credit Partner Onboarded
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                                    Credentials have been issued and are ready for secure sharing
                                </Typography>
                            </Box>
                        </Box>
                        <Chip 
                            label={`ID: ${generatedCredentials?.partner_id || 'N/A'}`}
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.1)', 
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                height: 32
                            }}
                        />
                    </Box>
                </Box>

                <DialogContent sx={{ p: 0 }}>
                    {/* Document Header */}
                    <Box sx={{ 
                        px: 4, pt: 4, pb: 2,
                        borderBottom: '2px solid #2563eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
                                VEDA CRM
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Credit Partner Access Credentials
                            </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                    </Box>

                    {/* Partner Details */}
                    <Box sx={{ px: 4, py: 3 }}>
                        <Grid container spacing={4}>
                            {/* Left Column - Partner Info */}
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Paper
                                    elevation={0}
                                    sx={{ 
                                        p: 3, 
                                        bgcolor: '#f8fafc', 
                                        borderRadius: 3, 
                                        border: '1px solid #e2e8f0',
                                        height: '100%'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        <Avatar
                                            sx={{ 
                                                bgcolor: '#2563eb', 
                                                color: '#fff',
                                                fontWeight: 900,
                                                fontSize: '1.2rem',
                                                width: 48, height: 48
                                            }}
                                        >
                                            {generatedCredentials?.company_name?.charAt(0) || 'P'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                01. Partner Details
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                                {generatedCredentials?.company_name}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px dashed #e2e8f0' }}>
                                            <Typography variant="body2" color="text.secondary">Partner ID</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                                                {generatedCredentials?.partner_id}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px dashed #e2e8f0' }}>
                                            <Typography variant="body2" color="text.secondary">Partner Type</Typography>
                                            <Chip 
                                                label={generatedCredentials?.partner_type || 'Credit Partner'} 
                                                size="small" 
                                                sx={{ 
                                                    fontWeight: 700, 
                                                    bgcolor: '#2563eb',
                                                    color: '#fff',
                                                    fontSize: '0.7rem'
                                                }} 
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px dashed #e2e8f0' }}>
                                            <Typography variant="body2" color="text.secondary">Access Role</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {generatedCredentials?.role || 'Credit Partner'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                            <Typography variant="body2" color="text.secondary">Branch</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {generatedCredentials?.branch_name || 'Headquarters'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>

                            {/* Right Column - Credentials */}
                            <Grid size={{ xs: 12, md: 7 }}>
                                <Paper
                                    elevation={0}
                                    sx={{ 
                                        p: 3, 
                                        bgcolor: '#fff', 
                                        borderRadius: 3, 
                                        border: '2px solid #10b981',
                                        borderLeftWidth: 5,
                                        height: '100%'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        <Avatar
                                            sx={{ 
                                                bgcolor: '#10b981', 
                                                color: '#fff',
                                                width: 40, height: 40
                                            }}
                                        >
                                            <Lock size={20} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                02. Login Credentials
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                Secure Access Details
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Stack spacing={2.5}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                                PORTAL USERNAME (EMAIL)
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#2563eb' }}>
                                                {generatedCredentials?.email}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ 
                                            p: 2.5, 
                                            bgcolor: '#fef2f2', 
                                            borderRadius: 2, 
                                            border: '2px dashed #dc2626',
                                            position: 'relative'
                                        }}>
                                            <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700, display: 'block', mb: 1 }}>
                                                INITIAL PASSWORD (ONE-TIME - CHANGE ON LOGIN)
                                            </Typography>
                                            <Typography variant="h4" sx={{ 
                                                fontWeight: 900, 
                                                color: '#dc2626', 
                                                letterSpacing: 3,
                                                fontFamily: 'monospace'
                                            }}>
                                                {generatedCredentials?.password}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 16, 
                                                    right: 16,
                                                    bgcolor: '#fff',
                                                    '&:hover': { bgcolor: '#fee2e2' }
                                                }}
                                                onClick={() => copyToClipboard(generatedCredentials?.password, 'Password copied!')}
                                            >
                                                <Copy size={18} />
                                            </IconButton>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Portal Info & Support */}
                        <Box sx={{ mt: 3, display: 'flex', gap: 3 }}>
                            <Paper
                                elevation={0}
                                sx={{ 
                                    flex: 1,
                                    p: 2.5, 
                                    bgcolor: '#eff6ff', 
                                    borderRadius: 3, 
                                    border: '1px solid #bfdbfe'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Globe size={18} color="#2563eb" />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>
                                        Portal Access
                                    </Typography>
                                </Box>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">Portal URL</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>veda-partner-portal.onrender.com</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">API Endpoint</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>api.vedaloans.in/v1</Typography>
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{ 
                                    flex: 1,
                                    p: 2.5, 
                                    bgcolor: '#fefce8', 
                                    borderRadius: 3, 
                                    border: '1px solid #fef08a'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Phone size={18} color="#a16207" />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#a16207' }}>
                                        Support Contact
                                    </Typography>
                                </Box>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>support@vedaloans.in</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">Helpline</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>+91 11 4567 8900</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Box>

                        {/* Security Warning */}
                        <Alert 
                            severity="warning" 
                            icon={<Info size={20} />}
                            sx={{ 
                                mt: 3, 
                                borderRadius: 3,
                                '& .MuiAlert-icon': { color: '#d97706' }
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e' }}>
                                ⚠️ Security Notice: These credentials are displayed only once. 
                                Please download the PDF or copy the credentials before closing. 
                                Partner must change password on first login.
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'space-between', bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Mail size={18} />}
                            sx={{ 
                                borderRadius: 2.5, 
                                fontWeight: 700,
                                borderColor: '#94a3b8',
                                color: '#475569'
                            }}
                            onClick={() => showSnackbar('Sending welcome email via Resend...', 'info')}
                        >
                            Send Welcome Email
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            onClick={() => setOpenSuccessModal(false)}
                            sx={{ fontWeight: 700, color: 'text.secondary', px: 3 }}
                        >
                            Close
                        </Button>
                        {generatedCredentials && (
                            <PDFDownloadLink
                                document={<CredentialsPDF creds={generatedCredentials} createdBy={currentUser?.full_name || 'Veda Admin'} />}
                                fileName={`VEDA_Partner_Credentials_${generatedCredentials.partner_id}.pdf`}
                                style={{ textDecoration: 'none' }}
                            >
                                {({ loading }) => (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Download size={18} />}
                                        sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 800 }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Generating...' : 'Download PDF'}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{ borderRadius: 2.5, fontWeight: 700 }}
                    onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreditPartners;
