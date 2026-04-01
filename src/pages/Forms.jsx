import React, { useState, useEffect } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Tooltip,
    alpha,
    useTheme
} from '@mui/material';
import { Search, Filter, Eye, Edit2, Trash2, RefreshCw, X } from 'lucide-react';
import { submissionService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Forms = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const data = await submissionService.getAll();
            setSubmissions(data);
        } catch (err) {
            setError('Failed to fetch website enquiries');
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async (id) => {
        if (!window.confirm('Convert this lead to a structured Application?')) return;
        try {
            const result = await submissionService.convertToApplication(id);
            alert('Lead converted successfully!');
            fetchSubmissions();
            navigate(`/applications/${result.applicationId}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Conversion failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            await submissionService.delete(id);
            fetchSubmissions();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const filtered = submissions.filter(s => {
        const matchesSearch = 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.phone.includes(searchTerm) ||
            s.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'info';
            case 'Contacted': return 'secondary';
            case 'Converted': return 'success';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                         Online Submissions
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Incoming enquiries and raw leads captured from the [vedaloans.com](https://vedaloans.com) website.
                    </Typography>
                </Box>
                <Button 
                    startIcon={<RefreshCw size={18} />} 
                    variant="contained" 
                    onClick={fetchSubmissions}
                    sx={{ borderRadius: 2, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}
                >
                    Refresh
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 4, borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(8px)', border: '1px solid', borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                    <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Search by name, phone or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: 350, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }}
                            InputProps={{ startAdornment: <Search size={18} style={{ marginRight: 8, color: '#64748b' }} /> }}
                        />
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <IconButton 
                            onClick={() => setViewMode('table')} 
                            color={viewMode === 'table' ? 'primary' : 'default'}
                            sx={{ bgcolor: viewMode === 'table' ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}
                        >
                            <Filter size={20} />
                        </IconButton>
                    </Stack>
                </Stack>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Customer Details</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Interest / City</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Received On</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main' }} align="right">Quick Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><Typography color="text.secondary" sx={{ fontWeight: 600 }}>No enquiries found matching your search</Typography></TableCell></TableRow>
                        ) : (
                            filtered.map((s) => (
                                <TableRow key={s.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>{s.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{s.phone}</Typography>
                                            <Typography variant="caption" sx={{ color: 'primary.main' }}>{s.email || 'No Email'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>{s.course_type || 'Unspecified'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{s.city || 'Location N/A'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={s.status} 
                                            color={getStatusColor(s.status)} 
                                            size="small" 
                                            sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', borderRadius: 1.5, px: 1 }} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontWeight: 700, px: 1, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 1 }}>
                                            {new Date(s.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="View Details">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => { setSelectedSubmission(s); setDetailsOpen(true); }}
                                                    sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                                                >
                                                    <Eye size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            {s.status !== 'Converted' && (
                                                <Tooltip title="Move to Registry">
                                                    <IconButton 
                                                        size="small" 
                                                        color="success" 
                                                        onClick={() => handleConvert(s.id)}
                                                        sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) } }}
                                                    >
                                                        <RefreshCw size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => handleDelete(s.id)}
                                                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Details Dialog */}
            <Dialog 
                open={detailsOpen} 
                onClose={() => setDetailsOpen(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}
            >
                <DialogTitle sx={{ fontWeight: 900, pb: 1, color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider' }}>
                    Enquiry Details
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedSubmission && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Customer Name</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedSubmission.name}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Mobile Number</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>{selectedSubmission.phone}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Email Address</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedSubmission.email || 'N/A'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>City / Location</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedSubmission.city || 'N/A'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Enquiry For</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 800, color: 'secondary.main' }}>{selectedSubmission.course_type}</Typography>
                            </Grid>
                            
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Message / Requirements</Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.primary', lineHeight: 1.6 }}>
                                        {selectedSubmission.message || 'Customer didn\'t leave a message.'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setDetailsOpen(false)} 
                        sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                    >
                        Close
                    </Button>
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleConvert(selectedSubmission.id)}
                        sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
                    >
                        Move to Registry
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Forms;
