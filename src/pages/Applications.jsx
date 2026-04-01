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
    Tooltip,
    alpha,
    useTheme
} from '@mui/material';
import { Search, Filter, Eye, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { applicationService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Applications = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getAll();
            setApplications(data);
        } catch (err) {
            setError('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const filtered = applications.filter(a => {
        const matchesSearch = 
            a.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.phone.includes(searchTerm) ||
            a.consultancy_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'New Application': return 'info';
            case 'Under Review': return 'warning';
            case 'Documents Pending': return 'secondary';
            case 'Submitted to Bank': return 'primary';
            case 'Under Process': return 'warning';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Disbursed': return 'success';
            case 'Completed': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1 }}>
                        Disbursement Desk
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Finalized, successful applications ready for bank disbursement and closure.
                    </Typography>
                </Box>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Paper sx={{ p: '4px 12px', display: 'flex', alignItems: 'center', width: 400, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Search size={18} color="#64748b" />
                    <TextField
                        fullWidth
                        placeholder="Search applications..."
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { ml: 1, fontSize: '0.9rem' } }}
                    />
                </Paper>
                <Button 
                    variant="outlined" 
                    startIcon={<Filter size={18} />}
                    sx={{ borderRadius: 3, borderColor: '#e2e8f0', color: 'text.primary' }}
                >
                    Filters
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Loan / Course</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Consultancy</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Updated At</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><Typography color="text.secondary">No applications found</Typography></TableCell></TableRow>
                        ) : (
                            filtered.map((a) => (
                                <TableRow key={a.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.applicant_name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{a.phone} | {a.email}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.course || 'N/A'}</Typography>
                                        <Typography variant="caption" color="text.secondary">₹{a.loan_amount?.toLocaleString() || '0'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.consultancy_name || 'Direct'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{a.consultant_person_name || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={a.application_source || 'Website'} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={a.status} 
                                            color={getStatusColor(a.status)} 
                                            size="small" 
                                            sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{new Date(a.updated_at).toLocaleDateString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Application Details">
                                                <IconButton 
                                                    size="small" 
                                                    color="primary" 
                                                    onClick={() => navigate(`/applications/${a.id}`)}
                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                                                >
                                                    <ArrowRight size={18} />
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

export default Applications;
