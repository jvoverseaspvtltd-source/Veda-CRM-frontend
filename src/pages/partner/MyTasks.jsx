import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Chip, CircularProgress, Stack, Alert, Tooltip, alpha,
    useTheme, Tabs, Tab, TextField, Snackbar, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions,
    MenuItem, Divider, Card, CardContent, Grid
} from '@mui/material';
import {
    Search, Eye, RefreshCw, CheckCircle2, Clock, X,
    AlertCircle, FileText, Building2, Phone, Mail,
    DollarSign, Calendar, Share2, User, MapPin, Download, FileArchive
} from 'lucide-react';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { applicationService } from '../../services/api';

const STATUS_COLORS = {
    'New Application': { bg: '#e0f2fe', color: '#0369a1' },
    'Under Review': { bg: '#fef3c7', color: '#b45309' },
    'Documents Pending': { bg: '#f3e8ff', color: '#7c3aed' },
    'Submitted to Bank': { bg: '#dbeafe', color: '#1d4ed8' },
    'Under Process': { bg: '#fef3c7', color: '#b45309' },
    'Approved': { bg: '#dcfce7', color: '#15803d' },
    'Rejected': { bg: '#fee2e2', color: '#dc2626' },
    'Disbursed': { bg: '#dcfce7', color: '#15803d' },
};

