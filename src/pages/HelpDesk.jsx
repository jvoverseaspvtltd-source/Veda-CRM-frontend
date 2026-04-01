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
    Stack,
    MenuItem,
    FormControlLabel,
    Switch,
    Tooltip
} from '@mui/material';
import {
    Send,
    Plus,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    LifeBuoy,
    Paperclip,
    Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { helpdeskService } from '../services/api';
import { supabase } from '../services/supabase';

// Helper for priority colors
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'Urgent': return 'error';
        case 'High': return 'warning';
        case 'Medium': return 'info';
        case 'Low': return 'success';
        default: return 'default';
    }
};

const HelpDesk = () => {
    const theme = useTheme();
    const { user } = useAuth();
    
    // State
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    
    // Filters & Search
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [assignedToMe, setAssignedToMe] = useState(false);
    
    // Modals & Forms
    const [openModal, setOpenModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'EMI Issue', priority: 'Medium' });
    const [newMsg, setNewMsg] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [attachments, setAttachments] = useState([]);

    const scrollRef = useRef(null);

    // Is current user a Resolver?
    const isResolver = user && ['Super Admin', 'Admin', 'Loan Manager'].includes(user.role);

    // Initial Load
    useEffect(() => {
        loadTickets();
    }, [filterStatus, assignedToMe]);

    // Handle Realtime Messages
    useEffect(() => {
        if (!selectedTicket) return;
        
        loadMessages(selectedTicket.id);
        
        // Subscribe to New Messages using Supabase Realtime
        const channel = supabase
            .channel(`public:helpdesk_messages:${selectedTicket.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'helpdesk_messages', filter: `ticket_id=eq.${selectedTicket.id}` },
                (payload) => {
                    // Update only if it's the current ticket and we don't already have it
                    setMessages(prev => {
                        const exists = prev.find(m => m.id === payload.new.id);
                        if (exists) return prev;
                        // Reload to get sender joins or simply append (we reload for simplicity and joined data)
                        loadMessages(selectedTicket.id, true);
                        return prev;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedTicket]);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (filterStatus !== 'All') filters.status = filterStatus;
            if (assignedToMe) filters.assignedToMe = true;

            const data = await helpdeskService.getTickets(filters);
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
            const data = await helpdeskService.getMessages(ticketId);
            setMessages(data);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            if (!isSilent) setMsgLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.title || !newTicket.description) return;
        
        // Handle file uploads logically here (omitted for brevity, assume URLs returned)
        const uploadedFiles = []; 

        try {
            const ticket = await helpdeskService.createTicket({
                ...newTicket,
                attachments: uploadedFiles
            });
            setOpenModal(false);
            setNewTicket({ title: '', description: '', category: 'EMI Issue', priority: 'Medium' });
            await loadTickets();
            setSelectedTicket(ticket);
        } catch (err) {
            console.error('Failed to create ticket:', err);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMsg.trim() || !selectedTicket) return;

        const content = newMsg;
        setNewMsg('');

        try {
            await helpdeskService.sendMessage(selectedTicket.id, {
                message: content,
                is_internal_note: isInternalNote
            });
            // Realtime listener handles UI update
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleUpdateTicket = async (updates) => {
        if (!selectedTicket) return;
        try {
            const updated = await helpdeskService.updateTicket(selectedTicket.id, updates);
            setSelectedTicket(updated);
            loadTickets();
        } catch (err) {
            console.error('Failed to update ticket:', err);
        }
    };

    // Filter by search text locally
    const filteredTickets = tickets.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Page Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LifeBuoy size={32} className="text-primary-main" /> Internal Help Desk
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {isResolver ? 'Manage, assign, and resolve staff escalated issues.' : 'Report operational issues and track resolutions.'}
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Plus size={18} />}
                    onClick={() => setOpenModal(true)}
                    sx={{ borderRadius: 3, px: 3, fontWeight: 800, boxShadow: t => `0 10px 20px ${alpha(t.palette.primary.main, 0.2)}` }}
                >
                    Create Ticket
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
                {/* Tickets Sidebar */}
                <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ height: '100%' }}>
                    <Paper sx={{ height: '100%', borderRadius: 6, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <TextField
                                fullWidth
                                placeholder="Search by ID or Title..."
                                size="small"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.5 }} />,
                                    sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }
                                }}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                                {['All', 'Open', 'In Progress', 'Resolved'].map((f) => (
                                    <Chip 
                                        key={f} 
                                        label={f} 
                                        size="small" 
                                        onClick={() => setFilterStatus(f)}
                                        sx={{ 
                                            fontWeight: 800, 
                                            fontSize: '0.7rem',
                                            bgcolor: filterStatus === f ? 'primary.main' : 'transparent',
                                            color: filterStatus === f ? '#fff' : 'text.secondary',
                                            border: '1px solid',
                                            borderColor: filterStatus === f ? 'primary.main' : 'divider'
                                        }} 
                                    />
                                ))}
                            </Stack>
                            {isResolver && (
                                <FormControlLabel
                                    control={<Switch size="small" checked={assignedToMe} onChange={(e) => setAssignedToMe(e.target.checked)} />}
                                    label={<Typography variant="caption" sx={{ fontWeight: 800 }}>Assigned To Me</Typography>}
                                    sx={{ mt: 1, ml: 0 }}
                                />
                            )}
                        </Box>

                        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
                            ) : filteredTickets.length > 0 ? (
                                filteredTickets.map((t) => (
                                    <ListItem 
                                        key={t.id} 
                                        button 
                                        onClick={() => setSelectedTicket(t)}
                                        selected={selectedTicket?.id === t.id}
                                        sx={{ 
                                            borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.5), py: 2,
                                            '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderRight: `4px solid ${theme.palette.primary.main}` }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: t.status === 'Open' ? alpha(theme.palette.error.main, 0.1) : 'divider', color: t.status === 'Open' ? 'error.main' : 'text.secondary' }}>
                                                {t.status === 'Resolved' ? <CheckCircle2 size={20} /> : <MessageSquare size={20} />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {t.title}
                                                </Typography>
                                            } 
                                            secondary={
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip label={t.priority} size="small" color={getPriorityColor(t.priority)} sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                            {new Date(t.created_at).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                                    <AlertCircle size={32} style={{ marginBottom: 8 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>No Tickets Found</Typography>
                                </Box>
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Main Chat Interface */}
                <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ height: '100%' }}>
                    {selectedTicket ? (
                        <Paper sx={{ height: '100%', borderRadius: 6, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {/* Ticket Info Header */}
                            <Box sx={{ p: 2, px: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.3) }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>{selectedTicket.title}</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip label={selectedTicket.status} size="small" color={selectedTicket.status === 'Open' ? 'success' : 'default'} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />
                                            <Chip label={selectedTicket.category} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>#{selectedTicket.id.split('-')[0].toUpperCase()}</Typography>
                                        </Stack>
                                    </Box>
                                    
                                    <Box sx={{ textAlign: 'right' }}>
                                        {selectedTicket.sla_deadline && (
                                            <Tooltip title="SLA Deadline">
                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: new Date() > new Date(selectedTicket.sla_deadline) ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.info.main, 0.1), color: new Date() > new Date(selectedTicket.sla_deadline) ? 'error.main' : 'info.dark', px: 2, py: 0.5, borderRadius: 2, mb: 1 }}>
                                                    <Clock size={14} />
                                                    <Typography variant="caption" sx={{ fontWeight: 900 }}>
                                                        SLA: {new Date(selectedTicket.sla_deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        )}
                                        <Box>
                                            {isResolver && selectedTicket.status !== 'Resolved' && (
                                                <Button size="small" variant="contained" color="success" onClick={() => handleUpdateTicket({ status: 'Resolved' })} sx={{ fontWeight: 800, borderRadius: 2 }}>
                                                    Mark Resolved
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', bgcolor: 'background.paper', p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', fontWeight: 500 }}>
                                    {selectedTicket.description}
                                </Typography>
                            </Box>

                            {/* Messages Container */}
                            <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, bgcolor: alpha(theme.palette.background.default, 0.2), display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {msgLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                                ) : (
                                    messages.map((m) => {
                                        const isMine = m.sender_id === user.id;
                                        const isInternal = m.is_internal_note;

                                        return (
                                            <Box key={m.id} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', mb: 1 }}>
                                                <Box sx={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                                    <Paper 
                                                        elevation={isInternal ? 2 : 0}
                                                        sx={{ 
                                                            p: 2, px: 2.5,
                                                            borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                                            bgcolor: isInternal ? '#fef08a' : (isMine ? 'primary.main' : 'background.paper'),
                                                            color: isInternal ? '#854d0e' : (isMine ? '#fff' : 'text.primary'),
                                                            border: '1px solid', borderColor: isInternal ? '#fef08a' : (isMine ? 'primary.main' : 'divider'),
                                                        }}
                                                    >
                                                        {isInternal && (
                                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 900, mb: 0.5, color: '#ca8a04' }}>
                                                                <Lock size={12} /> INTERNAL NOTE
                                                            </Typography>
                                                        )}
                                                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                                            {m.message}
                                                        </Typography>
                                                    </Paper>
                                                    
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem', mt: 0.5 }}>
                                                        {m.sender?.raw_user_meta_data?.first_name || 'Staff Member'} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })
                                )}
                            </Box>

                            {/* Chat Input */}
                            {(selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed') ? (
                                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                                    {isResolver && (
                                        <FormControlLabel
                                            control={<Switch checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} color="warning" size="small" />}
                                            label={<Typography variant="caption" sx={{ fontWeight: 800, color: isInternalNote ? 'warning.main' : 'text.secondary' }}>Post as Internal Note (Hidden from Reporter)</Typography>}
                                            sx={{ mb: 1, ml: 1 }}
                                        />
                                    )}
                                    <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Type your message..."
                                            value={newMsg}
                                            onChange={(e) => setNewMsg(e.target.value)}
                                            autoComplete="off"
                                            multiline
                                            maxRows={4}
                                            InputProps={{
                                                startAdornment: (
                                                    <IconButton size="small" sx={{ mr: 1 }}><Paperclip size={18} /></IconButton>
                                                ),
                                                sx: { borderRadius: 4, bgcolor: alpha(theme.palette.background.default, 0.5) }
                                            }}
                                        />
                                        <Button 
                                            type="submit" 
                                            variant="contained" 
                                            color={isInternalNote ? 'warning' : 'primary'}
                                            disabled={!newMsg.trim()}
                                            sx={{ borderRadius: 4, minWidth: '48px', px: 3, boxShadow: 'none' }}
                                        >
                                            <Send size={20} />
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                                        Ticket is closed. Reopen or create a new ticket to continue.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
                            <MessageSquare size={64} style={{ marginBottom: 16 }} />
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>Select a Ticket</Typography>
                            <Typography variant="body2">Choose a ticket from the sidebar to start resolving.</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

            {/* Create Ticket Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 6, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Plus className="text-primary-main" /> Create Support Ticket
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth label="Subject" required
                            value={newTicket.title} onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                            InputProps={{ sx: { borderRadius: 3, fontWeight: 700 } }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    select fullWidth label="Category" required
                                    value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                    InputProps={{ sx: { borderRadius: 3 } }}
                                >
                                    {['EMI Issue', 'Mobile App', 'Payment Gateway', 'Bank Partner', 'Data Sync', 'Others'].map(opt => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    select fullWidth label="Priority" required
                                    value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                    InputProps={{ sx: { borderRadius: 3 } }}
                                >
                                    {['Low', 'Medium', 'High', 'Urgent'].map(opt => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth multiline rows={4} label="Detailed Description" required
                            value={newTicket.description} onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        <Button variant="outlined" startIcon={<Paperclip size={18} />} sx={{ borderRadius: 3, borderStyle: 'dashed' }}>
                            Attach Files (Max 5)
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateTicket} disabled={!newTicket.title || !newTicket.description} sx={{ borderRadius: 3, px: 4, fontWeight: 900 }}>
                        Submit Ticket
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HelpDesk;
