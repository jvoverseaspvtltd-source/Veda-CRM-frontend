import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Container,
    Alert,
    CircularProgress
} from '@mui/material';
import { Eye, EyeOff, Lock, Mail, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { lendingPartnerService } from '../../services/api';
import { usePartnerAuth } from '../../context/PartnerAuthContext';

const PartnerLogin = () => {
    const { login: setAuth } = usePartnerAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await lendingPartnerService.login(email, password);
            setAuth(data.partner, data.token);
            navigate('/partner/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid login credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #2c5282 0%, #1a365d 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="xs">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            borderRadius: 5,
                            bgcolor: 'rgba(255, 255, 255, 0.98)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Building2 size={40} color="#2c5282" />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                                Credit Partner
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Secure Login for Credit Partners
                            </Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    fullWidth
                                    label="Partner Email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Mail size={18} color="#718096" /></InputAdornment>,
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Lock size={18} color="#718096" /></InputAdornment>,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    type="submit"
                                    disabled={loading}
                                    sx={{ py: 1.8, borderRadius: 3, fontWeight: 800, mt: 1 }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In to Portal'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default PartnerLogin;
