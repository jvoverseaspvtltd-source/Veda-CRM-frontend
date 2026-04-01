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
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPartnerAccount, setIsPartnerAccount] = useState(false);

    const { signIn, verifySignIn } = useAuth();
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsPartnerAccount(false);
        setLoading(true);

        try {
            const result = await signIn(email, password);
            if (result.error) {
                setError(result.error);
                return;
            }
            
            // Success! Redirection based on user type
            const userType = localStorage.getItem('user_type');
            if (userType === 'Partner') {
                navigate('/partner/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Invalid login credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await verifySignIn(email, otp);
            if (error) throw new Error(error);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Verification failed');
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
                background: 'linear-gradient(135deg, #1a365d 0%, #102a43 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(56, 178, 172, 0.1)', filter: 'blur(50px)' }} />
            <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(246, 173, 85, 0.1)', filter: 'blur(50px)' }} />

            <Container maxWidth="xs">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            borderRadius: 5,
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <img src="/logo-bgremove.png" alt="Veda Loans and Finance" style={{ height: '80px', marginBottom: '16px', objectFit: 'contain' }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, letterSpacing: -0.5 }}>
                                VEDA LOANS AND FINANCE
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                High-Performance CRM Portal
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}
                        {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMessage}</Alert>}

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.form 
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleLoginSubmit}
                                >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
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
                                    sx={{
                                        py: 1.8,
                                        borderRadius: 3,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        boxShadow: '0 10px 15px -3px rgba(26, 54, 93, 0.4)'
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In to Dashboard'}
                                </Button>
                            </Box>
                                </motion.form>
                            )}

                            {step === 2 && (
                                <motion.form 
                                    key="otp-form"
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleOTPSubmit}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 500 }}>
                                            Enter the 6-digit security code sent to <strong>{email}</strong>
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            label="Security Code (OTP)"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><ShieldCheck size={20} color="#38b2ac" /></InputAdornment>,
                                                sx: { fontSize: '1.5rem', letterSpacing: '0.25rem', textAlign: 'center', fontWeight: 'bold' }
                                            }}
                                            inputProps={{
                                                style: { textAlign: 'center', letterSpacing: '0.25rem' },
                                                maxLength: 6
                                            }}
                                        />

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            type="submit"
                                            disabled={loading || otp.length < 6}
                                            sx={{
                                                py: 1.8,
                                                borderRadius: 3,
                                                fontWeight: 800,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                boxShadow: '0 10px 15px -3px rgba(26, 54, 93, 0.4)'
                                            }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Access'}
                                        </Button>

                                        <Button 
                                            onClick={() => { setStep(1); setError(null); setSuccessMessage(null); }}
                                            startIcon={<ArrowLeft size={16} />}
                                            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Back to login
                                        </Button>
                                    </Box>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Login;
