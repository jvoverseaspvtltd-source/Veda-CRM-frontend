import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { bankService } from '../services/api';

const Banks = () => {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        product_type: '',
        roi: '',
        max_loan_amount: '',
        processing_fees: '',
        commission_percent: '',
        required_documents: ''
    });

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            setLoading(true);
            const data = await bankService.getAllBanks();
            setBanks(data);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch banks.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await bankService.addBank(formData);
            setOpen(false);
            fetchBanks(); // Refresh
            setFormData({ name: '', product_type: '', roi: '', max_loan_amount: '', processing_fees: '', commission_percent: '', required_documents: '' });
        } catch (err) {
            console.error('Submit error:', err);
            alert('Failed to save bank');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Bank & NBFC Panel
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage partner banks, ROI, and commission structures
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setOpen(true)}
                    sx={{ px: 3, py: 1.2, borderRadius: 2 }}
                >
                    Add Partner Bank
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {loading ? (
                    <Box sx={{ width: '100%', height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : banks.length === 0 ? (
                    <Grid size={12}>
                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                            <Typography variant="h6" color="text.secondary">No partner banks registered yet</Typography>
                            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpen(true)}>Add your first bank</Button>
                        </Paper>
                    </Grid>
                ) : (
                    banks.map((bank) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={bank.id}>
                            <Card sx={{ 
                                height: '100%', 
                                borderRadius: 4, 
                                transition: 'all 0.3s ease',
                                border: '1px solid #e2e8f0',
                                '&:hover': { 
                                    transform: 'translateY(-5px)', 
                                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                                    borderColor: 'primary.main'
                                } 
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                                                {bank.name.charAt(0)}
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{bank.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{bank.product_type}</Typography>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <IconButton size="small"><Edit2 size={16} /></IconButton>
                                            <IconButton size="small" color="error"><Trash2 size={16} /></IconButton>
                                        </Box>
                                    </Box>
                                    
                                    <Divider sx={{ my: 2, opacity: 0.6 }} />
                                    
                                    <Grid container spacing={2}>
                                        <Grid size={6}>
                                            <Typography variant="caption" color="text.secondary" display="block">ROI Range</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{bank.roi}% p.a.</Typography>
                                        </Grid>
                                        <Grid size={6}>
                                            <Typography variant="caption" color="text.secondary" display="block">Max Tenure</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>240 Months</Typography>
                                        </Grid>
                                        <Grid size={6}>
                                            <Typography variant="caption" color="text.secondary" display="block">Commission</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>{bank.commission_percent}%</Typography>
                                        </Grid>
                                        <Grid size={6}>
                                            <Typography variant="caption" color="text.secondary" display="block">Fees</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{bank.processing_fees}</Typography>
                                        </Grid>
                                    </Grid>

                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Add Partner Bank/NBFC</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid size={12}>
                            <TextField fullWidth name="name" label="Bank Name" required value={formData.name} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth name="product_type" label="Product Type" value={formData.product_type} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth name="roi" label="ROI %" value={formData.roi} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth name="max_loan_amount" label="Max Loan Amount" value={formData.max_loan_amount} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth name="processing_fees" label="Processing Fees" value={formData.processing_fees} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth name="commission_percent" label="Commission %" value={formData.commission_percent} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={12}>
                            <TextField fullWidth multiline rows={3} name="required_documents" label="Required Documents List" value={formData.required_documents} onChange={handleFormChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ px: 4 }}>Save Bank</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Banks;
