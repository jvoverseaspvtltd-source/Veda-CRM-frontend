import {
    Box,
    Typography,
    Grid,
    Avatar,
    Divider,
    Paper,
    Chip,
    Button,
    CircularProgress,
    LinearProgress,
    useTheme,
    alpha,
    Stack,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Snackbar,
    Alert,
    Tab,
    Tabs,
    InputAdornment,
    Fab,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { 
    Mail, 
    Calendar, 
    Activity, 
    Phone, 
    Building, 
    ShieldCheck, 
    Edit3, 
    TrendingUp, 
    Target as TargetIcon, 
    Award, 
    FileText, 
    ChevronRight,
    Check,
    Copy,
    Share2,
    Layers,
    Timer,
    Shield,
    Lock,
    Flame,
    Snowflake,
    ThermometerSun,
    Fingerprint,
    Radar,
    Star,
    Cpu,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Plus,
    Camera,
    MapPin,
    User,
    Briefcase,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useMemo, useRef } from 'react';

const AdvancedCard = ({ children, title, subtitle, icon: Icon, sx = {} }) => (
    <Paper
        elevation={0}
        component={motion.div}
        whileHover={{ translateY: -4 }}
        sx={{ 
            p: { xs: 2.5, md: 3 }, 
            borderRadius: 6, 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            ...sx 
        }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 2, md: 3 }, minWidth: 0 }}>
            <Box sx={{ minWidth: 0, flexShrink: 1 }}>
                <Typography variant="subtitle2" sx={{ 
                    fontWeight: 800, 
                    color: 'text.secondary', 
                    letterSpacing: 0.5, 
                    fontSize: { xs: '0.6rem', md: '0.75rem' },
                    lineHeight: 1.2,
                    textTransform: 'uppercase'
                }}>
                    {title}
                </Typography>
                {subtitle && <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.7 }}>{subtitle}</Typography>}
            </Box>
            {Icon && <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: theme => alpha(theme.palette.primary.main, 0.05), color: 'primary.main', display: 'flex', flexShrink: 0, ml: 1 }}><Icon size={16} /></Box>}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {children}
        </Box>
    </Paper>
);

const StatChange = ({ val }) => {
    if (val === undefined || val === null) return null;
    const isPos = val >= 0;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: isPos ? 'success.main' : 'error.main' }}>
            {isPos ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
            <Typography variant="caption" sx={{ fontWeight: 900 }}>{Math.abs(val)}%</Typography>
        </Box>
    );
};

