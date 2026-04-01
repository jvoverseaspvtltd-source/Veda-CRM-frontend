import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Card,
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
    Snackbar
} from '@mui/material';
import { Plus, Search, Filter, Eye, Edit2, Trash2, X, ExternalLink, Activity, Info, LayoutGrid, List as ListIcon, Phone, Mail, MapPin, Briefcase, CreditCard, User, Clock, CheckCircle2, Send, Link as LinkIcon, Users, ArrowUpDown, ClipboardList, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const leadSources = ['JV Overseas', 'Direct Walk-in', 'Website', 'DSA Agent'];
const loanTypes = ['Education Loan', 'Personal Loan', 'Business Loan', 'Home Loan'];
const stages = ['New', 'Contacted', 'Interested', 'In Progress', 'Sanctioned', 'Disbursed', 'Rejected'];

const getStatusColor = (status) => {
    switch (status) {
        case 'New': return 'info';
        case 'Contacted': return 'secondary';
        case 'Interested': return 'primary';
        case 'In Progress': return 'warning';
        case 'Sanctioned': return 'success';
        case 'Rejected': return 'error';
        case 'Disbursed': return 'success';
        default: return 'default';
    }
};

const Leads = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        city: '',
        source: 'Website',
        loan_type: 'Education Loan',
        loan_amount: '',
        assigned_to: '',
        details: {}
    });

    const handleViewLead = (lead) => {
        setSelectedLead(lead);
        setViewOpen(true);
    };

    const handleEditLead = (lead) => {
        setSelectedLead(lead);
        setFormData({
            ...lead,
            mobile: lead.mobile || '',
            email: lead.email || '',
            city: lead.city || '',
            loan_amount: lead.loan_amount || ''
        });
        setEditOpen(true);
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await leadService.updateLead(id, { status });
            fetchLeads();
        } catch (err) {
            console.error('Update logic error:', err);
        }
    };

    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        source: '',
        loan_type: '',
        status: ''
    });

    useEffect(() => {
        fetchLeads();
    }, [profile]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const data = await leadService.getAllLeads(profile?.id, profile?.role);
            setLeads(data);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch leads. Showing local data for now.');
            // Fallback to empty or mock if needed for dev
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await leadService.createLead({ ...formData, userId: profile?.id });
            setOpen(false);
            fetchLeads(); // Refresh list
            setFormData({ name: '', mobile: '', email: '', city: '', source: 'Website', loan_type: 'Education Loan', loan_amount: '', details: {} });
        } catch (err) {
            console.error('Submit error:', err);
            alert('Failed to save lead');
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = 
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.mobile.includes(searchTerm) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSource = !filters.source || lead.source === filters.source;
        const matchesType = !filters.loan_type || lead.loan_type === filters.loan_type;
        const matchesStatus = !filters.status || lead.status === filters.status;

        return matchesSearch && matchesSource && matchesType && matchesStatus;
    });

    const clearFilters = () => setFilters({ source: '', loan_type: '', status: '' });

    return (
        <Box>
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
                        Central hub for tracking active loan files and document collection.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="soft"
                        startIcon={<ClipboardList size={20} />}
                        onClick={() => navigate('/apply')}
                        sx={{ px: 4, py: 1.5, borderRadius: 4, fontWeight: 800, textTransform: 'none', bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}
                    >
                        Fill Application
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        onClick={() => setOpen(true)}
                        sx={{ px: 4, py: 1.5, borderRadius: 4, fontWeight: 800, textTransform: 'none', boxShadow: '0 8px 24px rgba(26, 54, 93, 0.2)' }}
                    >
                        New Application
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 5 }}>
                <Paper sx={{ p: '4px 12px', display: 'flex', alignItems: 'center', width: 450, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <Search size={20} color={theme.palette.text.secondary} />
                    <TextField
                        fullWidth
                        placeholder="Search by name, contact or loan type..."
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
                    Filters {Object.values(filters).some(v => v !== '') && `(${Object.values(filters).filter(v => v !== '').length})`}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, py: 2 }}>Customer Details</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Loan Profile</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Source</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Fulfillment Stage</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                        ) : leads.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><Typography color="text.secondary">No records found</Typography></TableCell></TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
                                <TableRow key={lead.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', fontWeight: 800, width: 44, height: 44 }}>{lead.name.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{lead.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{lead.email || lead.mobile}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{lead.loan_amount || '0'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{lead.loan_type}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={lead.source} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem' }} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={lead.status} 
                                            color={getStatusColor(lead.status)} 
                                            size="small" 
                                            sx={{ fontWeight: 900, borderRadius: 2, px: 1, textTransform: 'uppercase', fontSize: '0.65rem' }} 
                                        />
                                    </TableCell>
                                    <TableCell align="right">                                     <Tooltip title="View Lead Details">
                                         <IconButton size="small" onClick={() => handleViewLead(lead)}><Eye size={18} /></IconButton>
                                     </Tooltip>
                                     <Tooltip title="Edit Lead">
                                         <IconButton size="small" onClick={() => handleEditLead(lead)}><Edit2 size={18} /></IconButton>
                                     </Tooltip>
                                     <Tooltip title="Case Log">
                                         <IconButton size="small" color="primary" onClick={() => navigate(`/cases/lead/${lead.id}`)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}><ExternalLink size={18} /></IconButton>
                                     </Tooltip>
                                 </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>


            <Drawer
                anchor="right"
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                PaperProps={{ sx: { width: 320, p: 3 } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Advanced Filters</Typography>
                    <IconButton onClick={() => setFilterOpen(false)}><X size={20} /></IconButton>
                </Box>

                <Stack spacing={3}>
                    <FormControl fullWidth>
                        <InputLabel>Lead Source</InputLabel>
                        <Select
                            value={filters.source}
                            label="Lead Source"
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                        >
                            <MenuItem value="">All Sources</MenuItem>
                            {leadSources.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Loan Type</InputLabel>
                        <Select
                            value={filters.loan_type}
                            label="Loan Type"
                            onChange={(e) => setFilters({ ...filters, loan_type: e.target.value })}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            {loanTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status}
                            label="Status"
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            {['New', 'Contacted', 'Interested', 'Sanctioned', 'Rejected', 'Disbursed'].map(s => 
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            )}
                        </Select>
                    </FormControl>

                    <Button variant="outlined" onClick={clearFilters} color="inherit" sx={{ mt: 2 }}>
                        Clear All Filters
                    </Button>
                </Stack>
            </Drawer>

            {/* View Application Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
                {selectedLead && (
                    <>
                        <DialogTitle sx={{ p: 0, m: 0 }}>
                            <Box sx={{ p: 3, pt: 4, background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', position: 'relative', overflow: 'hidden' }}>
                                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)' }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
                                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#3B82F6', fontSize: '2rem', fontWeight: 900, border: '4px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                        {selectedLead.name?.charAt(0) || 'U'}
                                    </Avatar>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', letterSpacing: -1 }}>{selectedLead.name}</Typography>
                                            <Chip label={selectedLead.status} color={getStatusColor(selectedLead.status)} size="small" sx={{ fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }} />
                                        </Box>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Briefcase size={16} /> {selectedLead.loan_type} • ₹{Number(selectedLead.loan_amount || 0).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ p: 0 }}>
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid size={ 12 } md={6}>
                                        <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', height: '100%' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><User size={16} /> Contact Details</Typography>
                                            <Stack spacing={2}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}><Phone size={18} /></Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Mobile Number</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedLead.mobile}</Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}><Mail size={18} /></Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Email Address</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedLead.email || 'Not Provided'}</Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}><MapPin size={18} /></Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Location (City)</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedLead.city || 'Not Provided'}</Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                    <Grid size={ 12 } md={6}>
                                        <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', height: '100%' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><Info size={16} /> Application Info</Typography>
                                            <Stack spacing={2}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}><CreditCard size={18} /></Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Expected Loan Amount</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'success.main' }}>₹{Number(selectedLead.loan_amount || 0).toLocaleString()}</Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}><Activity size={18} /></Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Lead Source</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedLead.source}</Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}><Clock size={18} /></Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Created Date</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{new Date(selectedLead.created_at).toLocaleString()}</Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                    <Grid size={ 12 }>
                                        <Box sx={{ mt: 1, p: 2.5, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px dashed', borderColor: 'primary.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>Next Action Items</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Update the case log to proceed with application processing.</Typography>
                                            </Box>
                                            <Stack direction="row" spacing={2}>
                                                <Button variant="outlined" sx={{ borderRadius: 3, fontWeight: 700 }} onClick={() => { setViewOpen(false); handleEditLead(selectedLead); }} startIcon={<Edit2 size={18} />}>Edit Data</Button>
                                                <Button variant="contained" sx={{ borderRadius: 3, fontWeight: 700, px: 3, boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)' }} onClick={() => { setViewOpen(false); navigate(`/cases/lead/${selectedLead.id}`); }} endIcon={<ExternalLink size={18} />}>Open Case File</Button>
                                            </Stack>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewOpen(false)} color="inherit">Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Edit Lead Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Edit Application: {selectedLead?.name}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="name" label="Full Name" required value={formData.name} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="mobile" label="Mobile Number" required value={formData.mobile} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="email" label="Email Address" value={formData.email} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="city" label="City" value={formData.city} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select fullWidth name="status" label="Lead Status" value={formData.status || ''} onChange={handleFormChange}>
                                {stages.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select fullWidth name="loan_type" label="Loan Type" value={formData.loan_type} onChange={handleFormChange}>
                                {loanTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="loan_amount" label="Loan Amount" type="number" value={formData.loan_amount} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="assigned_to" label="Assigned To (Name)" value={formData.assigned_to || ''} onChange={handleFormChange} placeholder="e.g. Sales Rep Name" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={async () => {
                            try {
                                await leadService.updateLead(selectedLead.id, formData);
                                setEditOpen(false);
                                fetchLeads();
                            } catch (e) {
                                console.error('Failed to update lead', e);
                                alert('Error updating lead');
                            }
                        }} 
                        sx={{ px: 4 }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="name" label="Full Name" required value={formData.name} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="mobile" label="Mobile Number" required value={formData.mobile} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="email" label="Email Address" value={formData.email} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="city" label="City" value={formData.city} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select fullWidth name="source" label="Lead Source" value={formData.source} onChange={handleFormChange}>
                                {leadSources.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField select fullWidth name="loan_type" label="Loan Type" value={formData.loan_type} onChange={handleFormChange}>
                                {loanTypes.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="loan_amount" label="Loan Amount" type="number" value={formData.loan_amount} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth name="assigned_to" label="Assign To (Optional)" value={formData.assigned_to || ''} onChange={handleFormChange} placeholder="Employee Name" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ px: 4 }}>Save Application</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Leads;