const MyTasks = () => {
    const theme = useTheme();
    const { partner } = usePartnerAuth();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState(null);

    // View Details Dialog
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Update Status Dialog
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await applicationService.getSharedApplications();
            setTasks(data || []);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
            setError('Failed to load shared applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
    };

    const filteredTasks = tasks.filter(t => {
        const matchesSearch =
            t.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.phone?.includes(searchTerm);
        return matchesSearch;
    });

    const getFilteredTasks = () => {
        const statusTabs = ['All', 'New Application', 'Under Process', 'Approved', 'Rejected'];
        if (activeTab === 0) return filteredTasks;

        const status = statusTabs[activeTab];
        return filteredTasks.filter(t => t.status === status);
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

    const handleOpenDetails = (task) => {
        setSelectedTask(task);
        setOpenDetailsDialog(true);
    };

    const handleOpenStatusDialog = (task) => {
        setSelectedTask(task);
        setNewStatus(task.status);
        setStatusNotes('');
        setOpenStatusDialog(true);
        setOpenDetailsDialog(false);
    };

    const handleDownloadZip = async (taskId) => {
        try {
            const data = await applicationService.getById(taskId);
            const zipDocs = data.documents?.filter(d => d.file_type === 'student_docs' || d.file_name.endsWith('.zip'));
            if (!zipDocs || zipDocs.length === 0) {
                showSnackbar('No ZIP document found for this application', 'warning');
                return;
            }
            // Logic to download (e.g. window.open or blob stream)
            // Assuming the system uses a shared storage or signed URL
            const doc = zipDocs[0];
            showSnackbar(`Starting download: ${doc.file_name}`);
            // In a real implementation, this would be a protected link or stream
            window.open(`${import.meta.env.VITE_API_URL}/applications/documents/${doc.id}/download`, '_blank');
        } catch (err) {
            showSnackbar('Failed to fetch document info', 'error');
        }
    };

    const stats = {
        total: tasks.length,
        new: tasks.filter(t => t.status === 'New Application').length,
        processing: tasks.filter(t => ['Under Review', 'Submitted to Bank', 'Under Process'].includes(t.status)).length,
        approved: tasks.filter(t => ['Approved', 'Disbursed'].includes(t.status)).length,
        rejected: tasks.filter(t => t.status === 'Rejected').length
    };

    if (loading) {
        return (
            <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                    LOADING YOUR TASKS...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, color: 'primary.main' }}>
                            <Share2 size={24} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1 }}>
                            My Tasks
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        Applications shared with you for processing
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshCw size={18} />}
                    onClick={fetchTasks}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Tasks', value: stats.total, icon: <FileText size={20} />, color: '#6366f1' },
                    { label: 'New', value: stats.new, icon: <User size={20} />, color: '#0ea5e9' },
                    { label: 'In Process', value: stats.processing, icon: <Clock size={20} />, color: '#f59e0b' },
                    { label: 'Approved', value: stats.approved, icon: <CheckCircle2 size={20} />, color: '#10b981' },
                    { label: 'Rejected', value: stats.rejected, icon: <X size={20} />, color: '#ef4444' },
                ].map((stat) => (
                    <Grid item xs={6} sm={4} md={2.4} key={stat.label}>
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
                    <Tab label={`Processing (${stats.processing})`} />
                    <Tab label={`Approved (${stats.approved})`} />
                    <Tab label={`Rejected (${stats.rejected})`} />
                </Tabs>

                <TextField
                    size="small"
                    placeholder="Search by name, UID, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 280, bgcolor: 'background.paper', borderRadius: 2 }}
                    InputProps={{
                        startAdornment: <Search size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                    }}
                />
            </Box>

            {/* Tasks Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                            <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>UID</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Shared On</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getFilteredTasks().length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                                    <Box sx={{ color: 'text.secondary' }}>
                                        <FileText size={48} style={{ opacity: 0.3, marginBottom: 8 }} />
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            No tasks found
                                        </Typography>
                                        <Typography variant="caption">
                                            Applications shared with you will appear here
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            getFilteredTasks().map((t) => (
                                <TableRow key={t.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800, fontSize: '0.9rem', width: 36, height: 36 }}>
                                                {t.applicant_name?.charAt(0) || 'A'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.applicant_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{t.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                            {t.uid || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Phone size={12} /> {t.phone}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                            ₹{t.loan_amount?.toLocaleString() || '0'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={t.status} size="small" {...getStatusStyle(t.status)} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {t.shared_at ? new Date(t.shared_at).toLocaleDateString('en-IN') : 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5}>
                                            <Tooltip title="View Details">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenDetails(t)}>
                                                    <Eye size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Download Documents (ZIP)">
                                                <IconButton size="small" sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }} onClick={() => handleDownloadZip(t.id)}>
                                                    <Download size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Update Status">
                                                <IconButton size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} onClick={() => handleOpenStatusDialog(t)}>
                                                    <CheckCircle2 size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* View Details Dialog */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, color: 'primary.main' }}>
                                <Eye size={24} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>Application Details</Typography>
                                <Typography variant="caption" color="text.secondary">{selectedTask?.uid}</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setOpenDetailsDialog(false)}><X size={20} /></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {selectedTask && (
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main', fontSize: '1.2rem', fontWeight: 800 }}>
                                    {selectedTask.applicant_name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedTask.applicant_name}</Typography>
                                    <Chip label={selectedTask.status} size="small" {...getStatusStyle(selectedTask.status)} />
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Contact</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Phone size={14} /> {selectedTask.phone}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Mail size={14} /> {selectedTask.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Loan Amount</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                        ₹{selectedTask.loan_amount?.toLocaleString() || '0'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Location</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {selectedTask.city || 'N/A'}, {selectedTask.state || ''}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {selectedTask.notes && (
                                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Notes</Typography>
                                    <Typography variant="body2">{selectedTask.notes}</Typography>
                                </Box>
                            )}

                            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.1) }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'info.main' }}>
                                    Shared by: {selectedTask.shared_by_name || 'Veda Team'}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {selectedTask.shared_at ? new Date(selectedTask.shared_at).toLocaleString() : 'N/A'}
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpenDetailsDialog(false)} sx={{ fontWeight: 700 }}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleOpenStatusDialog(selectedTask)}
                        startIcon={<CheckCircle2 size={18} />}
                        sx={{ fontWeight: 700 }}
                    >
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* Update Status Dialog */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <Dialog open={openStatusDialog} onClose={() => !updating && setOpenStatusDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: alpha('#10b981', 0.1), borderRadius: 2, color: '#10b981' }}>
                            <CheckCircle2 size={24} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>Update Status</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Update application status for {selectedTask?.applicant_name}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <TextField
                        select
                        label="New Status"
                        fullWidth
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="New Application">New Application</MenuItem>
                        <MenuItem value="Under Review">Under Review</MenuItem>
                        <MenuItem value="Documents Pending">Documents Pending</MenuItem>
                        <MenuItem value="Submitted to Bank">Submitted to Bank</MenuItem>
                        <MenuItem value="Under Process">Under Process</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Disbursed">Disbursed</MenuItem>
                    </TextField>

                    <TextField
                        label="Notes (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        placeholder="Add any notes about this status update..."
                        InputProps={{ sx: { borderRadius: 2 } }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpenStatusDialog(false)} disabled={updating} sx={{ fontWeight: 700 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleUpdateStatus}
                        disabled={!newStatus || updating}
                        startIcon={updating ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
                        sx={{ fontWeight: 800 }}
                    >
                        {updating ? 'Updating...' : 'Update Status'}
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

export default MyTasks;
