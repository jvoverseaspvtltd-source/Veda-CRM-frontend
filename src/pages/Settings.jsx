import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Switch,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    TextField,
    MenuItem,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { 
    Bell, 
    Shield, 
    Palette, 
    Database, 
    Save,
    AlertTriangle,
    FilePlus,
    Plus,
    Trash2,
    ToggleLeft
} from 'lucide-react';
import { documentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
// import { profileService, authService } from '../services/api'; // Commented out until backend is wired up

const Settings = () => {
    const [activeTab, setActiveTab] = useState('notifications');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form States
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        leads: true,
        commissions: false
    });

    const [security, setSecurity] = useState({
        twoFactor: false,
        sessionTimeout: '30'
    });

    const [appearance, setAppearance] = useState({
        darkMode: false,
        compactSidebar: false
    });

    // Dynamic Form States
    const [docTypes, setDocTypes] = useState([]);
    const [newDoc, setNewDoc] = useState({ name: '', description: '', is_required: true });
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'Super Admin' || profile?.role === 'Admin';

    // Mock initial fetch
    useEffect(() => {
        if (isAdmin) fetchDocTypes();
    }, [isAdmin]);

    const fetchDocTypes = async () => {
        try {
            const data = await documentService.getAllTypes();
            setDocTypes(data);
        } catch (err) {
            console.error('Failed to fetch doc types');
        }
    };

    const handleAddDoc = async () => {
        if (!newDoc.name) return;
        try {
            await documentService.createType(newDoc);
            setNewDoc({ name: '', description: '', is_required: true });
            fetchDocTypes();
        } catch (err) {
            alert('Failed to add document type');
        }
    };

    const handleDeleteDoc = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await documentService.deleteType(id);
            fetchDocTypes();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleToggleRequired = async (doc) => {
        try {
            await documentService.updateType(doc.id, { is_required: !doc.is_required });
            fetchDocTypes();
        } catch (err) {
            alert('Failed to update');
        }
    };

    const handleSave = async () => {
        setLoading(true);
        // Mock save logic for now
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 600);
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 8 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -1 }}>
                            System Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Manage your workspace, security protocols, and notification preferences.
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />} 
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                    >
                        Save Configuration
                    </Button>
                </Box>
                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Settings synced securely to your profile!</Alert>}
            </motion.div>

            <Grid container spacing={4}>
                {/* Left Column: Categories */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ borderRadius: 5, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                        <List component="nav" sx={{ p: 0 }}>
                            <ListItemButton selected={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} sx={{ py: 2 }}>
                                <ListItemIcon><Bell size={20} /></ListItemIcon>
                                <ListItemText primary="Notifications" secondary="Alerts & Emails" primaryTypographyProps={{ fontWeight: 800 }} />
                            </ListItemButton>
                            <Divider />
                            <ListItemButton selected={activeTab === 'security'} onClick={() => setActiveTab('security')} sx={{ py: 2 }}>
                                <ListItemIcon><Shield size={20} /></ListItemIcon>
                                <ListItemText primary="Security" secondary="2FA & Sessions" primaryTypographyProps={{ fontWeight: 800 }} />
                            </ListItemButton>
                            <Divider />
                            <ListItemButton selected={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} sx={{ py: 2 }}>
                                <ListItemIcon><Palette size={20} /></ListItemIcon>
                                <ListItemText primary="Appearance" secondary="Themes & Layout" primaryTypographyProps={{ fontWeight: 800 }} />
                            </ListItemButton>
                            <Divider />
                            <ListItemButton selected={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} sx={{ py: 2 }}>
                                <ListItemIcon><Database size={20} /></ListItemIcon>
                                <ListItemText primary="Data Privacy" secondary="Exports & Logs" primaryTypographyProps={{ fontWeight: 800 }} />
                            </ListItemButton>
                            {isAdmin && (
                                <>
                                    <Divider />
                                    <ListItemButton selected={activeTab === 'form'} onClick={() => setActiveTab('form')} sx={{ py: 2 }}>
                                        <ListItemIcon><FilePlus size={20} /></ListItemIcon>
                                        <ListItemText primary="Application Form" secondary="Manage KYC Docs" primaryTypographyProps={{ fontWeight: 800 }} />
                                    </ListItemButton>
                                </>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Column: Content */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ borderRadius: 5, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', minHeight: 400 }}>
                        <CardContent sx={{ p: 4 }}>
                            <AnimatePresence mode="wait">
                                {activeTab === 'notifications' && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} key="notifications">
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Communication Preferences</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Email Digests</Typography>
                                                    <Typography variant="caption" color="text.secondary">Receive daily summaries and high-priority lead updates via email.</Typography>
                                                </Box>
                                                <Switch checked={notifications.email} onChange={(e) => setNotifications({...notifications, email: e.target.checked})} />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Real-time App Alerts</Typography>
                                                    <Typography variant="caption" color="text.secondary">Immediate bell notifications for system events and messages.</Typography>
                                                </Box>
                                                <Switch checked={notifications.push} onChange={(e) => setNotifications({...notifications, push: e.target.checked})} />
                                            </Box>
                                        </Box>
                                    </motion.div>
                                )}

                                {activeTab === 'security' && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} key="security">
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Advanced Security Hub</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Two-Factor Authentication (2FA)</Typography>
                                                    <Typography variant="caption" color="text.secondary">Add a secondary verification code step during login.</Typography>
                                                </Box>
                                                <Switch checked={security.twoFactor} onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})} />
                                            </Box>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Global Session Timeout Control"
                                                value={security.sessionTimeout}
                                                onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                                                variant="outlined"
                                                helperText="The system will auto-logout if no activity is detected after this duration."
                                            >
                                                <MenuItem value="15">15 Minutes (High Security)</MenuItem>
                                                <MenuItem value="30">30 Minutes (Standard)</MenuItem>
                                                <MenuItem value="60">1 Hour (Relaxed)</MenuItem>
                                                <MenuItem value="120">2 Hours (Development)</MenuItem>
                                            </TextField>

                                            <Divider sx={{ my: 2 }} />
                                            
                                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'error.light', borderRadius: 3, bgcolor: '#fff5f5' }}>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                                    <AlertTriangle size={18} color="red" />
                                                    <Typography variant="subtitle2" color="error" sx={{ fontWeight: 800 }}>Force Password Reset</Typography>
                                                </Box>
                                                <Typography variant="caption" color="error.dark" display="block" sx={{ mb: 2, fontWeight: 500 }}>
                                                    This will invalidate all current active sessions across all devices and immediately send a password reset link to your registered email address.
                                                </Typography>
                                                <Button variant="contained" color="error" size="small" sx={{ fontWeight: 700, borderRadius: 2 }}>Execute Reset Now</Button>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                )}

                                {activeTab === 'appearance' && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} key="appearance">
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Visual Interface Settings</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Dark Mode (Night Owl)</Typography>
                                                    <Typography variant="caption" color="text.secondary">Switch the entire application to a high-contrast dark theme.</Typography>
                                                    <Chip size="small" label="COMING SOON" sx={{ display: 'block', mt: 1, width: 'fit-content', fontSize: '0.65rem', fontWeight: 800, bgcolor: 'divider' }} />
                                                </Box>
                                                <Switch checked={appearance.darkMode} onChange={(e) => setAppearance({...appearance, darkMode: e.target.checked})} disabled />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Compact Architecture</Typography>
                                                    <Typography variant="caption" color="text.secondary">Reduce padding globally and shrink the side navigation for maximum data density.</Typography>
                                                </Box>
                                                <Switch checked={appearance.compactSidebar} onChange={(e) => setAppearance({...appearance, compactSidebar: e.target.checked})} />
                                            </Box>
                                        </Box>
                                    </motion.div>
                                )}

                                {activeTab === 'form' && isAdmin && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} key="form">
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Loan Application Form Setup</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Configure the documents required during the public application process.</Typography>

                                        <Box sx={{ mb: 4, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 4, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Add New Required Document</Typography>
                                            <Grid container spacing={2}>
                                                <Grid size={ 12 } sm={5}>
                                                    <TextField fullWidth size="small" label="Document Name" value={newDoc.name} onChange={(e) => setNewDoc({...newDoc, name: e.target.value})} placeholder="e.g. Salary Slip" />
                                                </Grid>
                                                <Grid size={ 12 } sm={4}>
                                                    <TextField fullWidth size="small" label="Description" value={newDoc.description} onChange={(e) => setNewDoc({...newDoc, description: e.target.value})} placeholder="Optional hint" />
                                                </Grid>
                                                <Grid size={ 12 } sm={3}>
                                                    <Button fullWidth variant="soft" startIcon={<Plus size={18} />} onClick={handleAddDoc} sx={{ height: '40px', borderRadius: 2, fontWeight: 750 }}>Add Field</Button>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Existing Form Fields</Typography>
                                        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {docTypes.map((doc) => (
                                                <Paper key={doc.id} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{doc.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{doc.description || 'No description provided.'}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip 
                                                            label={doc.is_required ? "Required" : "Optional"} 
                                                            size="small" 
                                                            onClick={() => handleToggleRequired(doc)}
                                                            color={doc.is_required ? "primary" : "default"}
                                                            sx={{ fontWeight: 700, cursor: 'pointer' }}
                                                        />
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteDoc(doc.id)}>
                                                            <Trash2 size={18} />
                                                        </IconButton>
                                                    </Box>
                                                </Paper>
                                            ))}
                                            {docTypes.length === 0 && (
                                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No custom documents added yet. Public form will use defaults.</Typography>
                                            )}
                                        </List>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Settings;
