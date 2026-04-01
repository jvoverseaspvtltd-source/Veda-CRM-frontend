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
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Button,
    Alert,
    Avatar,
    alpha,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Trash2, RotateCcw, Eye, Search, AlertCircle, History, User } from 'lucide-react';
import { applicationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Trash = () => {
    const theme = useTheme();
    const { profile } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getTrash();
            setApplications(data || []);
        } catch (err) {
            console.error('Fetch trash error:', err);
            setError('Failed to load trash items.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            setActionLoading(true);
            await applicationService.restore(id);
            fetchTrash();
        } catch (err) {
            alert('Failed to restore application');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePermanent = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this application? This action cannot be undone.')) return;
        try {
            setActionLoading(true);
            await applicationService.delete(id);
            fetchTrash();
        } catch (err) {
            alert('Failed to delete application');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ 
                    fontWeight: 900, 
                    color: '#dc2626', 
                    letterSpacing: -1.5, 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Trash2 size={40} /> Trash Management
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Applications rejected or moved to trash. Only Admins can restore or permanently delete these records.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#fef2f2' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, py: 2 }}>Applicant Details</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>UNID</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Reason</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Trashed Date</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <Box sx={{ opacity: 0.5 }}>
                                        <AlertCircle size={48} style={{ marginBottom: 12 }} />
                                        <Typography color="text.secondary" sx={{ fontWeight: 700 }}>Trash is empty</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha('#dc2626', 0.1), color: '#dc2626', fontWeight: 800 }}>{app.applicant_name?.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{app.applicant_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{app.phone}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={app.uid} size="small" sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: '#f1f5f9' }} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>{app.rejection_reason || 'Rejected by Partner/Admin'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                            {app.trashed_at ? new Date(app.trashed_at).toLocaleDateString() : 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Restore Application">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleRestore(app.id)}
                                                    sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}
                                                >
                                                    <RotateCcw size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Permanent Delete">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleDeletePermanent(app.id)}
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}
                                                >
                                                    <Trash2 size={18} />
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
        </Box>
    );
};

export default Trash;
