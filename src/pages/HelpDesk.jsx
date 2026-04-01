import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    TextField,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    useTheme,
    alpha,
    Badge,
    Stack,
    Tooltip
} from '@mui/material';
import {
    Send,
    Plus,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    Search,
    RefreshCw,
    X,
    LifeBuoy,
    ChevronRight,
    Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supportService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const HelpDesk = () => {
    const theme = useTheme();
    const { user, profile } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [newMsg, setNewMsg] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const scrollRef = useRef(null);

    const isAdmin = user?.role === 'admin' || user?.role === 'Admin';
    // userId and userType are no longer sent to the backend as it identifies via Token
    
    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            loadMessages(selectedTicket.id);
            // Polling for new messages
            const interval = setInterval(() => loadMessages(selectedTicket.id, true), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedTicket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            // No longer sending userId/userType - backend identifies from token
            const data = await supportService.getTickets();
            setTickets(data);
            if (data.length > 0 && !selectedTicket) {
                setSelectedTicket(data[0]);
            }
        } catch (err) {
            console.error('Failed to load tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (ticketId, isSilent = false) => {
        if (!isSilent) setMsgLoading(true);
        try {
            const data = await supportService.getMessages(ticketId);
            setMessages(data);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            if (!isSilent) setMsgLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.message) return;
        try {
            // Simplified - backend adds user_id and user_type from token
            const ticket = await supportService.createTicket({
                subject: newTicket.subject,
                message: newTicket.message
            });
            setOpenModal(false);
            setNewTicket({ subject: '', message: '' });
            loadTickets();
            setSelectedTicket(ticket);
        } catch (err) {
            console.error('Failed to create ticket:', err);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMsg.trim() || !selectedTicket) return;

        const msgContent = newMsg;
        setNewMsg('');
        try {
            // Simplified - backend adds senderId and senderType from token
            await supportService.sendMessage({
                ticketId: selectedTicket.id,
                message: msgContent
            });
            loadMessages(selectedTicket.id, true);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedTicket) return;
        try {
            await supportService.updateStatus(selectedTicket.id, status);
            setSelectedTicket({ ...selectedTicket, status });
            loadTickets();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || t.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LifeBuoy size={32} className="text-primary-main" /> Veda Help Desk
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {isAdmin ? 'Manage global support enquiries and interactions.' : 'Report issues or chat with our support team.'}
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Plus size={18} />}
                    onClick={() => setOpenModal(true)}
                    sx={{ borderRadius: 3, px: 3, fontWeight: 800, boxShadow: theme => `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}` }}
                >
                    New Support Ticket
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
                {/* Tickets List */}
                <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ height: '100%' }}>
                    <Paper sx={{ height: '100%', borderRadius: 6, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <TextField
                                fullWidth
                                placeholder="Search tickets..."
                                size="small"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.5 }} />,
                                    sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }
                                }}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                {['All', 'Open', 'Closed'].map((f) => (
                                    <Chip 
                                        key={f} 
                                        label={f} 
                                        size="small" 
                                        onClick={() => setFilter(f)}
                                        sx={{ 
                                            fontWeight: 800, 
                                            fontSize: '0.7rem',
                                            bgcolor: filter === f ? 'primary.main' : 'transparent',
                                            color: filter === f ? '#fff' : 'text.secondary',
                                            border: '1px solid',
                                            borderColor: filter === f ? 'primary.main' : 'divider'
                                        }} 
                                    />
                                ))}
                            </Stack>
                        </Box>

                        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
                            ) : filteredTickets.length > 0 ? filteredTickets.map((t) => (
                                <ListItem 
                                    key={t.id} 
                                    button 
                                    onClick={() => setSelectedTicket(t)}
                                    selected={selectedTicket?.id === t.id}
                                    sx={{ 
                                        borderBottom: '1px solid', 
                                        borderColor: alpha(theme.palette.divider, 0.5),
                                        py: 2,
                                        '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderRight: `4px solid ${theme.palette.primary.main}` }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: t.status === 'Open' ? alpha(theme.palette.success.main, 0.1) : 'divider', color: t.status === 'Open' ? 'success.main' : 'text.secondary' }}>
                                            {t.status === 'Open' ? <MessageSquare size={20} /> : <CheckCircle2 size={20} />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {t.subject}
                                            </Typography>
                                        } 
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                <Clock size={12} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </Typography>
                                                {isAdmin && (
                                                    <Chip 
                                                        label={t.user_type === 'partner' ? 'PARTNER' : 'EMPLOYEE'} 
                                                        size="small" 
                                                        sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900, ml: 'auto', bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.dark' }} 
                                                    />
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            )) : (
                                <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                                    <AlertCircle size={32} style={{ marginBottom: 8 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>No Tickets Found</Typography>
                                </Box>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Chat Section */}
                <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ height: '100%' }}>
                    {selectedTicket ? (
                        <Paper sx={{ height: '100%', borderRadius: 6, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {/* Chat Header */}
                            <Box sx={{ p: 2, px: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(theme.palette.background.default, 0.3) }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{selectedTicket.subject}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip 
                                            label={selectedTicket.status} 
                                            size="small" 
                                            color={selectedTicket.status === 'Open' ? 'success' : 'default'}
                                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} 
                                        />
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Ticket ID: #{selectedTicket.id.split('-')[0].toUpperCase()}</Typography>
                                    </Box>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                    {isAdmin && selectedTicket.status === 'Open' && (
                                        <Button 
                                            size="small" 
                                            variant="outlined" 
                                            color="success" 
                                            onClick={() => handleUpdateStatus('Closed')}
                                            sx={{ fontWeight: 800, borderRadius: 2 }}
                                        >
                                            Mark Resolved
                                        </Button>
                                    )}
                                    <IconButton onClick={() => loadMessages(selectedTicket.id)}><RefreshCw size={18} /></IconButton>
                                </Stack>
                            </Box>

                            {/* Messages Area */}
                            <Box 
                                ref={scrollRef}
                                sx={{ 
                                    flexGrow: 1, 
                                    overflowY: 'auto', 
                                    p: { xs: 2, md: 3 }, 
                                    bgcolor: alpha(theme.palette.background.default, 0.2),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2
                                }}
                            >
                                {msgLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                                ) : (
                                    messages.map((m, i) => {
                                        const isMine = m.sender_id === userId;
                                        return (
                                            <Box 
                                                key={m.id} 
                                                sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                    mb: 1
                                                }}
                                            >
                                                <Box sx={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                                    <Paper 
                                                        elevation={0}
                                                        sx={{ 
                                                            p: 2, 
                                                            px: 2.5,
                                                            borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                                            bgcolor: isMine ? 'primary.main' : 'background.paper',
                                                            color: isMine ? '#fff' : 'text.primary',
                                                            border: isMine ? 'none' : '1px solid',
                                                            borderColor: 'divider',
                                                            boxShadow: isMine ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}` : 'none'
                                                        }}
                                                    >
                                                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.5 }}>
                                                            {m.message}
                                                        </Typography>
                                                    </Paper>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                        {!isMine && (
                                                            <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.6rem', color: 'primary.main', textTransform: 'uppercase' }}>
                                                                {m.sender_type}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
                                                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        );
                                    })
                                )}
                            </Box>

                            {/* Message Input */}
                            {selectedTicket.status === 'Open' ? (
                                <Box 
                                    component="form" 
                                    onSubmit={handleSendMessage}
                                    sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                                >
                                    <TextField
                                        fullWidth
                                        placeholder="Type your message here..."
                                        value={newMsg}
                                        onChange={(e) => setNewMsg(e.target.value)}
                                        autoComplete="off"
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton 
                                                    color="primary" 
                                                    type="submit" 
                                                    disabled={!newMsg.trim()}
                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: 'primary.main', color: '#fff' } }}
                                                >
                                                    <Send size={18} />
                                                </IconButton>
                                            ),
                                            sx: { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.5) }
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                                        This ticket has been resolved. Please open a new ticket if you have more questions.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
                            <MessageSquare size={64} style={{ marginBottom: 16 }} />
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>Select a Conversation</Typography>
                            <Typography variant="body2">Choose a ticket from the left to start chatting.</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

            {/* New Ticket Modal */}
            <Dialog 
                open={openModal} 
                onClose={() => setOpenModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 6, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Plus className="text-primary-main" /> Open New Support Ticket
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="SUBJECT / PROBLEM TITLE"
                            placeholder="e.g. Lead verification taking too long"
                            value={newTicket.subject}
                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                            InputProps={{ sx: { borderRadius: 3, fontWeight: 700 } }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="DETAILED MESSAGE"
                            placeholder="Please describe your issue in detail so we can help you better..."
                            value={newTicket.message}
                            onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleCreateTicket}
                        disabled={!newTicket.subject || !newTicket.message}
                        sx={{ borderRadius: 3, px: 4, fontWeight: 900 }}
                    >
                        Create Ticket
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HelpDesk;
