import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Card, Chip, Button, CircularProgress, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, useTheme, alpha, Avatar, IconButton, Tooltip,
    InputAdornment, Select, MenuItem, FormControl, OutlinedInput
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { 
    Eye, CheckCircle, XCircle, Clock, FileText, AlertCircle, TrendingUp, Users, ShieldCheck, 
    ShieldAlert, Sparkles, ChevronRight, Activity, Search, Filter, RefreshCw, Download, Zap, ArrowDownUp
} from 'lucide-react';
import { partnerProfileService } from '../../services/api';
import PartnerProfileView from './PartnerProfileView';

// Utility for generating mock mini-chart data
const generateSparkline = () => Array.from({ length: 15 }, (_, i) => ({ val: Math.floor(Math.random() * 40) + 20 }));

const motionRowVariant = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
};

const motionCardVariant = {
    hover: { y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', transition: { duration: 0.3 } }
};

const PartnerDashboard = () => {
    const theme = useTheme();
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [decisionModal, setDecisionModal] = useState({ open: false, profile: null, status: '' });
    const [reason, setReason] = useState('');
    
    // Future-ready filter / search state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Shared', 'Accepted', 'Rejected'
    const [sortBy, setSortBy] = useState('Newest'); // 'Newest', 'Oldest', 'AmountHigh', 'AmountLow'

    const partner = JSON.parse(localStorage.getItem('partner') || '{"bank_name": "Credit Partner"}');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const data = await partnerProfileService.getForPartner(partner.id);
            setProfiles(data);
            if (selectedProfile) {
                const updated = data.find(p => p.id === selectedProfile.id);
                if (updated) setSelectedProfile(updated);
            }
        } catch (err) {
            setError('Failed to load shared profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        await fetchProfiles();
        setTimeout(() => setIsSyncing(false), 800);
    };

    const exportData = () => {
        // Mock export feature
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
        a.href = URL.createObjectURL(file);
        a.download = `Veda_CRM_Report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleDecisionClick = (profile, status) => {
        setDecisionModal({ open: true, profile, status });
        setReason('');
    };

    const handleViewProfile = (profile) => {
        setSelectedProfile(profile);
        setViewMode('view');
    };

    const submitDecision = async () => {
        if (decisionModal.status === 'Rejected' && !reason.trim()) return;

        try {
            await partnerProfileService.updateDecision(decisionModal.profile.id, {
                status: decisionModal.status,
                reason: reason
            });
            fetchProfiles();
            setDecisionModal({ open: false, profile: null, status: '' });
        } catch (err) {
            console.error(err);
        }
    };

    // Derived Statistics
    const totalReceived = profiles.length;
    const pendingReview = profiles.filter(p => p.status === 'Shared').length;
    const acceptedCount = profiles.filter(p => p.status === 'Accepted').length;
    const rejectedCount = profiles.filter(p => p.status === 'Rejected').length;

    // Advanced Filtering and Sorting Logic
    const filteredProfiles = useMemo(() => {
        let result = profiles;

        // 1. Text Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => p.leads?.name?.toLowerCase().includes(query) || p.leads?.loan_type?.toLowerCase().includes(query));
        }

        // 2. Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(p => p.status === statusFilter);
        }

        // 3. Sorting
        result.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            const amountA = a.leads?.loan_amount || 0;
            const amountB = b.leads?.loan_amount || 0;

            if (sortBy === 'Newest') return dateB - dateA;
            if (sortBy === 'Oldest') return dateA - dateB;
            if (sortBy === 'AmountHigh') return amountB - amountA;
            if (sortBy === 'AmountLow') return amountA - amountB;
            return 0;
        });

        return result;
    }, [profiles, searchQuery, statusFilter, sortBy]);

    // AI Insight Generator
    const getAiInsight = () => {
        if (pendingReview > 5) return `High load detected. You have ${pendingReview} pending reviews. Prioritize standardizing decisions today.`;
        if (pendingReview > 0) return `Steady flow. ${pendingReview} profiles await your decision.`;
        if (acceptedCount > rejectedCount && totalReceived > 0) return `Excellent conversion rate! Most profiles are successfully passing through.`;
        if (totalReceived === 0) return `Awaiting routing. No profiles shared with ${partner.bank_name} yet.`;
        return `Queue is clear. Great job staying on top of applications!`;
    };

    // Components
    const SparklineBg = ({ color }) => (
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', opacity: 0.15, zIndex: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparkline()}>
                    <Area type="monotone" dataKey="val" stroke={color} fill={color} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );

    const KPICard = ({ title, value, icon, color, delay }) => (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay }}>
            <motion.div variants={motionCardVariant} whileHover="hover">
                <Card sx={{ 
                    p: 3, borderRadius: 5, position: 'relative', overflow: 'hidden',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                    backdropFilter: 'blur(20px)', border: '1px solid', borderColor: alpha(color, 0.2), boxShadow: `0 8px 32px ${alpha(color, 0.1)}`
                }}>
                    <SparklineBg color={color} />
                    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: alpha(theme.palette.text.primary, 0.6), textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 900, background: `linear-gradient(45deg, ${color}, ${theme.palette.text.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '50%', background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.05)} 100%)`, color: color }}>
                            {icon}
                        </Box>
                    </Box>
                </Card>
            </motion.div>
        </motion.div>
    );

    const FilterChip = ({ label, count, colorHex }) => {
        const isActive = statusFilter === label || (label === 'All' && statusFilter === 'All');
        const activeColor = label === 'All' ? theme.palette.primary.main : colorHex;
        return (
            <Chip 
                label={`${label} ${count !== undefined ? `(${count})` : ''}`}
                onClick={() => setStatusFilter(label)}
                sx={{ 
                    fontWeight: 700, borderRadius: 2.5, px: 2, py: 2.5, transition: 'all 0.3s',
                    bgcolor: isActive ? alpha(activeColor, 0.15) : 'background.paper',
                    color: isActive ? activeColor : 'text.secondary',
                    border: '1px solid', borderColor: isActive ? alpha(activeColor, 0.4) : 'divider',
                    '&:hover': { bgcolor: alpha(activeColor, 0.08), borderColor: alpha(activeColor, 0.2) }
                }} 
            />
        );
    };

    if (loading && viewMode === 'list') {
        return (
            <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Activity size={48} color={theme.palette.primary.main} />
                </motion.div>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 2 }}>SYNDICATING DATA...</Typography>
            </Box>
        );
    }

    if (viewMode === 'view' && selectedProfile) {
        return <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}><PartnerProfileView profile={selectedProfile} onBack={() => setViewMode('list')} onDecision={handleDecisionClick} /></motion.div>;
    }

    return (
        <Box sx={{ minHeight: '100%', pb: 8 }}>
            {/* Header Area */}
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ p: 1, borderRadius: 3, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}>
                            <Sparkles size={24} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, background: 'linear-gradient(45deg, #1e293b, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Credit Hub
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Welcome to the {partner.bank_name} Command Center. Monitor, search, and decide safely.
                    </Typography>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button variant="outlined" startIcon={<Download size={18} />} onClick={exportData} sx={{ borderRadius: 3, fontWeight: 700, px: 3, bgcolor: 'background.paper' }}>
                            Export Sync
                        </Button>
                        <Button variant="contained" onClick={handleSync} startIcon={<RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />} sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}>
                            Refresh Hub
                        </Button>
                    </Box>
                </motion.div>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 600 }}>{error}</Alert>}

            {/* Veda AI Insight Banner */}
            {profiles.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Card sx={{ mb: 4, p: 2.5, borderRadius: 4, bgcolor: alpha('#8b5cf6', 0.05), border: '1px solid', borderColor: alpha('#8b5cf6', 0.2), display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }}>
                            <Zap size={20} />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Veda AI Context</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>{getAiInsight()}</Typography>
                        </Box>
                    </Card>
                </motion.div>
            )}

            {/* KPIs */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Total Received" value={totalReceived} icon={<Users size={28} />} color="#3b82f6" delay={0.1} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Pending Review" value={pendingReview} icon={<Clock size={28} />} color="#f59e0b" delay={0.2} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Profiles Accepted" value={acceptedCount} icon={<ShieldCheck size={28} />} color="#10b981" delay={0.3} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Profiles Rejected" value={rejectedCount} icon={<ShieldAlert size={28} />} color="#ef4444" delay={0.4} /></Grid>
            </Grid>

            {/* Glassmorphic Filters & Search Row */}
            <Box sx={{ mb: 4, p: 2, borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(20px)', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: { xs: 1, md: 0 }, width: { xs: '100%', md: 'auto' } }}>
                    <FilterChip label="All" count={totalReceived} />
                    <FilterChip label="Shared" count={pendingReview} colorHex="#f59e0b" />
                    <FilterChip label="Accepted" count={acceptedCount} colorHex="#10b981" />
                    <FilterChip label="Rejected" count={rejectedCount} colorHex="#ef4444" />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                    <TextField
                        placeholder="Search Applicant or Type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: { xs: '100%', md: 250 }, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            displayEmpty
                            input={<OutlinedInput sx={{ borderRadius: 3, bgcolor: 'background.paper' }} />}
                            startAdornment={<InputAdornment position="start"><ArrowDownUp size={16} /></InputAdornment>}
                        >
                            <MenuItem value="Newest">Newest First</MenuItem>
                            <MenuItem value="Oldest">Oldest First</MenuItem>
                            <MenuItem value="AmountHigh">Amount: High-Low</MenuItem>
                            <MenuItem value="AmountLow">Amount: Low-High</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Active Feed */}
            <Box>
                {filteredProfiles.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card sx={{ p: 8, borderRadius: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.4) }}>
                            <Box sx={{ p: 3, borderRadius: '50%', bgcolor: alpha(theme.palette.text.secondary, 0.05), display: 'inline-flex', mb: 3 }}>
                                <Filter size={48} color={theme.palette.text.secondary} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>No Matches Found</Typography>
                            <Typography variant="body1" color="text.secondary">Try adjusting your active filters or clear your search query.</Typography>
                        </Card>
                    </motion.div>
                ) : (
                    <Grid container spacing={2}>
                        <AnimatePresence>
                            {filteredProfiles.map((p, idx) => (
                                <Grid size={{ xs: 12 }} key={p.id}>
                                    <motion.div variants={motionRowVariant} initial="hidden" animate="visible" exit="exit" transition={{ delay: idx * 0.03 }} layout>
                                        <Card sx={{ 
                                            p: { xs: 2, sm: 3 }, borderRadius: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                                            alignItems: { xs: 'flex-start', md: 'center' }, gap: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                                            border: '1px solid', borderColor: p.status === 'Shared' ? alpha('#f59e0b', 0.3) : 'divider',
                                            bgcolor: p.status === 'Shared' ? alpha('#f59e0b', 0.02) : 'background.paper',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', borderColor: theme.palette.primary.main }
                                        }}>
                                            {/* Profile Avatar & Info */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 2, width: '100%' }}>
                                                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800, fontSize: '1.5rem' }}>
                                                    {p.leads?.name?.charAt(0) || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>{p.leads?.name}</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                        <Chip size="small" label={p.leads?.loan_type} sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }} />
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Clock size={14} /> {new Date(p.created_at).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Amount & Status */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, width: '100%', justifyContent: { xs: 'space-between', md: 'center' }, py: { xs: 2, md: 0 }, borderTop: { xs: '1px solid', md: 'none' }, borderBottom: { xs: '1px solid', md: 'none' }, borderColor: 'divider' }}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>Amount</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{p.leads?.loan_amount?.toLocaleString()}</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Status</Typography>
                                                    <Chip label={p.status} size="small" color={p.status === 'Accepted' ? 'success' : p.status === 'Rejected' ? 'error' : 'warning'} sx={{ fontWeight: 800, borderRadius: 1.5, px: 1, height: 28 }} icon={p.status === 'Accepted' ? <CheckCircle size={14} /> : p.status === 'Rejected' ? <XCircle size={14} /> : <Activity size={14} />} />
                                                </Box>
                                            </Box>

                                            {/* Actions */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, width: '100%' }}>
                                                <Button variant="contained" color="primary" onClick={() => handleViewProfile(p)} endIcon={<ChevronRight size={16} />} sx={{ borderRadius: 3, fontWeight: 700, px: 3, py: 1.2, flex: { xs: 1, md: 'none' } }}>Review</Button>
                                                {p.status === 'Shared' && (
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Quick Accept">
                                                            <IconButton color="success" onClick={() => handleDecisionClick(p, 'Accepted')} sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) } }}><CheckCircle size={20} /></IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Quick Reject">
                                                            <IconButton color="error" onClick={() => handleDecisionClick(p, 'Rejected')} sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}><XCircle size={20} /></IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </AnimatePresence>
                    </Grid>
                )}
            </Box>

            {/* Decision Modal overrides */}
            <Dialog open={decisionModal.open} onClose={() => setDecisionModal({ ...decisionModal, open: false })} PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 400, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}>
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {decisionModal.status === 'Accepted' ? <CheckCircle color="#10b981" /> : <XCircle color="#ef4444" />} {decisionModal.status === 'Accepted' ? 'Approve Loan Process' : 'Decline Profile'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        {decisionModal.status === 'Accepted' ? 'Are you sure you want to accept this profile for processing? The CRM team will be notified immediately.' : 'Please provide a clear reason for rejecting this profile. This feedback is critical for our sourcing.'}
                    </Typography>
                    {decisionModal.status === 'Rejected' && (
                        <TextField fullWidth multiline rows={3} label="Reason for Rejection" variant="outlined" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Low CIBIL score, Outside serviceable boundaries..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDecisionModal({ ...decisionModal, open: false })} sx={{ fontWeight: 700, borderRadius: 2 }}>Cancel</Button>
                    <Button variant="contained" color={decisionModal.status === 'Accepted' ? 'success' : 'error'} onClick={submitDecision} disabled={decisionModal.status === 'Rejected' && !reason.trim()} sx={{ px: 4, py: 1.2, fontWeight: 800, borderRadius: 3, boxShadow: `0 8px 16px ${decisionModal.status === 'Accepted' ? alpha('#10b981', 0.3) : alpha('#ef4444', 0.3)}` }}>
                        {decisionModal.status === 'Accepted' ? 'Confirm Approval' : 'Submit Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PartnerDashboard;
