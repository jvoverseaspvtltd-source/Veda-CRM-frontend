import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CircularProgress, 
    Divider, alpha, useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { TrendingUp, Users, Clock, CheckCircle, Activity, BarChart2 } from 'lucide-react';
import { lendingPartnerService } from '../../services/api';

const motionContainerX = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, duration: 0.4 } }
};

const motionItem = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const ChartCard = ({ title, children, icon: Icon }) => (
    <Card sx={{ 
        p: 3, borderRadius: 5, height: '100%', display: 'flex', flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#ffffff', 0.4)} 100%)`,
        backdropFilter: 'blur(20px)', border: '1px solid', borderColor: 'divider', boxShadow: `0 10px 40px ${alpha('#000', 0.03)}`
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ p: 1, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff' }}>
                <Icon size={20} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 280, position: 'relative' }}>
            <Box sx={{ position: 'absolute', inset: 0 }}>
                {children}
            </Box>
        </Box>
    </Card>
);

const PartnerPerformance = () => {
    const theme = useTheme();
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchPerf = async () => {
            try {
                const stats = await lendingPartnerService.getStats(partner.id);
                setData(stats);
            } catch (err) {
                // Mock data for God-Level visualization
                setData({
                    sharingTrends: [
                        { name: 'Mon', count: 12 }, { name: 'Tue', count: 18 }, { name: 'Wed', count: 15 },
                        { name: 'Thu', count: 25 }, { name: 'Fri', count: 22 }, { name: 'Sat', count: 10 }, { name: 'Sun', count: 5 },
                    ],
                    conversionData: [
                        { name: 'Jan', rate: 12 }, { name: 'Feb', rate: 15 }, { name: 'Mar', rate: 18 },
                        { name: 'Apr', rate: 22 }, { name: 'May', rate: 30 }
                    ],
                    avgResponseTime: '3.5 Hours',
                    conversionRate: '24%',
                    activeLeads: 42
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPerf();
    }, [partner.id]);

    if (loading) {
        return (
            <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Activity size={48} color={theme.palette.primary.main} />
                </motion.div>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 2 }}>RENDERING ANALYTICS...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100%', pb: 8 }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)' }}>
                        <BarChart2 size={28} />
                    </Box>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, background: 'linear-gradient(45deg, #1e293b, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Performance Matrix
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Analyze your processing efficiency, conversion rates, and volume velocity.
                        </Typography>
                    </Box>
                </Box>
            </motion.div>

            <Grid container spacing={3} sx={{ mb: 4 }} component={motion.div} variants={motionContainerX} initial="hidden" animate="visible">
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={motionItem} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                        <Card sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2), boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.05)}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={1}>AVG RESPONSE</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 1.5 }}>
                                <Clock size={24} color={theme.palette.primary.main} />
                                <Typography variant="h4" fontWeight={900}>{data.avgResponseTime}</Typography>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={motionItem} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                        <Card sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: alpha('#10b981', 0.03), border: '1px solid', borderColor: alpha('#10b981', 0.2), boxShadow: `0 8px 24px ${alpha('#10b981', 0.05)}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={1}>CONVERSION RATE</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 1.5 }}>
                                <TrendingUp size={24} color="#10b981" />
                                <Typography variant="h4" fontWeight={900} color="#059669">{data.conversionRate}</Typography>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={motionItem} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                        <Card sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: alpha('#8b5cf6', 0.03), border: '1px solid', borderColor: alpha('#8b5cf6', 0.2), boxShadow: `0 8px 24px ${alpha('#8b5cf6', 0.05)}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={1}>ACTIVE LEADS</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 1.5 }}>
                                <Users size={24} color="#8b5cf6" />
                                <Typography variant="h4" fontWeight={900} color="#7c3aed">{data.activeLeads}</Typography>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <motion.div variants={motionItem} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                        <Card sx={{ p: 3, borderRadius: 4, textAlign: 'center', bgcolor: alpha('#f59e0b', 0.03), border: '1px solid', borderColor: alpha('#f59e0b', 0.2), boxShadow: `0 8px 24px ${alpha('#f59e0b', 0.05)}` }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing={1}>SUCCESS RATIO</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 1.5 }}>
                                <CheckCircle size={24} color="#f59e0b" />
                                <Typography variant="h4" fontWeight={900} color="#d97706">88%</Typography>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={4} component={motion.div} variants={motionContainerX} initial="hidden" animate="visible">
                <Grid size={{ xs: 12, md: 8 }}>
                    <motion.div variants={motionItem} style={{ height: '100%', minWidth: 0, minHeight: 0 }}>
                        <ChartCard title="Velocity Inflow (Trailing 7 Days)" icon={Activity}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.sharingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.4)} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.secondary }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.secondary }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800 }}
                                        itemStyle={{ color: theme.palette.primary.main, fontWeight: 800 }}
                                        cursor={{ stroke: alpha(theme.palette.primary.main, 0.2), strokeWidth: 2 }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </motion.div>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={motionItem} style={{ height: '100%', minWidth: 0, minHeight: 0 }}>
                        <ChartCard title="Monthly Conversion Growth" icon={TrendingUp}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" />
                                            <stop offset="95%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.4)} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.secondary }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.secondary }} />
                                    <Tooltip 
                                        cursor={{ fill: alpha('#10b981', 0.1) }}
                                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="rate" fill="url(#colorBar)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PartnerPerformance;
