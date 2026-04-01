import React, { useState, useEffect, useRef } from 'react';
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
    InputAdornment,
    CircularProgress,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    Stack,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    alpha,
    useTheme,
    Avatar,
    Tooltip,
    Snackbar,
    Divider
} from '@mui/material';
import { 
    Plus, Search, Filter, Eye, Edit2, Trash2, X, ExternalLink, 
    Activity, Info, List as ListIcon, Phone, Mail, MapPin, 
    Briefcase, CreditCard, User, Clock, CheckCircle2, Send, 
    Link as LinkIcon, Users, ArrowUpDown, ClipboardList, 
    ShieldCheck, Share2, Upload, FileArchive, Building2, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { applicationService, lendingPartnerService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const loanTypes = ['Education Loan', 'Personal Loan', 'Business Loan', 'Home Loan'];
const statusStages = [
    'New Application', 
    'Documents Collected', 
    'Under Review', 
    'Applied to NBFC', 
    'Approved', 
    'Disbursed', 
    'Rejected'
];

const getStatusColor = (status) => {
    switch (status) {
        case 'New Application': return 'info';
        case 'Documents Collected': return 'secondary';
        case 'Under Review': return 'warning';
        case 'Applied to NBFC': return 'primary';
        case 'Approved': return 'success';
        case 'Disbursed': return 'success';
        case 'Rejected': return 'error';
        default: return 'default';
    }
};

const Leads = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const fileInputRef = useRef();

    // Data States
    const [applications, setApplications] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    
    // UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [processOpen, setProcessOpen] = useState(false);
    
    const [selectedApp, setSelectedApp] = useState(null);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [filters, setFilters] = useState({ status: '', loan_type: '' });
    const [zipFile, setZipFile] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        applicant_name: '',
        phone: '',
        email: '',
        uid: '',
        city: '',
        state: '',
        loan_type: 'Education Loan',
        loan_amount: '',
        notes: ''
    });

    const [processData, setProcessData] = useState({
        nbfc_name: '',
        branch_name: '',
        application_date: new Date().toISOString().split('T')[0],
        status: 'Applied to NBFC',
        approved_amount: '',
        rejection_reason: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [appsData, partnersData] = await Promise.all([
                applicationService.getAll(),
                lendingPartnerService.getAll()
            ]);
            setApplications(appsData || []);
            setPartners(partnersData || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load application data.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && !file.name.endsWith('.zip')) {
            alert('Please upload a ZIP file only.');
            return;
        }
        setZipFile(file);
    };

    const handleCreateSubmit = async () => {
        if (!formData.applicant_name || !formData.phone) {
            alert('Name and Phone are mandatory.');
            return;
        }

        try {
            setSubmitting(true);
            // 1. Create Application
            const app = await applicationService.create(formData);
            
            // 2. Upload ZIP if exists
            if (zipFile && app.id) {
                const uploadData = new FormData();
                uploadData.append('file', zipFile);
                uploadData.append('applicationId', app.id);
                uploadData.append('type', 'student_docs');
                await applicationService.uploadDocument(uploadData);
            }

            setCreateOpen(false);
            setZipFile(null);
            fetchInitialData();
            setFormData({ applicant_name: '', phone: '', email: '', uid: '', city: '', state: '', loan_type: 'Education Loan', loan_amount: '', notes: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleShareSubmit = async () => {
        if (!selectedPartner) return;
        try {
            setSubmitting(true);
            await applicationService.shareWithPartner(selectedApp.id, selectedPartner);
            setShareOpen(false);
            fetchInitialData();
        } catch (err) {
            alert('Failed to share application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleProcessSubmit = async () => {
        try {
            setSubmitting(true);
            await applicationService.update(selectedApp.id, processData);
            setProcessOpen(false);
            fetchInitialData();
        } catch (err) {
            alert('Failed to update process status');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch = 
            app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.phone?.includes(searchTerm);
        
        const matchesType = !filters.loan_type || app.loan_type === filters.loan_type;
        const matchesStatus = !filters.status || app.status === filters.status;

        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <Box>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5 }}>
                <Box>
                    <Typography variant="h3" sx={{ 
                        fontWeight: 900, 
                        background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: -1.5, 
                        mb: 1
                    }}>
                        Application Registry
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Activity size={18} color="#3B82F6" />
                        Manage student applications, ZIP documents, and credit partner assignments.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="soft"
                        startIcon={<Trash2 size={20} />}
                        onClick={() => navigate('/trash')}
                        sx={{ px: 3, py: 1.5, borderRadius: 4, fontWeight: 800, color: '#dc2626', bgcolor: alpha('#dc2626', 0.1) }}
                    >
                        View Trash
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        onClick={() => setCreateOpen(true)}
                        sx={{ px: 4, py: 1.5, borderRadius: 4, fontWeight: 800, boxShadow: '0 8px 24px rgba(26, 54, 93, 0.2)' }}
                    >
                        New Registry
                    </Button>
                </Box>
            </Box>

            {/* Search & Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Paper sx={{ p: '6px 16px', display: 'flex', alignItems: 'center', width: 500, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Search size={20} color="#64748b" />
                    <TextField
                        fullWidth
                        placeholder="Search by student name, contact or UNID..."
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { ml: 1, fontSize: '0.95rem', fontWeight: 500 } }}
                    />
                </Paper>
                <Button 
                    variant="outlined" 
                    startIcon={<Filter size={18} />} 
                    onClick={() => setFilterOpen(true)}
                    sx={{ borderRadius: 4, px: 3, fontWeight: 700, borderColor: '#e2e8f0', color: 'text.primary' }}
                >
                    Filters
                </Button>
            </Box>

            {/* Main Application Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, py: 2 }}>Student / Applicant</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Unique ID (UNID)</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Loan Type</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Partner Info</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                        ) : filteredApps.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><Typography color="text.secondary">No records found</Typography></TableCell></TableRow>
                        ) : (
                            filteredApps.map((app) => (
                                <TableRow key={app.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', fontWeight: 800 }}>{app.applicant_name?.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{app.applicant_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{app.phone}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={app.uid} size="small" variant="soft" color="primary" sx={{ fontWeight: 800, borderRadius: 1.5 }} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{(app.loan_amount || 0).toLocaleString()}</Typography>
                                        <Typography variant="caption" color="text.secondary">{app.loan_type}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={app.status || 'New'} 
                                            color={getStatusColor(app.status)} 
                                            size="small" 
                                            sx={{ fontWeight: 900, borderRadius: 2, px: 1, textTransform: 'uppercase', fontSize: '0.65rem' }} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {app.shared_with_name ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ShieldCheck size={14} color="#10b981" />
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>{app.shared_with_name}</Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">Not Shared</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="View History">
                                                <IconButton size="small" onClick={() => { setSelectedApp(app); setViewOpen(true); }}><Eye size={18} /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Process Application">
                                                <IconButton 
                                                    size="small" 
                                                    color="primary" 
                                                    onClick={() => { 
                                                        setSelectedApp(app); 
                                                        setProcessData({
                                                            nbfc_name: app.nbfc_name || '',
                                                            branch_name: app.branch_name || '',
                                                            application_date: app.application_date ? new Date(app.application_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                                            status: app.status || 'Applied to NBFC',
                                                            approved_amount: app.approved_amount || '',
                                                            rejection_reason: app.rejection_reason || ''
                                                        });
                                                        setProcessOpen(true); 
                                                    }}
                                                >
                                                    <Building2 size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Share with Partner">
                                                <IconButton 
                                                    size="small" 
                                                    color="success" 
                                                    onClick={() => { setSelectedApp(app); setShareOpen(true); }}
                                                    sx={{ bgcolor: alpha('#10b981', 0.1) }}
                                                >
                                                    <Share2 size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error"><Trash2 size={18} /></IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- Modals & Dialogs --- */}

            {/* New Application Dialog */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800, p: 3, borderBottom: '1px solid #f1f5f9' }}>Create New Registry Record</DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid size={12} md={6}>
                            <TextField fullWidth label="Applicant Name" name="applicant_name" required value={formData.applicant_name} onChange={handleFormChange} placeholder="Full name of student" />
                        </Grid>
                        <Grid size={12} md={6}>
                            <TextField fullWidth label="Contact Number" name="phone" required value={formData.phone} onChange={handleFormChange} placeholder="e.g. +91 9876543210" />
                        </Grid>
                        <Grid size={12} md={6}>
                            <TextField fullWidth label="Unique ID (UNID)" name="uid" value={formData.uid} onChange={handleFormChange} placeholder="e.g. VEDA-ST-001 (Optional)" />
                        </Grid>
                        <Grid size={12} md={6}>
                            <TextField fullWidth label="Email Address" name="email" value={formData.email} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={12} md={6}>
                            <TextField select fullWidth label="Loan Type" name="loan_type" value={formData.loan_type} onChange={handleFormChange}>
                                {loanTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={12} md={6}>
                            <TextField fullWidth label="Expected Loan Amount" name="loan_amount" type="number" value={formData.loan_amount} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={12} md={4}>
                            <TextField fullWidth label="Location" name="city" value={formData.city} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={12} md={4}>
                            <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={12} md={4}>
                            <Box sx={{ border: '2px dashed #cbd5e1', borderRadius: 2, p: 1, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
                                <input type="file" hidden ref={fileInputRef} accept=".zip" onChange={handleFileChange} />
                                {zipFile ? (
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                        <FileArchive size={14} /> {zipFile.name.slice(0, 15)}...
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        <Upload size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                        Upload Student ZIP
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth multiline rows={2} label="Additional Notes" name="notes" value={formData.notes} onChange={handleFormChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
                    <Button onClick={() => setCreateOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" disabled={submitting} onClick={handleCreateSubmit} sx={{ fontWeight: 800, px: 4, borderRadius: 3 }}>
                        {submitting ? 'Saving...' : 'Register Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Process Application Modal */}
            <Dialog open={processOpen} onClose={() => setProcessOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Loan Processing Details</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField fullWidth label="NBFC / Bank Name" value={processData.nbfc_name} onChange={(e) => setProcessData({...processData, nbfc_name: e.target.value})} placeholder="e.g. HDFC, Incred, etc." />
                        <TextField fullWidth label="Branch" value={processData.branch_name} onChange={(e) => setProcessData({...processData, branch_name: e.target.value})} />
                        <TextField fullWidth type="date" label="Application Filed Date" value={processData.application_date} onChange={(e) => setProcessData({...processData, application_date: e.target.value})} InputLabelProps={{ shrink: true }} />
                        <TextField select fullWidth label="Current Stage" value={processData.status} onChange={(e) => setProcessData({...processData, status: e.target.value})}>
                            {statusStages.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                        
                        {processData.status === 'Approved' && (
                            <TextField fullWidth type="number" label="Final Approved Amount" value={processData.approved_amount} onChange={(e) => setProcessData({...processData, approved_amount: e.target.value})} sx={{ bgcolor: alpha('#10b981', 0.05) }} />
                        )}

                        {processData.status === 'Rejected' && (
                            <TextField fullWidth multiline rows={2} label="Rejection Reason" value={processData.rejection_reason} onChange={(e) => setProcessData({...processData, rejection_reason: e.target.value})} sx={{ bgcolor: alpha('#ef4444', 0.05) }} />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setProcessOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" disabled={submitting} onClick={handleProcessSubmit}>Update Record</Button>
                </DialogActions>
            </Dialog>

            {/* Share Modal */}
            <Dialog open={shareOpen} onClose={() => setShareOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Share with Credit Partner</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Select a partner to share this student application and documents for processing.</Typography>
                    <TextField select fullWidth label="Choose Credit Partner" value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value)}>
                        {partners.map(p => (
                            <MenuItem key={p.id} value={p.id}>{p.bank_name} - {p.partner_name}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setShareOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" color="success" disabled={submitting} onClick={handleShareSubmit} startIcon={<Send size={18} />}>Send Details</Button>
                </DialogActions>
            </Dialog>

            {/* View History Drawer (Optional but helpful) */}
            <Drawer anchor="right" open={viewOpen} onClose={() => setViewOpen(false)} PaperProps={{ sx: { width: 400, p: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Application History</Typography>
                    <IconButton onClick={() => setViewOpen(false)}><X size={20} /></IconButton>
                </Box>
                {selectedApp && (
                    <Box>
                        <Box sx={{ mb: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{selectedApp.applicant_name}</Typography>
                            <Typography variant="caption" color="text.secondary">UNID: {selectedApp.uid}</Typography>
                        </Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}><History size={16} /> Activity Log</Typography>
                        <Alert severity="info" sx={{ py: 0.5, borderRadius: 2 }}>Workflow history tracking is enabled.</Alert>
                        {/* Here we could map through application_activities if fetched */}
                    </Box>
                )}
            </Drawer>

        </Box>
    );
};

export default Leads;
