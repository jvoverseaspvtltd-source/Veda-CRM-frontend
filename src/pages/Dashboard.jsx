import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Paper,
    Button,
    IconButton,
    Avatar,
    Chip,
    Divider,
    useTheme,
    alpha,
    LinearProgress,
    Tooltip as MuiTooltip,
} from '@mui/material';
import {
    TrendingUp,
    CheckCircle,
    Wallet,
    ExternalLink,
    Banknote,
    Activity,
    AlertCircle,
    PhoneCall,
    FileText,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    History,
    Search,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Static style objects (defined outside component to avoid re-creation) ───
const cardBaseSx = {
    borderRadius: 4,
    border: '1px solid',
    overflow: 'hidden',
};

const tooltipStyle = {
    borderRadius: 10,
    border: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    fontSize: 12,
};

// ─── Memoized StatCard to prevent unnecessary re-renders ─────────────────────
const StatCard = memo(({ stat }) => {
    const theme = useTheme();
    return (
        <Card
            sx={{
                ...cardBaseSx,
                background: alpha(theme.palette.background.paper, 0.9),
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.1)' },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ bgcolor: stat.bg, color: stat.color, p: 1.5, borderRadius: 3, display: 'flex' }}>
                        {stat.icon}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: stat.isUp ? 'success.main' : 'error.main' }}>
                        {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>{stat.delta}</Typography>
                    </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>{stat.value}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{stat.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{stat.sub}</Typography>
            </CardContent>
            {/* Accent bar */}
            <Box sx={{ height: 3, width: '100%', bgcolor: stat.bg }}>
                <Box sx={{ height: '100%', width: '85%', bgcolor: stat.color, borderRadius: '0 2px 2px 0' }} />
            </Box>
        </Card>
    );
});

// ─── Memoized GlassCard wrapper ───────────────────────────────────────────────
const GlassCard = memo(({ children, sx = {}, ...props }) => {
    const theme = useTheme();
    return (
        <Card
            sx={{
                ...cardBaseSx,
                background: alpha(theme.palette.background.paper, 0.9),
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                ...sx,
            }}
            {...props}
        >
            {children}
        </Card>
    );
});

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const statsData = await dashboardService.getStats(profile?.id, profile?.role);
                if (!controller.signal.aborted) setData(statsData);
            } catch (err) {
                if (!controller.signal.aborted) console.error('Dashboard Error:', err);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        if (profile) load();
        return () => controller.abort();
    }, [profile]);

    // ── Compute all derived data once ──────────────────────────────────────
    const dashboardInsights = useMemo(() => {
        if (!data) return null;
        const { stats, leadHealth, recentActivities } = data;
        const monthlySanctionTarget = 5000000;
        const sanctionProgress = Math.min((stats.sanctionAmount / monthlySanctionTarget) * 100, 100);

        return {
            stats: [
                {
                    label: 'Files in Registry',
                    value: stats.activeLeads,
                    delta: '+12%',
                    isUp: true,
                    sub: 'Active processing',
                    icon: <Activity size={22} />,
                    color: '#6366f1',
                    bg: alpha('#6366f1', 0.1),
                },
                {
                    label: 'Total Sanctioned',
                    value: `₹${(stats.sanctionAmount / 100000).toFixed(1)}L`,
                    delta: '+5%',
                    isUp: true,
                    sub: 'Across top banks',
                    icon: <Banknote size={22} />,
                    color: '#10b981',
                    bg: alpha('#10b981', 0.1),
                },
                {
                    label: 'Expected Payout',
                    value: `₹${(stats.expectedPayout / 1000).toFixed(1)}k`,
                    delta: '-2%',
                    isUp: false,
                    sub: 'Pending bank clearance',
                    icon: <TrendingUp size={22} />,
                    color: '#f59e0b',
                    bg: alpha('#f59e0b', 0.1),
                },
                {
                    label: 'Net Commission',
                    value: `₹${(stats.totalPayout / 1000).toFixed(1)}k`,
                    delta: '+18%',
                    isUp: true,
                    sub: 'Realized this month',
                    icon: <Wallet size={22} />,
                    color: '#ef4444',
                    bg: alpha('#ef4444', 0.1),
                },
            ],
            target: {
                current: stats.sanctionAmount,
                goal: monthlySanctionTarget,
                percent: sanctionProgress,
            },
            leadHealth,
            docAudits: recentActivities.slice(0, 4).map(h => ({
                name: h.leads?.name || 'Unknown',
                bank: h.leads?.loan_type || 'Loan',
                progress:
                    h.stage === 'Disbursed' ? 100 :
                    h.stage === 'Sanctioned' ? 80 :
                    h.stage === 'Interested' ? 60 :
                    h.stage === 'Contacted' ? 40 : 20,
                status: h.stage,
            })),
        };
    }, [data]);

    const bankStats = useMemo(() => {
        if (!data) return [];
        const colors = ['#004daa', '#f37021', '#971237', '#25a8e0', '#10b981', '#f59e0b', '#8b5cf6'];
        return data.bankStats.map((item, i) => ({ ...item, color: colors[i % colors.length] }));
    }, [data]);

    const stalemateLeads = useMemo(() => data?.stalemateLeads || [], [data]);

    const currentMarketROI = useMemo(() => [
        { bank: 'HDFC', roi: '8.45%', type: 'Education' },
        { bank: 'IDFC First', roi: '10.5%', type: 'Personal' },
        { bank: 'Tata Capital', roi: '11.2%', type: 'Business' },
        { bank: 'SBI', roi: '8.15%', type: 'Home' },
    ], []);

    const navigateToCases = useCallback(() => navigate('/cases'), [navigate]);
    const navigateToLeads = useCallback(() => navigate('/leads'), [navigate]);
    const navigateToEligibilityHub = useCallback(() => navigate('/eligibility-hub'), [navigate]);

    // Loading state
    if (loading || !dashboardInsights) return (
        <Box sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={52} thickness={4} sx={{ color: 'primary.main' }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                Syncing Analytics...
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 3, md: 4 }, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 900,
                            color: 'text.primary',
                            letterSpacing: -1,
                            lineHeight: 1.1,
                            fontSize: { xs: '1.6rem', sm: '2rem', md: '2.25rem' },
                        }}
                    >
                        Application Hub, {profile?.full_name?.split(' ')[0] || 'Partner'}!
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                        <Chip
                            icon={<Zap size={13} />}
                            label="Phase 2 Insights Active"
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', fontWeight: 800, border: 'none' }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Operational Hub · Veda DSA
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
                    <Paper
                        sx={{
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.background.paper, 0.7),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1),
                        }}
                    >
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6, display: 'block' }}>QUICK SEARCH</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Applications / IFSC</Typography>
                        </Box>
                        <IconButton sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 3 }}>
                            <Search size={18} />
                        </IconButton>
                    </Paper>
                </Box>
            </Box>

            {/* ── KPI Stats Grid ──────────────────────────────────────────────── */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
                {dashboardInsights.stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <StatCard stat={stat} />
                    </Grid>
                ))}
            </Grid>

            {/* ── Monthly Achievement + Lead Health Heatmap ───────────────────── */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
                {/* Monthly Achievement */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <GlassCard sx={{ height: '100%', p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Monthly Achievement</Typography>
                            <Typography variant="body2" color="text.secondary">Target: ₹50.0L</Typography>
                        </Box>
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <CircularProgress
                                variant="determinate"
                                value={100}
                                size={160}
                                thickness={4}
                                sx={{ color: alpha(theme.palette.divider, 0.12) }}
                            />
                            <CircularProgress
                                variant="determinate"
                                value={dashboardInsights.target.percent}
                                size={160}
                                thickness={4}
                                sx={{ position: 'absolute', color: 'primary.main', strokeLinecap: 'round' }}
                            />
                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                    {Math.round(dashboardInsights.target.percent)}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ACHIEVED</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>CURRENT</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                    ₹{(dashboardInsights.target.current / 100000).toFixed(1)}L
                                </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>REMAINING</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                                    ₹{((dashboardInsights.target.goal - dashboardInsights.target.current) / 100000).toFixed(1)}L
                                </Typography>
                            </Box>
                        </Box>
                    </GlassCard>
                </Grid>

                {/* Lead Health Heatmap */}
                <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                    <GlassCard sx={{ p: { xs: 3, md: 4 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Registry Health Heatmap</Typography>
                                <Typography variant="body2" color="text.secondary">Follow-up urgency &amp; conversion probability</Typography>
                            </Box>
                            <Button size="small" variant="outlined" startIcon={<History size={15} />} sx={{ borderRadius: 2, fontWeight: 700, flexShrink: 0 }} onClick={navigateToCases}>
                                View Logs
                            </Button>
                        </Box>
                        <Grid container spacing={2}>
                            {dashboardInsights.leadHealth.map((health, i) => (
                                <Grid size={{ xs: 12, sm: 4 }} key={i}>
                                    <Box
                                        sx={{
                                            p: { xs: 2, md: 2.5 },
                                            borderRadius: 3,
                                            border: '1.5px solid',
                                            borderColor: alpha(health.color, 0.2),
                                            bgcolor: alpha(health.color, 0.03),
                                        }}
                                    >
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: health.color, mb: 0.5 }}>{health.count}</Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>{health.category}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, display: 'block' }}>
                                            {health.description}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Stalemate Cases */}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AlertCircle size={16} color={theme.palette.error.main} /> Critical Stalemate Cases
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {stalemateLeads.length > 0 ? stalemateLeads.map((l) => {
                                    const diffDays = Math.floor((new Date() - new Date(l.updated_at)) / 86400000);
                                    return (
                                        <Box
                                            key={l.id}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2.5,
                                                bgcolor: alpha(theme.palette.divider, 0.04),
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 800 }}>
                                                    {l.name?.charAt(0) || 'L'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                                        {l.name} — {l.loan_type}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Pending at {l.status} · {diffDays}d
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Button size="small" variant="outlined" color="error" sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2, flexShrink: 0 }} onClick={navigateToLeads}>
                                                Action
                                            </Button>
                                        </Box>
                                    );
                                }) : (
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <CheckCircle size={28} color={theme.palette.success.main} style={{ marginBottom: 6 }} />
                                        <Typography variant="body2" color="text.secondary">No stale leads! Great work.</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </GlassCard>
                </Grid>
            </Grid>

            {/* ── Charts Row ──────────────────────────────────────────────────── */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
                {/* Area Chart */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <GlassCard sx={{ p: { xs: 3, md: 4 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Registry Trends (Last 7 Days)</Typography>
                        {data?.weeklyTrends ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={data.weeklyTrends} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.25} />
                                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.15)} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <YAxis hide />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="leads" stroke={theme.palette.primary.main} strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
                                    <Area type="monotone" dataKey="files" stroke="#10b981" strokeWidth={2.5} fill="none" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                                <Typography color="text.secondary" variant="body2">No trend data yet.</Typography>
                            </Box>
                        )}
                    </GlassCard>
                </Grid>

                {/* Market ROI Pulse */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <GlassCard sx={{ p: { xs: 3, md: 4 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Market ROI Pulse</Typography>
                            <Chip label="Live" size="small" color="error" sx={{ fontWeight: 800, height: 20, fontSize: '0.7rem' }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {currentMarketROI.map((item, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 1.5,
                                        borderRadius: 2.5,
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.divider, 0.06),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: 12, fontWeight: 800, width: 34, height: 34 }}>
                                            {item.bank[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.bank} Bank</Typography>
                                            <Typography variant="caption" color="text.secondary">{item.type} ROI</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'success.main' }}>
                                        {item.roi}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </GlassCard>
                </Grid>
            </Grid>

            {/* ── Live File Audit Tracker ──────────────────────────────────────── */}
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FileText size={20} /> Live File Audit Tracker
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 4, md: 5 } }}>
                {dashboardInsights.docAudits.map((audit, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <GlassCard sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ flex: 1, mr: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {audit.name}
                                    </Typography>
                                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {audit.bank} | {audit.status}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${audit.progress}%`}
                                    size="small"
                                    color={audit.progress > 80 ? 'success' : audit.progress > 40 ? 'warning' : 'info'}
                                    sx={{ fontWeight: 800, borderRadius: 1.5, flexShrink: 0 }}
                                />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={audit.progress}
                                sx={{
                                    height: 7,
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.divider, 0.1),
                                    '& .MuiLinearProgress-bar': { borderRadius: 4 },
                                }}
                            />
                        </GlassCard>
                    </Grid>
                ))}
            </Grid>

            {/* ── DSA Growth Hub Banner ────────────────────────────────────────── */}
            <Card
                sx={{
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
                    color: 'white',
                    overflow: 'hidden',
                    border: 'none',
                }}
            >
                <Grid container alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }} sx={{ p: { xs: 3, md: 5 } }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: -1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            DSA Growth Hub
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8, mb: 3, fontWeight: 400 }}>
                            You are <strong>₹14.2 Lakhs</strong> away from your Gold Partner status. Push 5 more sanctioned cases this week!
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                startIcon={<PhoneCall size={18} />}
                                onClick={() => window.open('https://wa.me/918712275590', '_blank')}
                                sx={{
                                    bgcolor: '#25D366',
                                    '&:hover': { bgcolor: '#1da851' },
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 800,
                                }}
                            >
                                WhatsApp Support
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ExternalLink size={18} />}
                                onClick={navigateToEligibilityHub}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.25)',
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 800,
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.06)' },
                                }}
                            >
                                Eligibility Hub
                            </Button>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ p: 5, textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                        <Target size={120} color="rgba(255,255,255,0.15)" strokeWidth={1} />
                    </Grid>
                </Grid>
            </Card>
        </Box>
    );
};

export default Dashboard;
