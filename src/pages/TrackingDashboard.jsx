import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, Grid, CircularProgress, useTheme, alpha,
    Paper, Divider, Chip, IconButton, Tooltip
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, Users, CheckCircle, XCircle, Clock,
    ArrowUpRight, Layout, Zap, Package, RefreshCw
} from 'lucide-react';
import { trackingService } from '../services/api';

const TrackingDashboard = () => {
    const theme = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await trackingService.getPackagesByPartner('all');
            
            // Derive Analytics from Raw Data
            const total = data.length;
            const acceptedDocs = data.flatMap(p => p.tracking_students || [])
                                     .flatMap(s => s.tracking_documents || [])
                                     .filter(d => d.status === 'Accepted').length;
            const totalDocs = data.flatMap(p => p.tracking_students || [])
                                  .flatMap(s => s.tracking_documents || []).length;
            
            const approvalRate = totalDocs > 0 ? Math.round((acceptedDocs / totalDocs) * 100) : 0;
            const pendingPkgs = data.filter(p => p.workflow_status === 'New' || p.workflow_status === 'Review').length;

            // Trend Data (Last 7 days)
            const trend = Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                const count = data.filter(p => new Date(p.created_at).toDateString() === date.toDateString()).length;
                return { name: dayStr, count };
            });

            // Status Distribution
            const statusMap = data.reduce((acc, p) => {
                const s = p.workflow_status || 'New';
                acc[s] = (acc[s] || 0) + 1;
                return acc;
            }, {});
            const pieData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

            setStats({
                total,
                approvalRate,
                pendingPkgs,
                trend,
                pieData,
                nodeCount: new Set(data.map(p => p.sender_id)).size
            });
        } catch (err) {
            console.error('Analytics Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={60} thickness={4} />
        </Box>
    );

    const COLORS = [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.info.main];

    return (
        <Box sx={{ pb: 8 }}>
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                            <Zap size={24} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -1.5 }}>Tracking Analytics</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>Operational intelligence for global application relays.</Typography>
                </Box>
                <IconButton onClick={fetchAnalytics} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
                    <RefreshCw size={20} />
                </IconButton>
            </Box>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                <StatCard title="Total Packages" value={stats.total} icon={<Package size={24} />} trend="+12% from last week" />
                <StatCard title="Approval Rate" value={`${stats.approvalRate}%`} icon={<CheckCircle size={24} />} trend="Global document health" color="success.main" />
                <StatCard title="Pending Review" value={stats.pendingPkgs} icon={<Clock size={24} />} trend="Active items in pipeline" color="warning.main" />
                <StatCard title="Active Nodes" value={stats.nodeCount} icon={<Users size={24} />} trend="Partners transmitting data" color="info.main" />
            </Grid>

            <Grid container spacing={4}>
                {/* Trend Chart */}
                <Grid size={ 12 } lg={8}>
                    <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Relay Velocity (Last 7 Days)</Typography>
                        <Box sx={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.trend}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                    <ChartTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[10] }} />
                                    <Area type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Status distribution */}
                <Grid size={ 12 } lg={4}>
                    <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Workflow Status</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip />
                                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

const StatCard = ({ title, value, icon, trend, color = 'primary.main' }) => (
    <Grid size={ 12 } sm={6} md={3}>
        <Card sx={{ p: 3, borderRadius: 5, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color }}>
                    {icon}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', fontSize: '0.75rem', fontWeight: 800 }}>
                    <TrendingUp size={14} style={{ marginRight: 4 }} /> 12%
                </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>{value}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary' }}>{title}</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>{trend}</Typography>
        </Card>
    </Grid>
);

export default TrackingDashboard;
