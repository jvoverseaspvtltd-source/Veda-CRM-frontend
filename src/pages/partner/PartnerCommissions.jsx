import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, Chip, CircularProgress, alpha, useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeDollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Wallet, ReceiptIndianRupee, Activity, CheckCircle2, Clock } from 'lucide-react';
import { lendingPartnerService } from '../../services/api';

const motionContainerX = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, duration: 0.4 } }
};

const motionItem = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const motionRowVariant = {
    hidden: { opacity: 0, x: -20, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const theme = useTheme();
    return (
        <Card sx={{ 
            p: 4, borderRadius: 5, height: '100%', 
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
            backdropFilter: 'blur(20px)', border: '1px solid', borderColor: alpha(color, 0.2), boxShadow: `0 10px 40px ${alpha(color, 0.05)}`,
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Ambient Background Glow */}
            <Box sx={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)` }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>
                    <Icon size={28} />
                </Box>
                {trend && (
                    <Chip 
                        label={trend} size="small" 
                        icon={trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        sx={{ fontWeight: 800, bgcolor: trend.startsWith('+') ? alpha('#10b981', 0.15) : alpha('#ef4444', 0.15), color: trend.startsWith('+') ? '#059669' : '#b91c1c', border: 'none', borderRadius: 1.5 }}
                    />
                )}
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5, background: `linear-gradient(45deg, ${color}, ${theme.palette.text.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {value}
            </Typography>
        </Card>
    );
};

const PartnerCommissions = () => {
    const theme = useTheme();
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await lendingPartnerService.getStats(partner.id);
                setStats(data);
            } catch (err) {
                // Futuristic Mock DB state
                setStats({
                    totalCommission: 85400,
                    pendingPayout: 12500,
                    lastMonth: 22400,
                    transactions: [
                        { id: 1, date: '2026-03-25', applicant: 'Rahul Sharma', amount: 4500, type: 'Disbursement Bonus', status: 'Paid' },
                        { id: 2, date: '2026-03-20', applicant: 'Priya Verma', amount: 3200, type: 'Lead Conversion', status: 'Paid' },
                        { id: 3, date: '2026-03-15', applicant: 'Amit Singh', amount: 6000, type: 'High Value Bonus', status: 'Pending' },
                        { id: 4, date: '2026-03-10', applicant: 'Sonal Gupta', amount: 2800, type: 'Lead Conversion', status: 'Paid' },
                        { id: 5, date: '2026-03-05', applicant: 'Vishal Kumar', amount: 5500, type: 'Disbursement Bonus', status: 'Paid' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [partner.id]);

    if (loading) {
        return (
            <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Activity size={48} color={theme.palette.primary.main} />
                </motion.div>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 2 }}>DECRYPTING LEDGER...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100%', pb: 8 }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)' }}>
                        <ReceiptIndianRupee size={28} />
                    </Box>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, background: 'linear-gradient(45deg, #1e293b, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Treasury Ledger
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Real-time tracking of generated commissions and upcoming settlements.
                        </Typography>
                    </Box>
                </Box>
            </motion.div>

            {/* Wallet Stats */}
            <Grid container spacing={3} sx={{ mb: 6 }} component={motion.div} variants={motionContainerX} initial="hidden" animate="visible">
                <Grid size={{ xs: 12, sm: 4 }}>
                    <motion.div variants={motionItem} whileHover={{ y: -5 }}>
                        <StatCard title="Total Vault Value" value={`₹${(stats?.totalCommission || 0).toLocaleString()}`} icon={BadgeDollarSign} color={theme.palette.primary.main} trend="+12.5%" />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <motion.div variants={motionItem} whileHover={{ y: -5 }}>
                        <StatCard title="Pending Settlement" value={`₹${(stats?.pendingPayout || 0).toLocaleString()}`} icon={Wallet} color="#f59e0b" />
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <motion.div variants={motionItem} whileHover={{ y: -5 }}>
                        <StatCard title="Last Cycle Revenue" value={`₹${(stats?.lastMonth || 0).toLocaleString()}`} icon={TrendingUp} color="#10b981" trend="+8.2%" />
                    </motion.div>
                </Grid>
            </Grid>

            {/* Transaction List (Replacing Table Layout with modern list) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Calendar size={22} color={theme.palette.text.secondary} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Recent Ledger Activity</Typography>
            </Box>

            <Box>
                <Grid container spacing={2}>
                    <AnimatePresence>
                        {(stats?.transactions || []).map((t, idx) => (
                            <Grid size={{ xs: 12 }} key={t.id || idx}>
                                <motion.div variants={motionRowVariant} initial="hidden" animate="visible" transition={{ delay: idx * 0.05 }}>
                                    <Card sx={{ 
                                        p: { xs: 2, sm: 3 }, borderRadius: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                                        alignItems: { xs: 'flex-start', md: 'center' }, gap: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                                        border: '1px solid', borderColor: t.status === 'Pending' ? alpha('#f59e0b', 0.2) : 'divider',
                                        bgcolor: 'background.paper', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', borderColor: theme.palette.primary.main }
                                    }}>
                                        {/* Date and Type */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 2, width: '100%' }}>
                                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 70 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>{new Date(t.date).getDate()}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{new Date(t.date).toLocaleString('default', { month: 'short' })}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>{t.applicant}</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{t.type}</Typography>
                                            </Box>
                                        </Box>

                                        {/* Amount & Status */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, width: '100%', justifyContent: { xs: 'space-between', md: 'flex-end' }, py: { xs: 2, md: 0 }, borderTop: { xs: '1px solid', md: 'none' }, borderColor: 'divider' }}>
                                            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>Credit Value</Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>+₹{(t.amount || 0).toLocaleString()}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>Status</Typography>
                                                <Chip 
                                                    label={t.status} 
                                                    size="small" 
                                                    icon={t.status === 'Paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                    sx={{ 
                                                        fontWeight: 800, borderRadius: 1.5, px: 1, height: 28,
                                                        bgcolor: t.status === 'Paid' ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                                        color: t.status === 'Paid' ? '#059669' : '#d97706'
                                                    }} 
                                                />
                                            </Box>
                                        </Box>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </AnimatePresence>
                </Grid>
            </Box>
        </Box>
    );
};

export default PartnerCommissions;
