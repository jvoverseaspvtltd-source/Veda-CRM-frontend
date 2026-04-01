import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider,
    Paper,
    CircularProgress,
    Button,
    alpha,
    useTheme,
    LinearProgress,
    Breadcrumbs,
    Link,
    Tooltip,
    IconButton,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock,
    Activity,
    Edit,
    Power,
    KeyRound,
    RefreshCw,
    Building2,
    BarChart3,
    ShieldCheck,
    AlertTriangle,
    MapPin,
    UserCircle,
} from 'lucide-react';
import { lendingPartnerService } from '../services/api';

const PartnerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const [partner, setPartner] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [partnerData, statsData] = await Promise.all([
                lendingPartnerService.getById(id),
                lendingPartnerService.getStats(id),
            ]);
            setPartner(partnerData);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to fetch partner details', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleToggleStatus = async () => {
        const newStatus = partner.status === 'Active' ? 'Inactive' : 'Active';
        try {
            setToggling(true);
            await lendingPartnerService.updateStatus(id, newStatus);
            setPartner(prev => ({ ...prev, status: newStatus }));
            showSnackbar(`Partner ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
        } catch {
            showSnackbar('Failed to update status', 'error');
        } finally {
            setToggling(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', height: '75vh', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={50} thickness={4} />
            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Loading partner profile...</Typography>
        </Box>
    );

    if (!partner) return (
        <Box sx={{ textAlign: 'center', py: 10 }}>
            <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: 12 }} />
            <Typography variant="h6" color="text.secondary">Partner not found.</Typography>
            <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/lending-partners')}>
                Back to Credit Partners
            </Button>
        </Box>
    );

    const isActive = partner.status === 'Active';
    const acceptanceRate = parseFloat(stats?.acceptanceRate || 0);

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            {/* ── Breadcrumb + Header ──────────────────────────────────── */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link
                        underline="hover"
                        color="inherit"
                        onClick={() => navigate('/lending-partners')}
                        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        <ArrowLeft size={14} /> Credit Partners
                    </Link>
                    <Typography color="text.primary" variant="body2" sx={{ fontWeight: 700 }}>
                        {partner.name}
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: isActive ? 'primary.main' : alpha(theme.palette.text.secondary, 0.2),
                                fontSize: '2rem',
                                fontWeight: 900,
                                borderRadius: 3,
                                boxShadow: isActive ? '0 8px 20px rgba(26, 54, 93, 0.25)' : 'none',
                            }}
                        >
                            {partner.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, lineHeight: 1.1 }}>
                                    {partner.name}
                                </Typography>
                                <Chip
                                    label={partner.status}
                                    size="small"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: '0.72rem',
                                        bgcolor: isActive ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
                                        color: isActive ? '#059669' : '#d97706',
                                        border: '1px solid',
                                        borderColor: isActive ? alpha('#10b981', 0.3) : alpha('#f59e0b', 0.3),
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.8, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<UserCircle size={12} />}
                                    label={partner.partner_role || 'Relationship Manager'}
                                    size="small"
                                    sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.text.secondary, 0.08), fontSize: '0.72rem' }}
                                />
                                <Chip
                                    icon={<Building2 size={12} />}
                                    label={partner.bank_name}
                                    size="small"
                                    sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main', fontSize: '0.72rem' }}
                                />
                                {partner.branch_name && (
                                    <Chip
                                        icon={<MapPin size={12} />}
                                        label={partner.branch_name}
                                        size="small"
                                        sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.secondary.main, 0.08), color: 'secondary.main', fontSize: '0.72rem' }}
                                    />
                                )}
                                <Chip
                                    icon={<ShieldCheck size={12} />}
                                    label="Verified Partner"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Tooltip title={isActive ? 'Deactivate Partner' : 'Activate Partner'}>
                            <Button
                                variant="outlined"
                                color={isActive ? 'warning' : 'success'}
                                startIcon={toggling ? <CircularProgress size={14} /> : <Power size={16} />}
                                onClick={handleToggleStatus}
                                disabled={toggling}
                                sx={{ borderRadius: 2.5, fontWeight: 700 }}
                            >
                                {isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowLeft size={16} />}
                            onClick={() => navigate('/lending-partners')}
                            sx={{ borderRadius: 2.5, fontWeight: 700 }}
                        >
                            Back
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* ── Left: Stats + Activity ──────────────────────────── */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* KPI Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {[
                            {
                                label: 'Total Leads Shared',
                                value: stats?.totalLeads || 0,
                                icon: <TrendingUp size={22} />,
                                color: '#6366f1',
                                sub: 'Profiles sent for review',
                            },
                            {
                                label: 'Accepted',
                                value: stats?.accepted || 0,
                                icon: <CheckCircle size={22} />,
                                color: '#10b981',
                                sub: 'Deals progressed',
                            },
                            {
                                label: 'Rejected',
                                value: stats?.rejected || 0,
                                icon: <XCircle size={22} />,
                                color: '#ef4444',
                                sub: 'Declined by partner',
                            },
                            {
                                label: 'Pending Review',
                                value: stats?.pending || 0,
                                icon: <Clock size={22} />,
                                color: '#f59e0b',
                                sub: 'Awaiting decision',
                            },
                        ].map((s) => (
                            <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
                                <Card
                                    sx={{
                                        borderRadius: 3.5,
                                        border: '1px solid',
                                        borderColor: alpha(s.color, 0.15),
                                        bgcolor: alpha(s.color, 0.04),
                                        boxShadow: 'none',
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                        <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: s.color, lineHeight: 1 }}>
                                            {s.value}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 0.5, lineHeight: 1.2 }}>
                                            {s.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                            {s.sub}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Acceptance Rate Progress */}
                    <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), boxShadow: 'none', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BarChart3 size={18} color={theme.palette.primary.main} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Acceptance Rate</Typography>
                                </Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 900,
                                        color: acceptanceRate >= 70 ? '#10b981' : acceptanceRate >= 40 ? '#f59e0b' : '#ef4444',
                                    }}
                                >
                                    {acceptanceRate}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={acceptanceRate}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: alpha(theme.palette.divider, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
                                        bgcolor: acceptanceRate >= 70 ? '#10b981' : acceptanceRate >= 40 ? '#f59e0b' : '#ef4444',
                                    }
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {stats?.accepted || 0} accepted out of {stats?.totalLeads || 0} shared profiles
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Recent Activity Log */}
                    <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), boxShadow: 'none' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                <Activity size={18} color={theme.palette.primary.main} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Recent Activity Log</Typography>
                            </Box>
                            {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Clock size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        No activity recorded yet
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {stats.recentActivity.map((log, idx) => (
                                        <Box key={log.id}>
                                            <Box sx={{ display: 'flex', gap: 2, py: 2, alignItems: 'flex-start' }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Clock size={14} color={theme.palette.primary.main} />
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{log.action}</Typography>
                                                    {log.details && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                                                            {log.details}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.5, mt: 0.3, display: 'block' }}>
                                                        {new Date(log.created_at).toLocaleString('en-IN')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {idx < stats.recentActivity.length - 1 && (
                                                <Divider sx={{ opacity: 0.4 }} />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Right: Contact + Bank Info ───────────────────────── */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Contact Info */}
                    <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), boxShadow: 'none', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5 }}>Contact Information</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ color: '#94a3b8', flexShrink: 0 }}><Mail size={18} /></Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Email</Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 700,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {partner.email}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ color: '#94a3b8', flexShrink: 0 }}><Phone size={18} /></Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Phone</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {partner.phone || 'Not provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ color: '#94a3b8', flexShrink: 0 }}><Calendar size={18} /></Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>Joined</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {new Date(partner.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Bank Region Card */}
                    <Card
                        sx={{
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                            color: 'white',
                            boxShadow: '0 8px 24px rgba(26, 54, 93, 0.25)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Building2 size={20} color="rgba(255,255,255,0.8)" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Credit Institution</Typography>
                            </Box>
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>{partner.bank_name}</Typography>
                                {partner.branch_name && (
                                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <MapPin size={10} /> {partner.branch_name} Branch
                                    </Typography>
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.75, mb: 2.5, lineHeight: 1.5 }}>
                                Operational contact for Veda Loans processing pipeline within this branch.
                            </Typography>
                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700 }}>Portal Status</Typography>
                                <Chip
                                    label={partner.status}
                                    size="small"
                                    sx={{
                                        bgcolor: isActive ? '#10b981' : '#f59e0b',
                                        color: 'white',
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700 }}>Role Context</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 900 }}>{partner.partner_role || 'Relationship Manager'}</Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), boxShadow: 'none', mt: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Quick Actions</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Power size={16} />}
                                    color={isActive ? 'warning' : 'success'}
                                    onClick={handleToggleStatus}
                                    disabled={toggling}
                                    sx={{ borderRadius: 2.5, fontWeight: 700, justifyContent: 'flex-start' }}
                                >
                                    {isActive ? 'Deactivate Portal Access' : 'Activate Portal Access'}
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<RefreshCw size={16} />}
                                    onClick={fetchData}
                                    sx={{ borderRadius: 2.5, fontWeight: 700, justifyContent: 'flex-start' }}
                                >
                                    Refresh Data
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Snackbar ──────────────────────────────────────────────── */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{ borderRadius: 2.5, fontWeight: 700 }}
                    onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PartnerDetail;
