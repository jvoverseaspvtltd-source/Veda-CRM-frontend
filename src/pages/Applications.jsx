import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    CircularProgress,
    Stack,
    Alert,
    Tooltip,
    alpha,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    InputAdornment,
    Snackbar,
    LinearProgress,
    Divider,
    Avatar,
    Tabs,
    Tab,
    Card,
    CardContent
} from '@mui/material';
import { 
    Search, 
    Plus, 
    Eye, 
    Trash2, 
    ArrowRight, 
    Upload, 
    FileArchive, 
    X,
    Copy,
    CheckCircle2,
    Share2,
    Building2,
    Phone,
    Mail,
    MapPin,
    User,
    DollarSign,
    FileText,
    RefreshCw,
    RotateCcw,
    Filter
} from 'lucide-react';
import { applicationService, lendingPartnerService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
    'New Application': { bg: '#e0f2fe', color: '#0369a1' },
    'Under Review': { bg: '#fef3c7', color: '#b45309' },
    'Documents Pending': { bg: '#f3e8ff', color: '#7c3aed' },
    'Submitted to Bank': { bg: '#dbeafe', color: '#1d4ed8' },
    'Under Process': { bg: '#fef3c7', color: '#b45309' },
    'Approved': { bg: '#dcfce7', color: '#15803d' },
    'Rejected': { bg: '#fee2e2', color: '#dc2626' },
    'Disbursed': { bg: '#dcfce7', color: '#15803d' },
    'Completed': { bg: '#dcfce7', color: '#15803d' },
    'Trash': { bg: '#fee2e2', color: '#dc2626' }
};