const Profile = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile: authProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [tab, setTab] = useState('logs');
    const [goalOpen, setGoalOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [copyState, setCopyState] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const [tempGoals, setTempGoals] = useState({ monthly_loan_target: 0, monthly_lead_target: 0 });
    const [editForm, setEditForm] = useState({ 
        full_name: '', 
        department: '', 
        phone: '', 
        location: '',
        reporting_manager: '',
        skills: []
    });
    const [avatarUrl, setAvatarUrl] = useState('');
    const [saving, setSaving] = useState(false);
    
    // Password Change State
    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    const loadProfileData = async () => {
        try {
            if (authProfile?.id) {
                const result = await profileService.getStats(authProfile.id);
                setData(result);
                setTempGoals(result.profile.performance_goals || { monthly_loan_target: 10000000, monthly_lead_target: 20 });
                setEditForm({
                    full_name: result.profile.full_name || '',
                    department: result.profile.department || '',
                    phone: result.profile.phone || '',
                    location: result.profile.location || '',
                    reporting_manager: result.profile.reporting_manager || '',
                    skills: result.profile.skills || []
                });
                setAvatarUrl(result.profile.avatar_url || '');
            }
        } catch (err) {
            console.error("Profile sync failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfileData();
        loadEmployees();
    }, [authProfile]);

    const loadEmployees = async () => {
        try {
            const emps = await profileService.getAllEmployees();
            setEmployees(emps?.filter(e => e.id !== authProfile?.id) || []);
        } catch (err) {
            console.error("Failed to load employees:", err);
        }
    };

    const handleCopy = (text, id) => {
        if (!text || text === 'Not Provided') return;
        navigator.clipboard.writeText(text);
        setCopyState(id);
        setSnackbar({ open: true, message: 'Copied to clipboard!', severity: 'success' });
        setTimeout(() => setCopyState(null), 2000);
    };

    const handleSaveGoals = async () => {
        setSaving(true);
        try {
            await profileService.updateGoals(authProfile.id, tempGoals);
            setSnackbar({ open: true, message: 'Performance targets synchronized!', severity: 'success' });
            setGoalOpen(false);
            await loadProfileData();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update targets.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await profileService.update(authProfile.id, editForm);
            setSnackbar({ open: true, message: 'Professional dossier updated!', severity: 'success' });
            setEditOpen(false);
            await loadProfileData();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            setSnackbar({ open: true, message: 'New passwords do not match!', severity: 'error' });
            return;
        }
        if (passForm.newPassword.length < 6) {
            setSnackbar({ open: true, message: 'Password must be at least 6 characters.', severity: 'error' });
            return;
        }

        setSaving(true);
        try {
            const { authService } = await import('../services/api');
            await authService.changePassword(authProfile.id, passForm.currentPassword, passForm.newPassword);
            setSnackbar({ open: true, message: 'Security credentials updated successfully!', severity: 'success' });
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update password.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setSnackbar({ open: true, message: 'File too large. Max 5MB allowed.', severity: 'error' });
            return;
        }

        setUploadingAvatar(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result;
                await profileService.uploadAvatar(authProfile.id, base64);
                setAvatarUrl(base64);
                setSnackbar({ open: true, message: 'Profile photo updated!', severity: 'success' });
                setAvatarOpen(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to upload photo.', severity: 'error' });
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress color="primary" thickness={2} size={40} />
        </Box>
    );

    if (!data) return <Typography sx={{ m: 4 }}>Error: Could not retrieve secure profile data.</Typography>;

    const { profile, stats, activities } = data;
    const loanTarget = profile.performance_goals?.monthly_loan_target || 10000000;
    const loanProgress = Math.min((stats.totalSanctionedAmount / loanTarget) * 100, 100);

    const completenessScore = [
        profile.full_name, 
        profile.email, 
        profile.phone, 
        profile.department, 
        profile.corporate_id,
        profile.location,
        profile.avatar_url
    ].filter(Boolean).length;
    const dossierCompleteness = Math.round((completenessScore / 7) * 100);
    const totalHealthLeads = (stats.healthMap?.Hot || 0) + (stats.healthMap?.Warm || 0) + (stats.healthMap?.Cold || 0);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', bgcolor: alpha(theme.palette.background.default, 0.4), minHeight: '100vh' }}>
            <Box sx={{ mb: { xs: 4, md: 8 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 4 }, alignItems: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar 
                                sx={{ 
                                    width: { xs: 120, md: 160 }, 
                                    height: { xs: 120, md: 160 }, 
                                    border: '4px solid', 
                                    borderColor: 'primary.main',
                                    p: 0.5,
                                    bgcolor: 'background.paper',
                                    boxShadow: theme => `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`
                                }}
                            >
                                {avatarUrl ? (
                                    <Avatar 
                                        src={avatarUrl}
                                        sx={{ width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <Avatar 
                                        sx={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            bgcolor: 'secondary.main',
                                            fontSize: { xs: 40, md: 56 },
                                            fontWeight: 900
                                        }}
                                    >
                                        {profile.full_name?.charAt(0)}
                                    </Avatar>
                                )}
                            </Avatar>
                            <Tooltip title="Change Photo">
                                <IconButton
                                    onClick={() => setAvatarOpen(true)}
                                    sx={{ 
                                        position: 'absolute', 
                                        bottom: 4, 
                                        right: 4, 
                                        bgcolor: 'primary.main', 
                                        color: '#fff',
                                        p: 1,
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        boxShadow: 2
                                    }}
                                >
                                    <Camera size={16} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </motion.div>
                    <Box sx={{ position: 'absolute', bottom: 8, right: -8, bgcolor: 'success.main', p: 0.8, borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: { xs: 'none', md: 'flex' } }}>
                        <ShieldCheck size={18} color="#fff" />
                    </Box>
                </Box>
                
                <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' }, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2, mb: 1.5, minWidth: 0 }}>
                        <Typography variant="h3" sx={{ 
                            fontWeight: 900, 
                            letterSpacing: -1.5, 
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%'
                        }}>
                            {profile.full_name || 'New User'}
                        </Typography>
                        <Chip 
                            label={profile.role?.toUpperCase()} 
                            sx={{ fontWeight: 800, bgcolor: 'primary.main', color: '#fff', px: 1, flexShrink: 0 }} 
                        />
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'center', md: 'flex-start' }, mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip size="small" label={profile.department || 'Operations'} variant="outlined" sx={{ fontWeight: 700, borderColor: 'primary.light' }} />
                        {profile.location && (
                            <Chip size="small" icon={<MapPin size={12} />} label={profile.location} variant="outlined" sx={{ fontWeight: 700, borderColor: 'divider' }} />
                        )}
                        <Tooltip title="Click to copy Employee ID">
                            <Chip 
                                size="small" 
                                label={`ID: ${profile.corporate_id}`} 
                                onClick={() => handleCopy(profile.corporate_id, 'id')}
                                icon={copyState === 'id' ? <Check size={12} /> : <Copy size={12} />}
                                sx={{ fontWeight: 700, borderStyle: 'dashed', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }} 
                            />
                        </Tooltip>
                        <Chip size="small" label={`Rank: #${stats?.teamRank || 1} in Team`} icon={<Award size={14} />} sx={{ fontWeight: 900, fontSize: '0.75rem', bgcolor: alpha(theme.palette.warning.main, 0.15), color: 'warning.dark', border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.3) }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 650, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        Access Level: <strong>Standard</strong>. Your profile data is synchronized with the CRM to track leads, applications, and performance targets.
                    </Typography>
                    
                    <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), maxWidth: 350 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>PROFILE COMPLETENESS</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: dossierCompleteness >= 80 ? 'success.main' : dossierCompleteness >= 50 ? 'warning.main' : 'error.main' }}>{dossierCompleteness}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={dossierCompleteness} sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1), '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` } }} />
                    </Box>
                </Box>

                <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<Edit3 size={18} />}
                        onClick={() => setEditOpen(true)}
                        sx={{ borderRadius: 4, px: 4, py: 1.5, fontWeight: 800, boxShadow: theme => `0 10px 25px ${alpha(theme.palette.primary.main, 0.25)}` }}
                    >
                        Edit Profile
                    </Button>
                    <IconButton sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, p: 1.5 }}>
                        <Share2 size={20} />
                    </IconButton>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <AdvancedCard title="Pipeline Value" icon={Layers} sx={{ borderBottom: `4px solid ${alpha(theme.palette.primary.main, stats.pipelineValue > 0 ? 1 : 0.2)}`, height: '100%', opacity: stats.pipelineValue > 0 ? 1 : 0.7 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.5rem' }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    ₹{(stats.pipelineValue / 10000000).toFixed(2)}Cr
                                </Typography>
                                <StatChange val={stats?.percentageChange?.revenue} />
                                {stats.pipelineValue === 0 && <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>PENDING DATA</Typography>}
                            </AdvancedCard>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <AdvancedCard title="Conv. Ratio" icon={TrendingUp} sx={{ borderBottom: `4px solid ${alpha(theme.palette.success.main, stats.conversionRate > 0 ? 1 : 0.2)}`, height: '100%', opacity: stats.conversionRate > 0 ? 1 : 0.7 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>{stats.conversionRate}%</Typography>
                                <StatChange val={stats?.percentageChange?.conversion} />
                                {stats.conversionRate === 0 && <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>READY</Typography>}
                            </AdvancedCard>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <AdvancedCard title="Avg Velocity" icon={Timer} sx={{ borderBottom: `4px solid ${alpha(theme.palette.warning.main, parseFloat(stats.conversionVelocity) > 0 ? 1 : 0.2)}`, height: '100%', opacity: parseFloat(stats.conversionVelocity) > 0 ? 1 : 0.7 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>{stats.conversionVelocity}d</Typography>
                                <StatChange val={stats?.percentageChange?.velocity} />
                                {parseFloat(stats.conversionVelocity) === 0 && <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>N/A</Typography>}
                            </AdvancedCard>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <AdvancedCard title="Quality Score" icon={TargetIcon} sx={{ borderBottom: `4px solid ${alpha(theme.palette.error.main, stats.qualityScore > 0 ? 1 : 0.2)}`, height: '100%', opacity: stats.qualityScore > 0 ? 1 : 0.7 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>{stats.qualityScore.toFixed(stats.qualityScore > 0 ? 1 : 0)}</Typography>
                                {stats.qualityScore === 0 && <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>INITIALIZED</Typography>}
                            </AdvancedCard>
                        </Grid>
                    </Grid>

                    {stats?.trendData && stats.trendData.length > 0 && (
                        <Paper sx={{ mb: 3, p: 3, borderRadius: 8, border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Performance Trend (6 Months)</Typography>
                                <Chip size="small" icon={<Zap size={14} />} label="Live Track" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.dark', fontWeight: 800 }} />
                            </Box>
                            <Box sx={{ width: '100%', height: 260, minWidth: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800 }}
                                            itemStyle={{ fontWeight: 900 }}
                                        />
                                        <Area type="monotone" dataKey="revenue" name="Sanctions (Lakhs)" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    )}

                    <Paper sx={{ borderRadius: 8, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: { xs: 3, md: 0 } }}>
                        <Tabs
                            value={tab}
                            onChange={(e, v) => setTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                px: { xs: 1, md: 3 },
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTab-root': { py: { xs: 2.5, md: 3 }, fontWeight: 900, fontSize: { xs: '0.75rem', md: '0.875rem' } }
                            }}
                        >
                            <Tab label="GOAL TRACKER" icon={<TargetIcon size={18} />} iconPosition="start" value="goals" />
                            <Tab label="ACHIEVEMENTS" icon={<Award size={18} />} iconPosition="start" value="achievements" />
                            <Tab label="SERVICE LOGS" icon={<Activity size={18} />} iconPosition="start" value="logs" />
                            <Tab label="SECURITY" icon={<Fingerprint size={18} />} iconPosition="start" value="security" />
                        </Tabs>

                        <Box sx={{ p: { xs: 2.5, md: 4 }, minHeight: 450 }}>
                            <AnimatePresence mode="wait">
                                {tab === 'goals' ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="goals">
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5, alignItems: 'center' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Monthly Disbursement KPI</Typography>
                                            <Button size="small" variant="outlined" onClick={() => setGoalOpen(true)} sx={{ fontWeight: 800, borderRadius: 3, px: 3 }}>Adjust Benchmarks</Button>
                                        </Box>
                                        <Stack spacing={5}>
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-end' }}>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>REVENUE ACHIEVEMENT</Typography>
                                                        <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{(stats.totalSanctionedAmount / 100000).toFixed(1)}L <Typography variant="caption" sx={{ opacity: 0.5 }}>/ ₹{(loanTarget / 100000).toFixed(1)}L</Typography></Typography>
                                                    </Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>{loanProgress.toFixed(0)}%</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={loanProgress || 0.5}
                                                    sx={{ height: 14, borderRadius: 7, bgcolor: alpha(theme.palette.primary.main, 0.08), '& .MuiLinearProgress-bar': { borderRadius: 7, backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})` } }}
                                                />
                                                <Grid container spacing={2} sx={{ mt: 3 }}>
                                                    <Grid size={{ xs: 6 }}>
                                                        <Paper sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>WEEKLY BENCHMARK</Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 900 }}>₹{((loanTarget / 4) / 100000).toFixed(1)}L</Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid size={{ xs: 6 }}>
                                                        <Paper sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.02), border: '1px solid', borderColor: alpha(theme.palette.secondary.main, 0.1) }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>DAILY BURN RATE</Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 900 }}>₹{((loanTarget / 22) / 100000).toFixed(1)}L</Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                            {stats.totalSanctionedAmount === 0 && (
                                                <Alert severity="info" variant="outlined" sx={{ borderRadius: 4, borderStyle: 'dashed', '& .MuiAlert-icon': { color: 'primary.main' } }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>PERFORMANCE TRACKER</Typography>
                                                    <Typography variant="caption">Your targets are set. The tracker will update once your first disbursement is sanctioned.</Typography>
                                                </Alert>
                                            )}
                                        </Stack>
                                    </motion.div>
                                ) : tab === 'achievements' ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="achievements">
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 4 }}>Professional Milestones</Typography>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                <Box sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.3), bgcolor: alpha(theme.palette.warning.main, 0.05), textAlign: 'center', height: '100%' }}>
                                                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'warning.main', width: 56, height: 56, color: '#fff' }}><Star size={28} /></Avatar>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Top Performer</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>Sanctioned over ₹1Cr overall.</Typography>
                                                    {stats.totalSanctionedAmount >= 10000000 ? (
                                                        <Chip size="small" label="UNLOCKED" color="warning" sx={{ mt: 2, fontWeight: 800 }} />
                                                    ) : (
                                                        <Chip size="small" label="LOCKED" variant="outlined" sx={{ mt: 2, fontWeight: 800, opacity: 0.5 }} />
                                                    )}
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                <Box sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.3), bgcolor: alpha(theme.palette.success.main, 0.05), textAlign: 'center', height: '100%' }}>
                                                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main', width: 56, height: 56, color: '#fff' }}><TrendingUp size={28} /></Avatar>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>High Converter</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>Maintained a win rate above 40%.</Typography>
                                                    {stats.conversionRate >= 40 ? (
                                                        <Chip size="small" label="UNLOCKED" color="success" sx={{ mt: 2, fontWeight: 800 }} />
                                                    ) : (
                                                        <Chip size="small" label="LOCKED" variant="outlined" sx={{ mt: 2, fontWeight: 800, opacity: 0.5 }} />
                                                    )}
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                <Box sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.3), bgcolor: alpha(theme.palette.primary.main, 0.05), textAlign: 'center', height: '100%' }}>
                                                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56, color: '#fff' }}><Timer size={28} /></Avatar>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Fast Closer</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>Closed average deals in under 3 days.</Typography>
                                                    {(parseFloat(stats.conversionVelocity) > 0 && parseFloat(stats.conversionVelocity) <= 3) ? (
                                                        <Chip size="small" label="UNLOCKED" color="primary" sx={{ mt: 2, fontWeight: 800 }} />
                                                    ) : (
                                                        <Chip size="small" label="LOCKED" variant="outlined" sx={{ mt: 2, fontWeight: 800, opacity: 0.5 }} />
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </motion.div>
                                ) : tab === 'security' ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="security">
                                        <Box sx={{ maxWidth: 500, mx: 'auto', py: 2 }}>
                                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mx: 'auto', mb: 2 }}>
                                                    <Lock size={32} />
                                                </Avatar>
                                                <Typography variant="h6" sx={{ fontWeight: 900 }}>Update Security Credentials</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Modify your password to keep your account secure.</Typography>
                                            </Box>
                                            
                                            <form onSubmit={handlePasswordChange}>
                                                <Stack spacing={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="CURRENT PASSWORD"
                                                        type={showPass.current ? 'text' : 'password'}
                                                        required
                                                        value={passForm.currentPassword}
                                                        onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start"><Lock size={18} /></InputAdornment>,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowPass({ ...showPass, current: !showPass.current })} edge="end">
                                                                        {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                            sx: { borderRadius: 4, fontWeight: 800 }
                                                        }}
                                                    />
                                                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                                                    <TextField
                                                        fullWidth
                                                        label="NEW PASSWORD"
                                                        type={showPass.new ? 'text' : 'password'}
                                                        required
                                                        value={passForm.newPassword}
                                                        onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start"><Zap size={18} /></InputAdornment>,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowPass({ ...showPass, new: !showPass.new })} edge="end">
                                                                        {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                            sx: { borderRadius: 4, fontWeight: 800 }
                                                        }}
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        label="CONFIRM NEW PASSWORD"
                                                        type={showPass.confirm ? 'text' : 'password'}
                                                        required
                                                        value={passForm.confirmPassword}
                                                        onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start"><ShieldCheck size={18} /></InputAdornment>,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })} edge="end">
                                                                        {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                            sx: { borderRadius: 4, fontWeight: 800 }
                                                        }}
                                                    />
                                                    
                                                    <Button
                                                        fullWidth
                                                        type="submit"
                                                        variant="contained"
                                                        disabled={saving}
                                                        sx={{ py: 1.8, borderRadius: 4, fontWeight: 900, fontSize: '1rem', mt: 2, boxShadow: theme => `0 12px 30px ${alpha(theme.palette.primary.main, 0.3)}` }}
                                                    >
                                                        {saving ? <CircularProgress size={24} color="inherit" /> : 'Update Security Credentials'}
                                                    </Button>
                                                </Stack>
                                            </form>
                                        </Box>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="logs">
                                        <Stack spacing={3}>
                                            {activities.length > 0 ? activities.map((a, i) => (
                                                <Box key={i} sx={{ display: 'flex', gap: 3 }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'primary.main', border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                                                            <FileText size={22} />
                                                        </Avatar>
                                                        {i < activities.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 1, minHeight: 40 }} />}
                                                    </Box>
                                                    <Box sx={{ pb: 4, flexGrow: 1, minWidth: 0 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, minWidth: 0 }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.leads?.name || 'Batch Update'}</Typography>
                                                            <Chip size="small" label={new Date(a.created_at).toLocaleDateString()} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'divider', flexShrink: 0 }} />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, mb: 1.5, letterSpacing: 0.3 }}>
                                                            ACTION: **{a.stage || a.status}** • PRODUCT: {a.leads?.loan_type?.toUpperCase() || 'GENERAL'}
                                                        </Typography>
                                                        <Button 
                                                            size="small" 
                                                            color="primary" 
                                                            onClick={() => navigate(a.leads ? `/leads` : `/cases/${a.id}`)}
                                                            sx={{ p: 0, minWidth: 0, fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                                                        >
                                                            Open Record <ChevronRight size={12} />
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )) : (
                                                <Box sx={{ textAlign: 'center', py: 10, opacity: 0.3 }}>
                                                    <Box sx={{ display: 'inline-flex', p: 3, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.05), mb: 3 }}>
                                                        <Activity size={48} />
                                                    </Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>RECENT ACTIVITY</Typography>
                                                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', maxWidth: 300, mx: 'auto' }}>No recent activity found. Interactions with leads will appear here.</Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={3}>
                        {(authProfile?.role === 'admin' || authProfile?.role === 'Admin') && (
                            <AdvancedCard title="Administrator Controls" icon={ShieldCheck} sx={{ bgcolor: theme => alpha(theme.palette.secondary.main, 0.05), border: '2px solid', borderColor: alpha(theme.palette.secondary.main, 0.3) }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 2 }}>You have elevated permissions. Navigate to the dashboard for team-wide intelligence.</Typography>
                                <Button variant="contained" color="secondary" fullWidth onClick={() => navigate('/')} sx={{ mb: 1.5, fontWeight: 800 }}>View Team Performance</Button>
                                <Button variant="outlined" color="secondary" fullWidth sx={{ fontWeight: 800 }}>Manage Approvals</Button>
                            </AdvancedCard>
                        )}

                        <AdvancedCard title="Veda Intelligence Insights" icon={Zap} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), borderColor: alpha(theme.palette.primary.main, 0.2), boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.06)}` }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {stats?.healthMap?.Hot > 0 && (
                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                        <Flame size={18} color={theme.palette.error.main} style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>High Priority Action</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{stats.healthMap.Hot} Hot leads are waiting in your pipeline. Contact them soon!</Typography>
                                        </Box>
                                    </Box>
                                )}
                                {stats?.aiInsights?.map((insight, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                        <Cpu size={18} color={theme.palette.primary.main} style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>Behavioral Insight</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{insight}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </AdvancedCard>

                        <AdvancedCard title="Employee Details" icon={Shield}>
                            <Box sx={{ mb: 4, pb: 4, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Chip
                                        label="ACTIVE"
                                        size="small"
                                        icon={<Lock size={12} />}
                                        sx={{ fontWeight: 900, bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main', border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1), height: 22, fontSize: '0.65rem' }}
                                    />
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: 1 }}>STANDARD ACCESS</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>EMPLOYEE ID</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>{profile.corporate_id || 'PENDING'}</Typography>
                            </Box>

                            <Stack spacing={3.5}>
                                {[
                                    { icon: <Mail size={18} />, label: 'Email Address', val: profile.email, id: 'email' },
                                    { icon: <Phone size={18} />, label: 'Phone Number', val: profile.phone || 'Not Provided', id: 'phone' },
                                    { icon: <MapPin size={18} />, label: 'Location', val: profile.location || 'Not Set', id: 'location' },
                                    { icon: <Calendar size={18} />, label: 'Joining Date', val: profile.joining_date ? new Date(profile.joining_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A', id: 'join' },
                                ].map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2.5, alignItems: 'center', minWidth: 0 }}>
                                        <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.04), color: 'primary.main', display: 'flex', flexShrink: 0 }}>
                                            {item.icon}
                                        </Box>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.2 }}>{item.label}</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.val}</Typography>
                                        </Box>
                                        {(item.id === 'email' || item.id === 'phone') && item.val !== 'Not Provided' && (
                                            <IconButton size="small" onClick={() => handleCopy(item.val, item.id)}>
                                                {copyState === item.id ? <Check size={14} color={theme.palette.success.main} /> : <Copy size={14} />}
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}

                                {profile.reporting_manager_name && (
                                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', minWidth: 0 }}>
                                        <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(theme.palette.warning.main, 0.04), color: 'warning.main', display: 'flex', flexShrink: 0 }}>
                                            <User size={18} />
                                        </Box>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', mb: 0.2 }}>REPORTING MANAGER</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.reporting_manager_name}</Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>

                            {profile.skills && profile.skills.length > 0 && (
                                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>SKILLS & EXPERTISE</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {profile.skills.map((skill, i) => (
                                            <Chip key={i} size="small" label={skill} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </AdvancedCard>

                        <AdvancedCard title="Pipeline Health" icon={Radar}>
                            {totalHealthLeads > 0 ? (
                                <Box>
                                    <Box sx={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', mb: 3 }}>
                                        <Box sx={{ width: `${(stats.healthMap.Hot / totalHealthLeads) * 100}%`, bgcolor: 'error.main', transition: 'width 1s' }} />
                                        <Box sx={{ width: `${(stats.healthMap.Warm / totalHealthLeads) * 100}%`, bgcolor: 'warning.main', transition: 'width 1s' }} />
                                        <Box sx={{ width: `${(stats.healthMap.Cold / totalHealthLeads) * 100}%`, bgcolor: 'info.main', transition: 'width 1s' }} />
                                    </Box>
                                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Flame size={18} color={theme.palette.error.main} style={{ marginBottom: 4 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>{stats.healthMap.Hot || 0}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.65rem' }}>HOT</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <ThermometerSun size={18} color={theme.palette.warning.main} style={{ marginBottom: 4 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>{stats.healthMap.Warm || 0}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.65rem' }}>WARM</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Snowflake size={18} color={theme.palette.info.main} style={{ marginBottom: 4 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>{stats.healthMap.Cold || 0}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.65rem' }}>COLD</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 3, opacity: 0.5 }}>
                                    <Radar size={32} style={{ marginBottom: 8 }} />
                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 800 }}>CALIBRATING DATA</Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Add or update leads to view your pipeline health.</Typography>
                                </Box>
                            )}
                        </AdvancedCard>

                        <AdvancedCard title="Specializations" icon={Cpu}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {stats.totalSanctionedAmount > 0 ? (
                                    <>
                                        <Chip size="small" label="High Value Loans" icon={<Star size={12} />} sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.dark' }} />
                                        <Chip size="small" label="Fast Conversions" icon={<Timer size={12} />} sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.dark' }} />
                                        <Chip size="small" label="Commercial Scope" icon={<Building size={12} />} sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.dark' }} />
                                    </>
                                ) : (
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontStyle: 'italic', width: '100%', textAlign: 'center', py: 2 }}>
                                        Complete more sanctions to establish your specializations.
                                    </Typography>
                                )}
                            </Box>
                        </AdvancedCard>

                        <AdvancedCard title="Security & Access" icon={Fingerprint}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 800, mb: 0.5 }}>LAST LOGIN</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 900 }}>{new Date().toLocaleTimeString()} - Active</Typography>
                                </Box>
                                <Lock size={18} color={theme.palette.success.main} />
                            </Box>
                        </AdvancedCard>
                    </Stack>
                </Grid>
            </Grid>

            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 8,
                        p: 1.5,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.2)'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', pb: 0.5, letterSpacing: -1 }}>Edit Profile</DialogTitle>
                <DialogContent>
                    <Typography variant="caption" sx={{ mb: 4, display: 'block', color: 'text.secondary', fontWeight: 800, letterSpacing: 1 }}>UPDATE YOUR INFORMATION</Typography>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {[
                            { label: 'Full Name', name: 'full_name', value: editForm.full_name, icon: <User size={18} /> },
                            { label: 'Department', name: 'department', value: editForm.department, icon: <Building size={18} /> },
                            { label: 'Phone Number', name: 'phone', value: editForm.phone, icon: <Phone size={18} /> },
                            { label: 'Location', name: 'location', value: editForm.location, icon: <MapPin size={18} /> },
                        ].map((field) => (
                            <TextField
                                key={field.name}
                                label={field.label.toUpperCase()}
                                fullWidth
                                value={field.value}
                                onChange={(e) => setEditForm({ ...editForm, [field.name]: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ color: 'primary.main', mr: 1 }}>
                                            {field.icon}
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: 4,
                                        fontWeight: 800,
                                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider', borderWidth: '1px' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                                    }
                                }}
                                InputLabelProps={{ sx: { fontWeight: 900, fontSize: '0.7rem', letterSpacing: 1, ml: 4, mt: 0.5 } }}
                            />
                        ))}

                        <FormControl fullWidth>
                            <InputLabel sx={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: 1 }}>REPORTING MANAGER</InputLabel>
                            <Select
                                value={editForm.reporting_manager}
                                onChange={(e) => setEditForm({ ...editForm, reporting_manager: e.target.value })}
                                label="REPORTING MANAGER"
                                sx={{ borderRadius: 4, fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {employees.map((emp) => (
                                    <MenuItem key={emp.id} value={emp.id}>{emp.full_name} ({emp.role})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <AdvancedCard sx={{ bgcolor: alpha(theme.palette.warning.main, 0.04), border: '1px dashed', borderColor: alpha(theme.palette.warning.main, 0.2) }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Shield size={24} color={theme.palette.warning.main} />
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'warning.main', display: 'block' }}>SECURITY NOTICE</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Modifications are logged in the master audit trail.</Typography>
                                </Box>
                            </Box>
                        </AdvancedCard>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={saving}
                        sx={{ borderRadius: 3, px: 4, fontWeight: 900, boxShadow: theme => `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}` }}
                    >
                        {saving ? <CircularProgress size={20} /> : 'Synchronize Data'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={goalOpen}
                onClose={() => setGoalOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 8, p: 2, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>Performance Targets</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary', fontWeight: 500 }}>
                        Adjust your monthly performance benchmarks.
                    </Typography>
                    <Stack spacing={3}>
                        <TextField 
                            fullWidth 
                            label="Sanction Target (₹)" 
                            type="number"
                            value={tempGoals.monthly_loan_target}
                            onChange={(e) => setTempGoals({...tempGoals, monthly_loan_target: parseInt(e.target.value)})}
                            variant="filled" 
                            InputProps={{ disableUnderline: true, sx: { borderRadius: 4, fontWeight: 800 } }}
                            InputLabelProps={{ sx: { fontWeight: 700 } }}
                        />
                        <TextField 
                            fullWidth 
                            label="Lead Conversion Goal" 
                            type="number"
                            value={tempGoals.monthly_lead_target}
                            onChange={(e) => setTempGoals({...tempGoals, monthly_lead_target: parseInt(e.target.value)})}
                            variant="filled" 
                            InputProps={{ disableUnderline: true, sx: { borderRadius: 4, fontWeight: 800 } }}
                            InputLabelProps={{ sx: { fontWeight: 700 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, pt: 3 }}>
                    <Button onClick={() => setGoalOpen(false)} sx={{ fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSaveGoals} 
                        disabled={saving}
                        sx={{ borderRadius: 4, fontWeight: 900, px: 4, py: 1.2 }}
                    >
                        {saving ? <CircularProgress size={20} /> : 'Save Benchmarks'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={avatarOpen}
                onClose={() => setAvatarOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 8, p: 2, textAlign: 'center' } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>Update Photo</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        <Avatar
                            src={avatarUrl}
                            sx={{ 
                                width: 120, 
                                height: 120, 
                                mx: 'auto', 
                                mb: 2,
                                bgcolor: 'secondary.main',
                                fontSize: 48,
                                fontWeight: 900
                            }}
                        >
                            {profile.full_name?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                            Upload a photo (Max 5MB, JPG/PNG)
                        </Typography>
                    </Box>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Camera size={18} />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        sx={{ fontWeight: 800 }}
                    >
                        {uploadingAvatar ? <CircularProgress size={20} /> : 'Choose Photo'}
                    </Button>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setAvatarOpen(false)} sx={{ fontWeight: 800, color: 'text.secondary' }}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 4, fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <Fab 
                color="primary" 
                aria-label="add" 
                sx={{ 
                    position: 'fixed', 
                    bottom: { xs: 32, md: 48 }, 
                    right: { xs: 32, md: 48 },
                    boxShadow: theme => `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
                }}
                onClick={() => navigate('/leads')}
            >
                <Plus size={24} />
            </Fab>

        </Box>
    );
};

export default Profile;
