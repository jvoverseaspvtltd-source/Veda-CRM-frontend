import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress
} from '@mui/material';
import { Download, MoreHorizontal, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { commissionService } from '../services/api';

const Commissions = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            const data = await commissionService.getAll();
            setCommissions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalExpected = commissions.reduce((sum, item) => sum + (item.expected_amount || 0), 0);
    const totalReceived = commissions.reduce((sum, item) => sum + (item.received_amount || 0), 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Commission Tracking
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Financial dashboard for revenue and TDS tracking
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Download size={20} />}
                    sx={{ px: 3, borderRadius: 2 }}
                >
                    Export Report
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                {[
                    { label: 'Total Expected', value: `₹${totalExpected.toLocaleString()}`, color: 'primary.main', bg: alpha('#1a365d', 0.05), icon: <TrendingUp size={20} /> },
                    { label: 'Received Revenue', value: `₹${totalReceived.toLocaleString()}`, color: 'success.main', bg: alpha('#10b981', 0.05), icon: <ShieldCheck size={20} /> },
                    { label: 'Pending Payout', value: `₹${(totalExpected - totalReceived).toLocaleString()}`, color: 'warning.main', bg: alpha('#f59e0b', 0.05), icon: <Activity size={20} /> },
                ].map((stat, index) => (
                    <Grid size={{ xs: 12, md: 4 }} key={index}>
                        <Card sx={{ 
                            borderRadius: 5, 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)', borderColor: stat.color }
                        }}>
                            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: stat.bg, color: stat.color, display: 'flex' }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>{stat.value}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
                ) : (
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Bank Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Loan Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Expected Commission</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Payment Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>TDS Details</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {commissions.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{item.bank_name || 'Partner Bank'}</TableCell>
                                    <TableCell>₹{item.loan_amount?.toLocaleString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>₹{item.expected_amount?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.status}
                                            color={item.status === 'Received' ? 'success' : 'warning'}
                                            size="small"
                                            sx={{ fontWeight: 600, borderRadius: '6px' }}
                                        />
                                    </TableCell>
                                    <TableCell>{item.payment_date || '-'}</TableCell>
                                    <TableCell>{item.tds_details || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small"><MoreHorizontal size={18} /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {commissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>No commission records found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
        </Box>
    );
};

export default Commissions;