const Applications = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isAdmin = ['Super Admin', 'Admin'].includes(profile?.role);

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    
    // Add Application Modal
    const [openAddModal, setOpenAddModal] = useState(false);
    const [formData, setFormData] = useState({
        applicant_name: '',
        email: '',
        phone: '',
        uid: '',
        batch: '',
        city: '',
        state: '',
        loan_amount: '',
        course: '',
        notes: ''
    });
    const [zipFile, setZipFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Share Modal
    const [openShareModal, setOpenShareModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [sharing, setSharing] = useState(false);

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getAll();
            setApplications(data || []);
        } catch (err) {
            setError('Failed to fetch applications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
    };

    const filtered = applications.filter(a => {
        const matchesSearch = 
            a.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.phone?.includes(searchTerm) ||
            a.uid?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getFilteredApplications = () => {
        const tabs = ['All', 'New Application', 'Submitted to Bank', 'Under Process', 'Approved', 'Rejected'];
        if (activeTab === 0) return filtered;
        
        const status = tabs[activeTab];
        if (status === 'Rejected') {
            return filtered.filter(a => a.status === 'Rejected' || a.is_trashed);
        }
        return filtered.filter(a => a.status === status);
    };

    const handleOpenAddModal = () => {
        setFormData({
            applicant_name: '',
            email: '',
            phone: '',
            uid: '',
            batch: '',
            city: '',
            state: '',
            loan_amount: '',
            course: '',
            notes: ''
        });
        setZipFile(null);
        setFormError('');
        setOpenAddModal(true);
    };

    const MAX_ZIP_SIZE = 25 * 1024 * 1024; // 25 MB in bytes

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.name.endsWith('.zip') && file.type !== 'application/zip') {
                setFormError('Please upload a ZIP file only');
                setZipFile(null);
                return;
            }
            
            // Validate file size (25 MB limit)
            if (file.size > MAX_ZIP_SIZE) {
                setFormError('File size should be less than 25 MB');
                setZipFile(null);
                return;
            }
            
            setZipFile(file);
            setFormError('');
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.applicant_name.trim()) {
            setFormError('Applicant name is required');
            return;
        }
        if (!formData.phone.trim()) {
            setFormError('Contact number is required');
            return;
        }
        if (!formData.uid.trim()) {
            setFormError('Student UID / Application ID is required');
            return;
        }
        if (!formData.email.trim()) {
            setFormError('Email is required');
            return;
        }

        setSubmitting(true);
        setUploading(true);
        setFormError('');

        try {
            // Create application first
            const appData = {
                applicant_name: formData.applicant_name,
                email: formData.email,
                phone: formData.phone,
                uid: formData.uid,
                batch: formData.batch,
                city: formData.city,
                state: formData.state,
                loan_amount: formData.loan_amount ? parseFloat(formData.loan_amount) : 0,
                course: formData.course,
                notes: formData.notes,
                status: 'New Application',
                created_by: profile?.id,
                created_by_name: profile?.full_name
            };

            // Simulate upload progress
            setUploadProgress(20);
            const response = await applicationService.create(appData);
            setUploadProgress(40);

            // Upload ZIP if exists
            if (zipFile) {
                setUploadProgress(60);
                const formData = new FormData();
                formData.append('file', zipFile);
                formData.append('application_id', response.id);
                formData.append('type', 'documents_zip');
                formData.append('fileName', zipFile.name);
                formData.append('fileSize', zipFile.size.toString());
                
                try {
                    setUploadProgress(80);
                    await applicationService.uploadDocument(formData);
                    setUploadProgress(100);
                } catch (uploadErr) {
                    console.error('ZIP upload failed:', uploadErr);
                    // Show error but don't block - application was created successfully
                    setFormError(uploadErr.response?.data?.error || 'Document upload failed, but application was registered. Please try uploading again from details page.');
                    setSubmitting(false);
                    setUploading(false);
                    return;
                }
            } else {
                setUploadProgress(100);
            }

            showSnackbar('Application registered successfully!');
            setOpenAddModal(false);
            fetchApplications();

        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to create application');
            setUploadProgress(0);
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    const fetchPartners = async () => {
        try {
            const data = await lendingPartnerService.getAll();
            setPartners(data || []);
        } catch (err) {
            console.error('Failed to fetch partners', err);
        }
    };

    const handleOpenShareModal = (app) => {
        setSelectedApp(app);
        setSelectedPartner('');
        fetchPartners();
        setOpenShareModal(true);
    };

    const handleShare = async () => {
        if (!selectedPartner) {
            showSnackbar('Please select a credit partner', 'error');
            return;
        }
        
        setSharing(true);
        try {
            await applicationService.shareWithPartner(selectedApp.id, selectedPartner);
            showSnackbar('Application shared with partner successfully!');
            setOpenShareModal(false);
            fetchApplications();
        } catch (err) {
            showSnackbar('Failed to share application', 'error');
        } finally {
            setSharing(false);
        }
    };

    const handleMoveToTrash = async (app) => {
        if (!window.confirm(`Move "${app.applicant_name}" to Trash?`)) return;
        try {
            await applicationService.update(app.id, { status: 'Rejected', is_trashed: true });
            showSnackbar('Application moved to Trash');
            fetchApplications();
        } catch (err) {
            showSnackbar('Failed to move to trash', 'error');
        }
    };

    const getStatusStyle = (status) => {
        const style = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' };
        return {
            bgcolor: style.bg,
            color: style.color,
            fontWeight: 700,
            fontSize: '0.7rem',
            textTransform: 'uppercase'
        };
    };

    const stats = {
        total: applications.length,
        new: applications.filter(a => a.status === 'New Application').length,
        submitted: applications.filter(a => a.status === 'Submitted to Bank').length,
        approved: applications.filter(a => a.status === 'Approved').length,
        rejected: applications.filter(a => a.status === 'Rejected' || a.is_trashed).length
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1 }}>
                        Application Registry
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Register and manage loan applications from students and leads
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={handleOpenAddModal}
                    sx={{ borderRadius: 3, px: 3, py: 1.2, fontWeight: 800, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}
                >
                    Register Application
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total', value: stats.total, icon: <FileText size={20} />, color: '#6366f1' },
                    { label: 'New', value: stats.new, icon: <User size={20} />, color: '#0ea5e9' },
                    { label: 'Submitted', value: stats.submitted, icon: <Building2 size={20} />, color: '#8b5cf6' },
                    { label: 'Approved', value: stats.approved, icon: <CheckCircle2 size={20} />, color: '#10b981' },
                    { label: 'Rejected', value: stats.rejected, icon: <X size={20} />, color: '#ef4444' },
                ].map((stat) => (
                    <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={stat.label}>
                        <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: alpha(stat.color, 0.1) }}>
                            <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: stat.color }}>{stat.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Tabs & Search */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                        bgcolor: alpha(theme.palette.divider, 0.06),
                        borderRadius: 2.5,
                        minHeight: 40,
                        '& .MuiTab-root': { minHeight: 40, py: 0.5, fontWeight: 700, fontSize: '0.8rem' },
                        '& .Mui-selected': { color: 'primary.main' }
                    }}
                >
                    <Tab label={`All (${stats.total})`} />
                    <Tab label={`New (${stats.new})`} />
                    <Tab label={`Submitted (${stats.submitted})`} />
                    <Tab label={`Approved (${stats.approved})`} />
                    <Tab label={`Rejected (${stats.rejected})`} sx={{ color: '#ef4444' }} />
                </Tabs>

                <Stack direction="row" spacing={2}>
                    <Paper sx={{ p: '4px 12px', display: 'flex', alignItems: 'center', width: 280, borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                        <Search size={18} color="#64748b" />
                        <TextField
                            placeholder="Search by name, UID, phone..."
                            variant="standard"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ disableUnderline: true, sx: { ml: 1, fontSize: '0.85rem' } }}
                            sx={{ flex: 1 }}
                        />
                    </Paper>
                </Stack>
            </Box>

            {/* Applications Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>UID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Loan Amount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                        ) : getFilteredApplications().length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <FileText size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
                                            No applications found
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {activeTab === 0 ? 'Register your first application to get started' : 'No applications in this category'}
                                        </Typography>
                                        {activeTab === 0 && (
                                            <Button variant="outlined" sx={{ mt: 3, borderRadius: 2 }} onClick={handleOpenAddModal}>
                                                Register Application
                                            </Button>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            getFilteredApplications().map((a) => (
                                <TableRow key={a.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800, fontSize: '0.9rem', width: 36, height: 36 }}>
                                                {a.applicant_name?.charAt(0) || 'A'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.applicant_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{a.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                            {a.uid || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Phone size={12} /> {a.phone}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                            ₹{a.loan_amount?.toLocaleString() || '0'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={a.status} size="small" {...getStatusStyle(a.status)} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {new Date(a.created_at).toLocaleDateString('en-IN')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="View Details">
                                                <IconButton size="small" color="primary" onClick={() => navigate(`/applications/${a.id}`)}>
                                                    <Eye size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Share with Partner">
                                                <IconButton 
                                                    size="small" 
                                                    sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} 
                                                    onClick={() => handleOpenShareModal(a)}
                                                >
                                                    <Share2 size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            {isAdmin && (
                                                <Tooltip title="Move to Trash">
                                                    <IconButton size="small" sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} onClick={() => handleMoveToTrash(a)}>
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* Add Application Modal */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog open={openAddModal} onClose={() => !submitting && setOpenAddModal(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, color: 'primary.main' }}>
                                <Plus size={24} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>Register New Application</Typography>
                                <Typography variant="caption" color="text.secondary">Fill in the student details and upload documents</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setOpenAddModal(false)} disabled={submitting}><X size={20} /></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>
                    )}
                    
                    {uploading && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Uploading documents...</Typography>
                            <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 1 }} />
                        </Box>
                    )}

                    <Grid container spacing={3}>
                        {/* Left Column */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Student Full Name *"
                                    fullWidth
                                    value={formData.applicant_name}
                                    onChange={(e) => setFormData(p => ({ ...p, applicant_name: e.target.value }))}
                                    placeholder="e.g. Rajesh Kumar"
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                                <TextField
                                    label="Student UID / Application ID *"
                                    fullWidth
                                    value={formData.uid}
                                    onChange={(e) => setFormData(p => ({ ...p, uid: e.target.value }))}
                                    placeholder="e.g. STU-2024-001"
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                                <TextField
                                    label="Contact Number *"
                                    fullWidth
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="+91 XXXXX XXXXX"
                                    InputProps={{ sx: { borderRadius: 2 }, startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment> }}
                                />
                                <TextField
                                    label="Email Address *"
                                    fullWidth
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                    placeholder="student@email.com"
                                    InputProps={{ sx: { borderRadius: 2 }, startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }}
                                />
                            </Stack>
                        </Grid>

                        {/* Right Column */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Section / Batch"
                                    fullWidth
                                    value={formData.batch}
                                    onChange={(e) => setFormData(p => ({ ...p, batch: e.target.value }))}
                                    placeholder="e.g. Batch 2024"
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                                <TextField
                                    label="City"
                                    fullWidth
                                    value={formData.city}
                                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                                    placeholder="e.g. Gurugram"
                                    InputProps={{ sx: { borderRadius: 2 }, startAdornment: <InputAdornment position="start"><MapPin size={18} /></InputAdornment> }}
                                />
                                <TextField
                                    label="State"
                                    fullWidth
                                    value={formData.state}
                                    onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                                    placeholder="e.g. Haryana"
                                    InputProps={{ sx: { borderRadius: 2 } }}
                                />
                                <TextField
                                    label="Loan Amount"
                                    fullWidth
                                    type="number"
                                    value={formData.loan_amount}
                                    onChange={(e) => setFormData(p => ({ ...p, loan_amount: e.target.value }))}
                                    placeholder="e.g. 500000"
                                    InputProps={{ sx: { borderRadius: 2 }, startAdornment: <InputAdornment position="start"><DollarSign size={18} /></InputAdornment> }}
                                />
                            </Stack>
                        </Grid>

                        {/* ZIP Upload */}
                        <Grid size={{ xs: 12 }}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    border: '2px dashed',
                                    borderColor: zipFile ? 'success.main' : 'divider',
                                    bgcolor: zipFile ? alpha('#10b981', 0.02) : 'transparent',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                }}
                                onClick={() => document.getElementById('zip-upload').click()}
                            >
                                <input
                                    id="zip-upload"
                                    type="file"
                                    accept=".zip"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <FileArchive size={40} color={zipFile ? '#10b981' : '#94a3b8'} style={{ marginBottom: 8 }} />
                                {zipFile ? (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main' }}>
                                            {zipFile.name}
                                        </Typography>
                                        <Typography variant="caption" color={zipFile.size > 20 * 1024 * 1024 ? 'warning.main' : 'text.secondary'}>
                                            {(zipFile.size / 1024 / 1024).toFixed(2)} MB / 25 MB max
                                        </Typography>
                                        <Button size="small" sx={{ ml: 2 }} onClick={(e) => { e.stopPropagation(); setZipFile(null); }}>
                                            Remove
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            Upload Documents ZIP (Optional)
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Drag & drop or click to select a ZIP file (max 25 MB)
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        {/* Notes */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Internal Notes"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                                placeholder="Any additional notes about this application..."
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
                    <Button onClick={() => setOpenAddModal(false)} disabled={submitting} sx={{ fontWeight: 700 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
                        sx={{ px: 4, py: 1.2, fontWeight: 800, borderRadius: 2 }}
                    >
                        {submitting ? 'Registering...' : 'Register Application'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* Share with Partner Modal */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog open={openShareModal} onClose={() => !sharing && setOpenShareModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: alpha('#10b981', 0.1), borderRadius: 2, color: '#10b981' }}>
                            <Share2 size={24} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>Share with Credit Partner</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Share "{selectedApp?.applicant_name}" with a partner for processing
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {partners.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Loading partners...</Typography>
                        </Box>
                    ) : (
                        <>
                            <TextField
                                select
                                label="Select Credit Partner"
                                fullWidth
                                value={selectedPartner}
                                onChange={(e) => setSelectedPartner(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="" disabled>Choose a partner...</MenuItem>
                                {partners.map(p => (
                                    <MenuItem key={p.id} value={p.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: '0.8rem' }}>
                                                {p.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{p.bank_name} - {p.branch_name}</Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>

                            {selectedPartner && (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    The partner will receive this application in their <strong>"My Tasks"</strong> page and can view documents, update status, and communicate.
                                </Alert>
                            )}

                            {selectedApp && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Application Details:</Typography>
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption"><strong>Student:</strong> {selectedApp.applicant_name}</Typography>
                                        <Typography variant="caption"><strong>UID:</strong> {selectedApp.uid}</Typography>
                                        <Typography variant="caption"><strong>Amount:</strong> ₹{selectedApp.loan_amount?.toLocaleString() || '0'}</Typography>
                                        <Typography variant="caption"><strong>Status:</strong> {selectedApp.status}</Typography>
                                    </Stack>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpenShareModal(false)} disabled={sharing} sx={{ fontWeight: 700 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleShare}
                        disabled={!selectedPartner || sharing}
                        startIcon={sharing ? <CircularProgress size={18} color="inherit" /> : <Share2 size={18} />}
                        sx={{ px: 3, fontWeight: 800 }}
                    >
                        {sharing ? 'Sharing...' : 'Share Application'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.type} sx={{ borderRadius: 2, fontWeight: 700 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Applications;
