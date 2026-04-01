import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    LinearProgress,
    Chip,
    Card,
    CardContent,
    alpha,
    useTheme
} from '@mui/material';
import { Award, Zap, Clock, TrendingUp } from 'lucide-react';

const mockPerformance = [
    { id: 1, name: 'Suresh Kumar', role: 'Loan Manager', leads: 45, conversions: 12, ratio: '26%', avgTime: '4.5 Days', commission: '₹1.2L' },
    { id: 2, name: 'Ankita Rai', role: 'Telecaller', leads: 120, conversions: 18, ratio: '15%', avgTime: '2.1 Days', commission: '₹45k' },
    { id: 3, name: 'Mohit Verma', role: 'Loan Manager', leads: 38, conversions: 10, ratio: '26.3%', avgTime: '5.2 Days', commission: '₹1.8L' },
    { id: 4, name: 'Nisha Singh', role: 'Telecaller', leads: 95, conversions: 14, ratio: '14.7%', avgTime: '3.0 Days', commission: '₹32k' },
];

const Performance = () => {
    const theme = useTheme();

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -2, mb: 0.5 }}>
                        Performance Matrix
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                        Data-driven insights into conversion efficiency and processing velocity.
                    </Typography>
                </Box>
                <Box sx={{ p: 1, px: 2, borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.08), border: '1px solid', borderColor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 1 }}>Live Forecast</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, mt: -0.5 }}>+12.4% Momentum</Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                {[
                    { label: 'Top Converting', value: 'Suresh Kumar', icon: <Award size={20} />, color: '#10b981', bg: alpha('#10b981', 0.1) },
                    { label: 'Fastest Lead', value: 'Ankita Rai', icon: <Zap size={20} />, color: '#3b82f6', bg: alpha('#3b82f6', 0.1) },
                    { label: 'Avg. Maturity', value: '3.8 Days', icon: <Clock size={20} />, color: '#f59e0b', bg: alpha('#f59e0b', 0.1) },
                    { label: 'Conv. Pulse', value: '18.5%', icon: <TrendingUp size={20} />, color: '#ef4444', bg: alpha('#ef4444', 0.1) },
                ].map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card sx={{ 
                            borderRadius: 5, 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': { transform: 'scale(1.02)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', borderColor: stat.color }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: stat.bg, color: stat.color, width: 'fit-content', mb: 2 }}>{stat.icon}</Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', textTransform: 'uppercase' }}>{stat.label}</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>{stat.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <TableContainer component={Paper} sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, py: 2.5 }}>Employee Intel</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Capacity</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Efficiency</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Timeline</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Revenue Contribution</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">Conversion Velocity</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockPerformance.map((emp) => (
                            <TableRow key={emp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 44, height: 44, fontSize: '1rem', fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>{emp.name.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{emp.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{emp.role}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{emp.leads} Leads</TableCell>
                                <TableCell>
                                    <Chip label={emp.ratio} size="small" sx={{ fontWeight: 900, borderRadius: 1.5, bgcolor: alpha('#3b82f6', 0.1), color: '#1d4ed8' }} />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{emp.avgTime}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'success.main' }}>{emp.commission}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ width: 220 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={parseInt(emp.ratio)}
                                            sx={{ 
                                                flexGrow: 1,
                                                height: 8, 
                                                borderRadius: 4, 
                                                bgcolor: '#f1f5f9', 
                                                '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: theme.palette.primary.main } 
                                            }}
                                        />
                                        <Typography variant="caption" sx={{ fontWeight: 800, minWidth: 25 }}>{emp.ratio}</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Performance;
