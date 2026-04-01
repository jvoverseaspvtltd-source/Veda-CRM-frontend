import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, TextField, Button, Dialog, DialogTitle, DialogContent, 
    DialogActions, Chip, Divider, CircularProgress, Alert, alpha, useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Headphones, Activity } from 'lucide-react';
import { supportService } from '../../services/api';

const motionContainerY = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, duration: 0.4 } }
};

const motionItemY = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const PartnerHelpDesk = () => {
    const theme = useTheme();
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', category: 'Technical Issue', message: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await supportService.getTickets(partner.id, 'Partner');
            setTickets(data);
        } catch (err) {
            setError('Failed to establish connection to support nodes.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.message) return;
        setSubmitting(true);
        try {
            await supportService.createTicket({
                ...newTicket,
                userId: partner.id,
                userType: 'Partner',
                userName: partner.name
            });
            setOpenModal(false);
            setNewTicket({ subject: '', category: 'Technical Issue', message: '' });
            fetchTickets();
        } catch (err) {
            setError('Signal lost. Failed to dispatch ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    const StatusBadge = ({ status }) => {
        let color = '#94a3b8';
        let pulsing = false;
        
        if (status === 'Open') { color = '#f59e0b'; pulsing = true; }
        else if (status === 'In Progress') { color = '#3b82f6'; pulsing = true; }
        else if (status === 'Closed') { color = '#10b981'; }

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {pulsing && (
                    <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 8px ${color}` }} />
                    </motion.div>
                )}
                {!pulsing && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />}
                <Typography variant="caption" sx={{ fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{status}</Typography>
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
                <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Activity size={48} color={theme.palette.primary.main} />
                </motion.div>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 2 }}>POLLING SUPPORT NODES...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100%', pb: 8 }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 3, background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)' }}>
                            <Headphones size={28} />
                        </Box>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, background: 'linear-gradient(45deg, #1e293b, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Network Support
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Priority dispatch for technical errors and routing issues.
                            </Typography>
                        </Box>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<Plus size={18} />}
                        onClick={() => setOpenModal(true)}
                        sx={{ borderRadius: 3, fontWeight: 800, px: 3, py: 1.2, background: 'linear-gradient(45deg, #ec4899, #f43f5e)', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)' }}
                    >
                        Dispatch Ticket
                    </Button>
                </Box>
            </motion.div>

            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

            {/* Ticket Grid */}
            <Grid container spacing={3} component={motion.div} variants={motionContainerY} initial="hidden" animate="visible">
                {tickets.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <motion.div variants={motionItemY}>
                            <Card sx={{ p: 8, borderRadius: 5, textAlign: 'center', border: '1px dashed', borderColor: alpha(theme.palette.primary.main, 0.3), bgcolor: alpha(theme.palette.background.paper, 0.4) }}>
                                <Box sx={{ p: 3, borderRadius: '50%', bgcolor: alpha(theme.palette.text.secondary, 0.05), display: 'inline-flex', mb: 3 }}>
                                    <CheckCircle size={48} color={theme.palette.success.main} />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>System Optimal</Typography>
                                <Typography variant="body1" color="text.secondary">No active support dispatches detected for this node.</Typography>
                            </Card>
                        </motion.div>
                    </Grid>
                ) : (
                    tickets.map((ticket) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={ticket.id}>
                            <motion.div variants={motionItemY} whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                                <Card sx={{ 
                                    p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column',
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
                                    backdropFilter: 'blur(20px)', border: '1px solid', borderColor: ticket.status === 'Open' ? alpha('#f59e0b', 0.3) : 'divider',
                                    boxShadow: `0 10px 30px ${alpha('#000', 0.03)}`
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>Ref: #{ticket.id.toString().padStart(4, '0')}</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{ticket.subject}</Typography>
                                        </Box>
                                        <StatusBadge status={ticket.status} />
                                    </Box>
                                    
                                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {ticket.message}
                                        </Typography>
                                    </Box>
                                    
                                    <Divider sx={{ mb: 2, opacity: 0.6 }} />
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Clock size={14} color={theme.palette.text.disabled} />
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Button size="small" sx={{ fontWeight: 800, borderRadius: 2 }} endIcon={<MessageSquare size={14} />}>Trace</Button>
                                    </Box>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Futuristic Modal */}
            <Dialog 
                open={openModal} 
                onClose={() => setOpenModal(false)} 
                maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 5, p: 1, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2), boxShadow: `0 25px 50px ${alpha('#000', 0.2)}` } }}
            >
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                    <AlertCircle color={theme.palette.primary.main} /> Transmit Query
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <TextField 
                            label="Encryption Subject" fullWidth value={newTicket.subject}
                            onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                            variant="filled" sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                        />
                        <TextField 
                            select label="System Category" fullWidth value={newTicket.category}
                            SelectProps={{ native: true }} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                            variant="filled" sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                        >
                            <option value="Technical Issue">Node Technical Failure</option>
                            <option value="Process Query">Protocol Routing Query</option>
                            <option value="Payment Issue">Ledger Sync Issue</option>
                            <option value="Other">External Threat / Other</option>
                        </TextField>
                        <TextField 
                            label="Diagnostic Logs / Message" fullWidth multiline rows={5} value={newTicket.message}
                            onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                            variant="filled" sx={{ '& .MuiFilledInput-root': { borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 700, borderRadius: 2 }}>Abort</Button>
                    <Button 
                        variant="contained" onClick={handleCreateTicket} disabled={submitting || !newTicket.subject || !newTicket.message}
                        sx={{ fontWeight: 800, borderRadius: 3, px: 4, py: 1.2, boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}` }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Dispatch Payload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PartnerHelpDesk;
