import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    Avatar,
    TextField,
    CircularProgress,
    Alert,
    MenuItem,
    Stack,
    IconButton,
    Tooltip,
    alpha,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Snackbar,
    InputAdornment
} from '@mui/material';
import { 
    User, 
    CheckCircle2, 
    Share2, 
    Search,
    Eye,
    Clock,
    AlertCircle,
    FileText,
    Building2,
    DollarSign,
    Filter,
    ArrowRight
} from 'lucide-react';
import SendToPartnerModal from '../components/SendToPartnerModal';
import { caseService, leadService, applicationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const caseStages = [
    'Lead Created',
    'Documents Collected',
    'CIBIL Checked',
    'Bank Applied',
    'Sanction Letter Received',
    'Disbursement Done',
    'Commission Received',
];

const STATUS_COLORS = {
    'New': { bg: '#e0f2fe', color: '#0369a1' },
    'Under Process': { bg: '#fef3c7', color: '#b45309' },
    'Approved': { bg: '#dcfce7', color: '#15803d' },
    'Rejected': { bg: '#fee2e2', color: '#dc2626' },
    'Disbursed': { bg: '#dcfce7', color: '#15803d' },
};

const Cases = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile } = useAuth();
    
    const [activeTab, setActiveTab] = useState(0);
    const [leads, setLeads] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null);
    const [caseHistory, setCaseHistory] = useState([]);
    const [openShareModal, setOpenShareModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState('');
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        fetchData();
    }, [profile]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadsData, appsData] = await Promise.all([
                leadService.getAllLeads(profile?.id, profile?.role),
                applicationService.getAll()
            ]);
            setLeads(leadsData || []);
            setApplications(appsData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
    };

    const handleLeadSelect = async (lead) => {
        setSelectedLead(lead);
        setSelectedApp(null);
        try {
            const history = await caseService.getCaseByLead(lead.id);
            setCaseHistory(history);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAppSelect = (app) => {
        setSelectedApp(app);
        setSelectedLead(null);
    };

    const handleStageUpdate = async (stageIndex) => {
        if (!selectedLead) return;
        try {
            setUpdating(true);
            const nextStage = caseStages[stageIndex];
            await caseService.updateStage({
                lead_id: selectedLead.id,
                stage: nextStage,
                remarks: remarks || `Advanced to ${nextStage}`,
                employee_id: profile?.id
            });
            
            if (nextStage === 'Sanction Letter Received') await leadService.updateLead(selectedLead.id, { status: 'Sanctioned' });
            if (nextStage === 'Disbursement Done') await leadService.updateLead(selectedLead.id, { status: 'Disbursed' });

            setRemarks('');
            handleLeadSelect(selectedLead);
            showSnackbar(`Stage updated to "${nextStage}"`);
        } catch (err) {
            showSnackbar('Failed to update stage', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const activeStep = caseHistory.length > 0 
        ? Math.max(0, caseStages.indexOf(caseHistory[0].stage)) 
        : 0;

    const getStatusStyle = (status) => {
        const style = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' };
        return { bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: '0.7rem' };
    };

    const getFilteredItems = () => {
        const items = activeTab === 0 ? leads : applications;
        if (!searchTerm) return items;
        return items.filter(item => {
            const name = item.name || item.applicant_name || '';
            const id = item.id || '';
            return name.toLowerCase().includes(searchTerm.toLowerCase()) || id.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    const stats = {
        total: leads.length + applications.length,
        new: applications.filter(a => a.status === 'New Application').length,
        processing: leads.filter(l => !['Sanctioned', 'Disbursed', 'Completed'].includes(l.status)).length,
        approved: leads.filter(l => l.status === 'Sanctioned' || l.status === 'Disbursed').length,
    };

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1 }}>
                        Stage Tracker
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Monitor and track all active applications through their lifecycle
                    </Typography>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Active', value: stats.total, icon: <FileText size={20} />, color: '#6366f1' },
                    { label: 'New Applications', value: stats.new, icon: <User size={20} />, color: '#0ea5e9' },
                    { label: 'Under Process', value: stats.processing, icon: <Clock size={20} />, color: '#f59e0b' },
                    { label: 'Sanctioned/Disbursed', value: stats.approved, icon: <CheckCircle2 size={20} />, color: '#10b981' },
                ].map((stat) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
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
                    <Tab label="Leads" />
                    <Tab label="Applications" />
                </Tabs>

                <Paper sx={{ p: '4px 12px', display: 'flex', alignItems: 'center', width: 280, borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                    <Search size={18} color="#64748b" />
                    <TextField
                        placeholder="Search..."
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { ml: 1, fontSize: '0.85rem' } }}
                        sx={{ flex: 1 }}
                    />
                </Paper>
            </Box>

            <Grid container spacing={3}>
                {/* Left Panel - List */}
                <Grid size={{ xs: 12, md: activeTab === 1 ? 12 : 4 }}>
                    <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                        {activeTab === 0 ? 'Lead' : 'Applicant'}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFilteredItems().length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary">
                                                {activeTab === 0 ? 'No leads found' : 'No applications found'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    getFilteredItems().map((item) => {
                                        const isSelected = activeTab === 0 
                                            ? selectedLead?.id === item.id 
                                            : selectedApp?.id === item.id;
                                        const name = item.name || item.applicant_name || 'Unknown';
                                        const status = item.status || 'New';
                                        
                                        return (
                                            <TableRow 
                                                key={item.id} 
                                                hover
                                                selected={isSelected}
                                                onClick={() => activeTab === 0 ? handleLeadSelect(item) : handleAppSelect(item)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                                            {name.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ₹{(item.loan_amount || 0).toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={status} size="small" {...getStatusStyle(status)} />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/applications/${item.id}`) }}>
                                                            <Eye size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Right Panel - Details (Only for Leads Tab) */}
                {activeTab === 0 && (
                    <Grid size={{ xs: 12, md: 8 }}>
                        {!selectedLead ? (
                            <Paper sx={{ p: 6, borderRadius: 4, textAlign: 'center' }}>
                                <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    Select a lead to view details
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Click on a lead from the list to see their stage tracker
                                </Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {/* Lead Info Card */}
                                <Grid size={{ xs: 12 }}>
                                    <Card sx={{ borderRadius: 4 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontSize: '1.2rem' }}>
                                                        {selectedLead.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{selectedLead.name}</Typography>
                                                        <Typography variant="body2" color="text.secondary">ID: {selectedLead.id?.slice(0, 8)}</Typography>
                                                    </Box>
                                                </Box>
                                                <Stack direction="row" spacing={1}>
                                                    <Tooltip title="Share with Partner">
                                                        <IconButton sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} onClick={() => setOpenShareModal(true)}>
                                                            <Share2 size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Chip label={selectedLead.status} {...getStatusStyle(selectedLead.status)} />
                                                </Stack>
                                            </Box>
                                            <Divider sx={{ my: 2 }} />
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 6, sm: 3 }}>
                                                    <Typography variant="caption" color="text.secondary">Loan Type</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLead.loan_type || 'N/A'}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6, sm: 3 }}>
                                                    <Typography variant="caption" color="text.secondary">Amount</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                        ₹{selectedLead.loan_amount?.toLocaleString() || '0'}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6, sm: 3 }}>
                                                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLead.phone || 'N/A'}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 6, sm: 3 }}>
                                                    <Typography variant="caption" color="text.secondary">Created</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {new Date(selectedLead.created_at).toLocaleDateString('en-IN')}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Case Timeline */}
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Case Timeline</Typography>
                                        <Stepper activeStep={activeStep} orientation="vertical">
                                            {caseStages.map((label, index) => (
                                                <Step key={label}>
                                                    <StepLabel>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{label}</Typography>
                                                    </StepLabel>
                                                    <StepContent>
                                                        <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={2}
                                                                size="small"
                                                                placeholder="Add remarks..."
                                                                value={remarks}
                                                                onChange={(e) => setRemarks(e.target.value)}
                                                                sx={{ mb: 2, bgcolor: 'white' }}
                                                            />
                                                            <Button
                                                                variant="contained"
                                                                disabled={updating}
                                                                onClick={() => handleStageUpdate(index + 1)}
                                                                sx={{ borderRadius: 2 }}
                                                            >
                                                                {updating ? 'Updating...' : 'Mark as Completed'}
                                                            </Button>
                                                        </Box>
                                                    </StepContent>
                                                </Step>
                                            ))}
                                        </Stepper>
                                        {activeStep === caseStages.length - 1 && (
                                            <Box sx={{ mt: 3, p: 3, bgcolor: '#f0fff4', borderRadius: 3, textAlign: 'center' }}>
                                                <CheckCircle2 size={48} color="#10b981" />
                                                <Typography variant="h6" sx={{ color: '#059669', mt: 1, fontWeight: 700 }}>
                                                    Case Process Completed
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>

                                {/* History */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Tracking History</Typography>
                                        <List disablePadding>
                                            {caseHistory.length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                                    No history yet
                                                </Typography>
                                            ) : (
                                                caseHistory.map((item, index) => (
                                                    <ListItem key={index} sx={{ px: 0, alignItems: 'flex-start' }}>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.stage}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {new Date(item.created_at).toLocaleDateString()}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            secondary={item.remarks}
                                                        />
                                                    </ListItem>
                                                ))
                                            )}
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Grid>
            
            <SendToPartnerModal 
                open={openShareModal} 
                onClose={() => setOpenShareModal(false)} 
                lead={selectedLead}
            />

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

export default Cases;
