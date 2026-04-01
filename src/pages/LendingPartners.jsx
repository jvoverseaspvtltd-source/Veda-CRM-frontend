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

// ─── PDF Document Component (Partner Version) ──────────────────────────────
const PDFStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#ffffff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#eeeff2', paddingBottom: 15 },
    logoSection: { flexDirection: 'column' },
    logoLabel: { fontSize: 24, fontWeight: 900, color: '#2563eb' },
    headerTitle: { fontSize: 10, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
    badge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, border: '1px solid #dcfce7' },
    badgeText: { fontSize: 8, color: '#166534', fontWeight: 700 },

    titleSection: { marginBottom: 25 },
    mainTitle: { fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 5 },
    subTitle: { fontSize: 10, color: '#64748b' },

    section: { marginBottom: 20 },
    sectionLabel: { fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
    fieldBox: { width: '47%', marginBottom: 12 },
    fieldLabel: { fontSize: 8, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase' },
    fieldValue: { fontSize: 10, color: '#1e293b', fontWeight: 600 },

    credentialCard: { 
        backgroundColor: '#f8fafc', 
        borderRadius: 8, 
        padding: 15, 
        border: '1px solid #e2e8f0',
        marginTop: 10,
        marginBottom: 20
    },
    credentialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    passwordBox: { backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', padding: 10, marginTop: 10, alignItems: 'center' },
    passwordText: { fontSize: 14, fontWeight: 700, color: '#ef4444', letterSpacing: 1 },

    noteBox: { backgroundColor: '#fef3c7', padding: 10, borderRadius: 6, marginTop: 10 },
    noteText: { fontSize: 8, color: '#92400e', lineHeight: 1.4 },

    footer: { position: 'absolute', bottom: 40, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: '#94a3b8' }
});

const CredentialsPDF = ({ creds }) => (
    <Document>
        <Page size="A4" style={PDFStyles.page}>
            {/* Header */}
            <View style={PDFStyles.header}>
                <View style={PDFStyles.logoSection}>
                    <Text style={PDFStyles.logoLabel}>Veda CRM</Text>
                    <Text style={PDFStyles.headerTitle}>Premium Onboarding Services</Text>
                </View>
                <View style={PDFStyles.badge}>
                    <Text style={PDFStyles.badgeText}>CREDIT PARTNER ACCESS</Text>
                </View>
            </View>

            {/* Title */}
            <View style={PDFStyles.titleSection}>
                <Text style={PDFStyles.mainTitle}>Access Credentials Issued</Text>
                <Text style={PDFStyles.subTitle}>Official login details for the Veda Loans Credit Partner Portal.</Text>
            </View>

            {/* Partner Details */}
            <View style={PDFStyles.section}>
                <Text style={PDFStyles.sectionLabel}>Partner Information</Text>
                <View style={PDFStyles.grid}>
                    <View style={PDFStyles.fieldBox}><Text style={PDFStyles.fieldLabel}>Company Name</Text><Text style={PDFStyles.fieldValue}>{creds.company_name}</Text></View>
                    <View style={PDFStyles.fieldBox}><Text style={PDFStyles.fieldLabel}>Partner ID</Text><Text style={PDFStyles.fieldValue}>{creds.partner_id}</Text></View>
                    <View style={PDFStyles.fieldBox}><Text style={PDFStyles.fieldLabel}>Contact Person</Text><Text style={PDFStyles.fieldValue}>{creds.role === 'Relationship Manager' ? creds.full_name : (creds.full_name || creds.company_name)}</Text></View>
                    <View style={PDFStyles.fieldBox}><Text style={PDFStyles.fieldLabel}>System Role</Text><Text style={PDFStyles.fieldValue}>Credit Partner</Text></View>
                </View>
            </View>

            {/* Credential Card */}
            <View style={PDFStyles.section}>
                <Text style={PDFStyles.sectionLabel}>Login Credentials</Text>
                <View style={PDFStyles.credentialCard}>
                    <View style={PDFStyles.credentialRow}>
                        <Text style={PDFStyles.fieldLabel}>Portal Username (Email)</Text>
                        <Text style={PDFStyles.fieldValue}>{creds.email}</Text>
                    </View>
                    <View style={PDFStyles.passwordBox}>
                        <Text style={PDFStyles.fieldLabel}>Secure One-Time Password</Text>
                        <Text style={PDFStyles.passwordText}>{creds.password}</Text>
                    </View>

                    <View style={PDFStyles.noteBox}>
                        <Text style={PDFStyles.noteText}>IMPORTANT SECURITY NOTICE: This is a one-time generated password. For security reasons, you are REQUIRED to change your password immediately upon your first login to the portal. Do not share these credentials with unauthorized personnel.</Text>
                    </View>
                </View>
            </View>

            {/* Access Point */}
            <View style={PDFStyles.section}>
                <Text style={PDFStyles.sectionLabel}>Portal Support Information</Text>
                <View style={PDFStyles.grid}>
                    <View style={PDFStyles.fieldBox}><Text style={PDFStyles.fieldLabel}>Portal URL</Text><Text style={PDFStyles.fieldValue}>veda-partner-portal.onrender.com</Text></View>
                    <View style={PDFStyles.fieldBox}><Text style={PDFStyles.fieldLabel}>Support Email</Text><Text style={PDFStyles.fieldValue}>support@vedaloans.in</Text></View>
                </View>
            </View>

            {/* Footer */}
            <View style={PDFStyles.footer}>
                <Text style={PDFStyles.footerText}>Issued: {new Date(creds.created_at).toLocaleString()}</Text>
                <Text style={PDFStyles.footerText}>Confidential - Internal Access Only</Text>
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
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '', bank_id: '', branch_name: '', email: '', phone: '', password: '', status: 'Active', partner_role: 'Relationship Manager'
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
            setFormData({ ...partner, password: '' });
        } else {
            // Password will be auto-generated by backend now
            setFormData({ name: '', bank_id: '', branch_name: '', email: '', phone: '', password: '', status: 'Active', partner_role: 'Relationship Manager' });
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
                                    Partner Identity
                                </Typography>
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Full Name / Company Name"
                                        fullWidth
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. HDFC Bank - SME Cell"
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    />
                                    <TextField
                                        select
                                        label="System Role / Designation"
                                        fullWidth
                                        value={formData.partner_role}
                                        onChange={(e) => setFormData(p => ({ ...p, partner_role: e.target.value }))}
                                        InputProps={{ sx: { borderRadius: 3 } }}
                                    >
                                        {partnerRoles.map(role => (
                                            <MenuItem key={role} value={role}>{role}</MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                            </Grid>

                            {/* Mapping Section */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                                    Bank Mapping
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
                                        label="Specific Branch Name"
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
                                    Electronic Communications
                                </Typography>
                                <Grid container spacing={3}>
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
            {/* Success / Credentials Modal                                */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog
                open={openSuccessModal}
                onClose={() => setOpenSuccessModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 5, overflow: 'hidden' }
                }}
            >
                <DialogTitle sx={{ p: 4, pb: 2, textAlign: 'center', bgcolor: alpha('#10b981', 0.03) }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#10b981', borderRadius: '50%', color: '#fff', display: 'flex' }}>
                            <CheckCircle2 size={32} strokeWidth={3} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
                            Credit Partner Credentials Issued Successfully
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Access credentials have been generated and the welcome email is being dispatched.
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        {/* Partner Identity Card */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800 }}>
                                        <Building2 size={20} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase' }}>
                                            Partner Identity
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                            {generatedCredentials?.company_name}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Partner ID</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                            {generatedCredentials?.partner_id}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">System Role</Typography>
                                        <Chip label="Credit Partner" size="small" sx={{ fontWeight: 800, bgcolor: 'primary.main', color: '#fff' }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Contact Group</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{generatedCredentials?.role}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>

                        {/* Login Credentials Card */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4, height: '100%', bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 800 }}>
                                        <Lock size={20} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main', textTransform: 'uppercase' }}>
                                            Login Credentials
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                            Secure Access Details
                                        </Typography>
                                    </Box>
                                </Box>

                                <Stack spacing={2.5}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>Login Email</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 800, fontStyle: 'italic', color: 'primary.main' }}>
                                            {generatedCredentials?.email}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff', border: '1px dashed', borderColor: 'divider', position: 'relative' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>Temporary Password</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'error.main', letterSpacing: 2 }}>
                                            {generatedCredentials?.password}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            sx={{ position: 'absolute', top: 12, right: 12 }}
                                            onClick={() => copyToClipboard(generatedCredentials?.password, 'Password copied!')}
                                        >
                                            <Copy size={16} />
                                        </IconButton>
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, p: 2, bgcolor: alpha('#f59e0b', 0.08), borderRadius: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Info size={20} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: '#92400e', lineHeight: 1.5 }}>
                            <strong>Security Note:</strong> These credentials will only be displayed <strong>once</strong>. Please ensure you download the PDF summary or copy the temporary password before closing this window. The partner is required to change their password upon their first login.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 4, pt: 1, justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {generatedCredentials && (
                        <PDFDownloadLink
                            document={<CredentialsPDF creds={generatedCredentials} />}
                            fileName={`VEDA_Partner_Onboarding_${generatedCredentials.partner_id}.pdf`}
                            style={{ textDecoration: 'none' }}
                        >
                            {({ loading }) => (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Download size={18} />}
                                    sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Preparing Document...' : 'Download Enrollment PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={<Mail size={18} />}
                        sx={{ borderRadius: 3, px: 3, py: 1.5, fontWeight: 700 }}
                        onClick={() => showSnackbar('Email Dispatching via Resend...', 'info')}
                    >
                        Resend Welcome Email
                    </Button>

                    <Button
                        onClick={() => setOpenSuccessModal(false)}
                        sx={{ fontWeight: 700, color: 'text.secondary', px: 3 }}
                    >
                        Close Window
                    </Button>
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
