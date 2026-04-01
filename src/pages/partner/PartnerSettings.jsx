import React, { useState } from 'react';
import {
    Box, Typography, Card, TextField, Button, 
    Divider, Alert, CircularProgress, alpha, useTheme, 
    FormControlLabel, Switch, InputAdornment, IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Lock, Bell, Key, Eye, EyeOff, Save, ShieldAlert, Cpu } from 'lucide-react';
import { lendingPartnerService } from '../../services/api';

const motionContainerX = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, duration: 0.4 } }
};

const motionItem = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const CustomSwitch = ({ checked, onChange, label, color }) => {
    const theme = useTheme();
    return (
        <FormControlLabel 
            control={
                <Switch 
                    checked={checked} 
                    onChange={onChange} 
                    sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: color, '&:hover': { bgcolor: alpha(color, 0.1) } },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: color, opacity: 0.5 },
                        '& .MuiSwitch-track': { bgcolor: theme.palette.text.disabled }
                    }}
                />
            } 
            label={<Typography variant="body1" sx={{ fontWeight: 600, ml: 1 }}>{label}</Typography>} 
            sx={{ m: 0, p: 1.5, borderRadius: 3, border: '1px solid', borderColor: checked ? alpha(color, 0.3) : 'transparent', bgcolor: checked ? alpha(color, 0.05) : 'transparent', transition: 'all 0.3s' }}
        />
    );
};

const PartnerSettings = () => {
    const theme = useTheme();
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [notif, setNotif] = useState({ email: true, push: false, sms: true });

    const handlePassChange = async () => {
        if (!password.new || password.new !== password.confirm) {
            setStatus({ type: 'error', message: 'Engine Error: New passwords do not match the required hash.' });
            return;
        }
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            await lendingPartnerService.resetPassword(partner.id, password.new);
            setStatus({ type: 'success', message: 'Encryption updated! Password successfully rotated.' });
            setPassword({ current: '', new: '', confirm: '' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Handshake failed. Current password may be invalid.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100%', pb: 8 }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)' }}>
                        <Cpu size={28} />
                    </Box>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, background: 'linear-gradient(45deg, #1e293b, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            System Configuration
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Manage endpoint security, node preferences, and webhook alerts.
                        </Typography>
                    </Box>
                </Box>
            </motion.div>

            <AnimatePresence>
                {status.message && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <Alert 
                            severity={status.type} 
                            icon={status.type === 'error' ? <ShieldAlert /> : undefined}
                            sx={{ mb: 4, borderRadius: 3, fontWeight: 700, border: '1px solid', borderColor: status.type === 'error' ? alpha('#ef4444', 0.5) : alpha('#10b981', 0.5) }}
                        >
                            {status.message}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <Grid container spacing={4} component={motion.div} variants={motionContainerX} initial="hidden" animate="visible">
                {/* Security Section */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <motion.div variants={motionItem}>
                        <Card sx={{ 
                            p: 4, borderRadius: 5, mb: 4, position: 'relative', overflow: 'hidden',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                            backdropFilter: 'blur(20px)', border: '1px solid', borderColor: alpha('#6366f1', 0.2), boxShadow: `0 10px 40px ${alpha('#6366f1', 0.05)}`
                        }}>
                            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${alpha('#6366f1', 0.15)} 0%, transparent 70%)` }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}><Lock size={22} /></Box>
                                <Typography variant="h5" fontWeight={900}>Encryption Keys</Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField 
                                    label="Current Password" type={showPass ? 'text' : 'password'} fullWidth
                                    value={password.current} onChange={(e) => setPassword({...password, current: e.target.value})}
                                    variant="filled"
                                    sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6), '&:hover, &.Mui-focused': { bgcolor: 'background.paper' } } }}
                                />
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField 
                                            label="New Access Key" type={showPass ? 'text' : 'password'} fullWidth
                                            value={password.new} onChange={(e) => setPassword({...password, new: e.target.value})}
                                            variant="filled" sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6), '&:hover, &.Mui-focused': { bgcolor: 'background.paper', boxShadow: `0 0 0 2px ${alpha('#6366f1', 0.3)}` } } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField 
                                            label="Confirm Key" type={showPass ? 'text' : 'password'} fullWidth
                                            value={password.confirm} onChange={(e) => setPassword({...password, confirm: e.target.value})}
                                            variant="filled" sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6), '&:hover, &.Mui-focused': { bgcolor: 'background.paper', boxShadow: `0 0 0 2px ${alpha('#6366f1', 0.3)}` } } }}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <Button size="small" variant="text" onClick={() => setShowPass(!showPass)} startIcon={showPass ? <EyeOff size={16}/> : <Eye size={16}/>} sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                        {showPass ? "Mask Input" : "Reveal Input"}
                                    </Button>
                                    <Button 
                                        variant="contained" onClick={handlePassChange} disabled={loading || !password.new} 
                                        sx={{ fontWeight: 800, borderRadius: 3, px: 4, py: 1.2, background: 'linear-gradient(45deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}
                                    >
                                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Commit Changes'}
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    </motion.div>

                    <motion.div variants={motionItem}>
                        <Card sx={{ 
                            p: 4, borderRadius: 5, 
                            bgcolor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(20px)',
                            border: '1px solid', borderColor: alpha('#f59e0b', 0.2) 
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}><Key size={22} /></Box>
                                <Typography variant="h5" fontWeight={900}>API Handshake Data</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Use this secure string to authenticate your internal bank webhooks with the Veda CRM instance.
                            </Typography>
                            <Box sx={{ position: 'relative' }}>
                                <TextField 
                                    fullWidth disabled value="VEDA_API_SK_994X_C821_B00A_911F"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: alpha('#f59e0b', 0.05), fontWeight: 800, fontFamily: 'monospace', color: '#d97706', '& fieldset': { borderColor: alpha('#f59e0b', 0.2) } } }}
                                />
                                <Button variant="contained" size="small" color="warning" sx={{ position: 'absolute', right: 8, top: 10, borderRadius: 2, fontWeight: 800 }}>Copy Key</Button>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>

                {/* Notifications Section */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <motion.div variants={motionItem}>
                        <Card sx={{ 
                            p: 4, borderRadius: 5, height: '100%',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                            backdropFilter: 'blur(20px)', border: '1px solid', borderColor: 'divider', boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.03)}`
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), color: '#10b981', position: 'relative' }}>
                                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: 0, borderRadius: 8, border: '2px solid #10b981' }} />
                                    <Bell size={22} />
                                </Box>
                                <Typography variant="h5" fontWeight={900}>Webhook & Alerts</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <CustomSwitch label="Standard Email Handshake" color="#3b82f6" checked={notif.email} onChange={(e) => setNotif({...notif, email: e.target.checked})} />
                                <CustomSwitch label="Secure SMS Delivery" color="#8b5cf6" checked={notif.sms} onChange={(e) => setNotif({...notif, sms: e.target.checked})} />
                                <CustomSwitch label="Socket Push Notifications" color="#10b981" checked={notif.push} onChange={(e) => setNotif({...notif, push: e.target.checked})} />
                            </Box>
                            
                            <Divider sx={{ my: 4, opacity: 0.6 }} />
                            
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.divider, 0.04), border: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                                    Active Session Fingerprint
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>
                                    IP: 103.22.45.18<br/>
                                    AUTH: Bearer Token (Expires 24h)<br/>
                                    LAST PING: {new Date().toLocaleTimeString()}
                                </Typography>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PartnerSettings;
