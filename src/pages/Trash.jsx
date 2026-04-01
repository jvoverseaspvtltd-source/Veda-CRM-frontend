import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
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
    TextField,
    MenuItem,
    Snackbar,
    Avatar,
    Tabs,
    Tab
} from '@mui/material';
import { 
    Trash2, 
    RotateCcw, 
    X, 
    Eye, 
    Search, 
    AlertCircle,
    RefreshCw,
    CheckCircle2,
    Share2,
    Building2,
    Phone
} from 'lucide-react';
import { applicationService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Trash = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isAdmin = ['Super Admin', 'Admin'].includes(profile?.role);

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [myTrashOnly, setMyTrashOnly] = useState(false);
    
    // Restore Dialog
    const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [newStatus, setNewStatus] = useState('New Application');
    const [restoring, setRestoring] = useState(false);

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        fetchTrash();
    }, [myTrashOnly]);

    const fetchTrash = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getTrash();
            setApplications(data || []);
        } catch (err) {
            console.error('Failed to fetch trash', err);
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
            a.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.phone?.includes(searchTerm);
        
        const matchesFilter = myTrashOnly 
            ? a.created_by === profile?.id || a.shared_with === profile?.id
            : true;
        
        return matchesSearch && matchesFilter;
    });

    const handleOpenRestore = (app) => {
        setSelectedApp(app);
        setNewStatus('New Application');
        setOpenRestoreDialog(true);
    };

    const handleRestore = async () => {
        if (!selectedApp) return;
        
        setRestoring(true);
        try {
            await applicationService.update(selectedApp.id, { 
                status: newStatus,
                is_trashed: false 
            });
            showSnackbar('Application restored successfully!');
            setOpenRestoreDialog(false);
            fetchTrash();
        } catch (err) {
            showSnackbar('Failed to restore application', 'error');
        } finally {
            setRestoring(false);
        }
    };

    const handlePermanentDelete = async (app) => {
        if (!window.confirm(`Permanently delete "${app.applicant_name}"? This cannot be undone!`)) return;
        
        try {
            await applicationService.delete(app.id);
            showSnackbar('Application permanently deleted');
            fetchTrash();
        } catch (err) {
            showSnackbar('Failed to delete', 'error');
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#ef4444', letterSpacing: -1 }}>
                        Trash
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {isAdmin ? 'View and manage all rejected applications' : 'View applications rejected for your files'}
                    </Typography>
                </Box>
            </Box>

            {/* Tabs & Search */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Tabs
                    value={myTrashOnly ? 1 : 0}
                    onChange={(_, v) => setMyTrashOnly(v === 1)}
                    sx={{
                        bgcolor: alpha(theme.palette.divider, 0.06),
                        borderRadius: 2.5,
                        minHeight: 40,
                        '& .MuiTab-root': { minHeight: 40, py: 0.5, fontWeight: 700, fontSize: '0.8rem' }
                    }}
                >
                    <Tab label="All Trash" />
                    <Tab label="My Trash" />
                </Tabs>

                <Paper sx={{ p: '4px 12px', display: 'flex', alignItems: 'center', width: 280, borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                    <Search size={18} color="#64748b" />
                    <TextField
                        placeholder="Search in trash..."
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { ml: 1, fontSize: '0.85rem' } }}
                        sx={{ flex: 1 }}
                    />
                </Paper>
            </Box>

            {/* Warning Alert */}
            <Alert 
                severity="warning" 
                icon={<AlertCircle size={20} />}
                sx={{ mb: 3, borderRadius: 2 }}
            >
                Items in trash are rejected applications. You can restore them or permanently delete them.
            </Alert>

            {/* Trash Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha('#ef4444', 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>Applicant</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>UID</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>Rejected By</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>Rejected On</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#ef4444' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Trash2 size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
                                            Trash is empty
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            No rejected applications found
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((a) => (
                                <TableRow key={a.id} hover sx={{ '&:hover': { bgcolor: alpha('#ef4444', 0.02) } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 800, width: 36, height: 36 }}>
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
                                        <Typography variant="body2">{a.phone}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {a.rejected_by_name || 'System'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(a.updated_at).toLocaleDateString('en-IN')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="View Details">
                                                <IconButton size="small" color="primary" onClick={() => navigate(`/applications/${a.id}`)}>
                                                    <Eye size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Restore Application">
                                                <IconButton 
                                                    size="small" 
                                                    sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} 
                                                    onClick={() => handleOpenRestore(a)}
                                                >
                                                    <RotateCcw size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            {isAdmin && (
                                                <Tooltip title="Permanent Delete">
                                                    <IconButton 
                                                        size="small" 
                                                        sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} 
                                                        onClick={() => handlePermanentDelete(a)}
                                                    >
                                                        <X size={18} />
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

            {/* Restore Dialog */}
            <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: alpha('#10b981', 0.1), borderRadius: 2, color: '#10b981' }}>
                            <RefreshCw size={24} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>Restore Application</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Restore "{selectedApp?.applicant_name}" from trash
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                        The application will be restored and moved to the selected status.
                    </Alert>
                    
                    <TextField
                        select
                        label="Restore as Status"
                        fullWidth
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        <MenuItem value="New Application">New Application</MenuItem>
                        <MenuItem value="Documents Pending">Documents Pending</MenuItem>
                        <MenuItem value="Under Review">Under Review</MenuItem>
                        <MenuItem value="Submitted to Bank">Submitted to Bank</MenuItem>
                    </TextField>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpenRestoreDialog(false)} sx={{ fontWeight: 700 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleRestore}
                        disabled={restoring}
                        startIcon={restoring ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
                        sx={{ px: 3, fontWeight: 800 }}
                    >
                        {restoring ? 'Restoring...' : 'Restore'}
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

export default Trash;
