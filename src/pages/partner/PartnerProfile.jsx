import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Avatar, Divider, Chip, TextField, Button,
    CircularProgress, Alert, useTheme, alpha, Card, IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, MapPin, Mail, Phone, Briefcase, Save, ShieldCheck, 
    Fingerprint, Lock, Globe, Server, CheckCircle2, Edit2, KeyRound, Clock 
} from 'lucide-react';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { lendingPartnerService } from '../../services/api';

const motionContainerX = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, duration: 0.4 } }
};

const motionItem = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const InfoRow = ({ icon: Icon, label, value, color }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(color, 0.1), color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} />
        </Box>
        <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.2 }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {value || '—'}
            </Typography>
        </Box>
    </Box>
);

const PartnerProfile = () => {
    const { partner: contextPartner, login } = usePartnerAuth();
    const theme = useTheme();
    const [partner, setPartner] = useState(contextPartner);
    const [editMode, setEditMode] = useState(false);
    const [phone, setPhone] = useState(partner?.phone || '');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contextPartner?.id) {
            fetchFullProfile();
        }
    }, [contextPartner?.id]);

    const fetchFullProfile = async () => {
        try {
            setLoading(true);
            const data = await lendingPartnerService.getById(contextPartner.id);
            setPartner(data);
            setPhone(data.phone || '');
            // Update context for other pages
            login(data, localStorage.getItem('partner_token'));
        } catch (err) {
            console.error('Failed to fetch full profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const updated = await lendingPartnerService.update(partner.id, { ...partner, phone });
            setPartner(prev => ({ ...prev, phone: updated.phone }));
            login({ ...partner, phone: updated.phone }, localStorage.getItem('partner_token'));
            setSuccess(true);
            setEditMode(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to update phone number. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !partner) {
        return (
            <Box sx={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100%', pb: 8 }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)' }}>
                        <Fingerprint size={28} />
                    </Box>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, background: 'linear-gradient(45deg, #1e293b, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Identity & Security
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Manage your Veda credentials and verify your data endpoints.
                        </Typography>
                    </Box>
                </Box>
            </motion.div>

            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>Profile updated successfully! System records synced.</Alert>
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <Grid container spacing={4} component={motion.div} variants={motionContainerX} initial="hidden" animate="visible">
                
                {/* Left Column: Avatar & System Status */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={motionItem}>
                        <Card sx={{ 
                            p: 4, borderRadius: 5, textAlign: 'center', position: 'relative', overflow: 'hidden',
                            background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                            backdropFilter: 'blur(20px)', border: '1px solid', borderColor: 'divider', boxShadow: `0 20px 40px ${alpha('#000', 0.05)}`
                        }}>
                            {/* Futuristic Background accents */}
                            <Box sx={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${alpha('#10b981', 0.2)} 0%, transparent 70%)` }} />
                            
                            {/* Pulsing Avatar */}
                            <Box sx={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', mb: 3 }}>
                                {/* Pulse Rings */}
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: -10, bottom: -10, left: -10, right: -10, borderRadius: '50%', border: `2px solid ${theme.palette.primary.main}` }} />
                                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0, 0.1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} style={{ position: 'absolute', top: -10, bottom: -10, left: -10, right: -10, borderRadius: '50%', border: `1px solid ${theme.palette.primary.main}` }} />
                                
                                <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 900, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`, position: 'relative', zIndex: 1, border: '4px solid #fff' }}>
                                    {partner?.name?.charAt(0) || 'P'}
                                </Avatar>
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>{partner?.name}</Typography>
                            
                            {/* Glowing Chips */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                                <Chip label={partner?.partner_role || 'Relationship Manager'} size="small" icon={<Briefcase size={14} />} sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 1.5 }} />
                                <Chip label={partner?.status || 'Active'} size="small" icon={<CheckCircle2 size={14} />} sx={{ fontWeight: 800, bgcolor: alpha('#10b981', 0.15), color: '#059669', borderRadius: 1.5 }} />
                            </Box>
                            
                            <Divider sx={{ my: 3, opacity: 0.6 }} />

                            {/* Cyber Security Badges */}
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 2, textAlign: 'left' }}>
                                Security Perimeter
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.05), border: `1px solid ${alpha('#10b981', 0.1)}` }}>
                                    <ShieldCheck size={18} color="#10b981" />
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, display: 'block' }}>SSL Encrypted</Typography>
                                        <Typography variant="caption" color="text.secondary">Veda-API v2.4 Active</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.05), border: `1px solid ${alpha('#f59e0b', 0.1)}` }}>
                                    <Globe size={18} color="#f59e0b" />
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700, display: 'block' }}>Network IP Validated</Typography>
                                        <Typography variant="caption" color="text.secondary">Auth Node: MUM-9X</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </motion.div>
                </Grid>

                {/* Right Column: Details & Edit Forms */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <motion.div variants={motionItem}>
                        <Card sx={{ 
                            p: { xs: 3, md: 5 }, borderRadius: 5, 
                            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
                            backdropFilter: 'blur(20px)', border: '1px solid', borderColor: 'divider', boxShadow: `0 10px 30px ${alpha('#000', 0.03)}`
                        }}>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Server size={22} color={theme.palette.primary.main} />
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>Core Integration Profile</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, ml: 4 }}>
                                These details map your institution's endpoints with the Veda CRM processing engine.
                            </Typography>

                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <InfoRow icon={Building2} label="Bank / Institution Name" value={partner?.bank_name} color="#3b82f6" />
                                    <InfoRow icon={MapPin} label="Service Branch" value={partner?.branch_name} color="#f59e0b" />
                                    <InfoRow icon={Clock} label="System Enrollment Date" value={partner?.created_at ? new Date(partner.created_at).toLocaleDateString() : '--'} color="#8b5cf6" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <InfoRow icon={KeyRound} label="Access Tier" value="Enterprise API" color="#8b5cf6" />
                                    <InfoRow icon={Mail} label="Registered Email" value={partner?.email} color="#ec4899" />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.5) }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Phone size={22} color={theme.palette.success.main} />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Contact Information</Typography>
                                </Box>
                                {!editMode && (
                                    <Button variant="outlined" size="small" onClick={() => setEditMode(true)} startIcon={<Edit2 size={14} />} sx={{ borderRadius: 2, fontWeight: 700 }}>
                                        Edit Number
                                    </Button>
                                )}
                            </Box>

                            <AnimatePresence mode="wait">
                                {editMode ? (
                                    <motion.div key="edit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                        <Box sx={{ p: 4, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Update Support Phone</Typography>
                                            <TextField
                                                label="Phone Number"
                                                variant="outlined"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                fullWidth
                                                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper', transition: 'all 0.2s', '&:hover, &.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}` } } }}
                                                InputProps={{ startAdornment: <Box sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }}><Phone size={18} /></Box> }}
                                            />
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />} sx={{ fontWeight: 800, borderRadius: 3, px: 4, py: 1.2, boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}` }}>
                                                    Save Changes
                                                </Button>
                                                <Button onClick={() => setEditMode(false)} disabled={saving} sx={{ fontWeight: 700, px: 3, borderRadius: 3 }}>
                                                    Cancel
                                                </Button>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                ) : (
                                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: 1 }}>
                                                {partner?.phone || 'No phone number provided'}
                                            </Typography>
                                            {partner?.phone && <Chip label="Verified" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }} />}
                                        </Box>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PartnerProfile;
