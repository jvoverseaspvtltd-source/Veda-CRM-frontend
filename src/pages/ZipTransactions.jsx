import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    TextField,
    Avatar,
    Divider,
    CircularProgress,
    alpha,
    useTheme,
    Stack,
    Grid,
    Card,
    CardContent,
    InputAdornment,
    Tabs,
    Tab,
    Alert,
    Snackbar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    FormControlLabel,
    Checkbox,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    FileArchive,
    FileText,
    Image,
    FileSpreadsheet,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Send,
    MessageSquare,
    ChevronRight,
    ChevronDown,
    Upload,
    Search,
    RefreshCw,
    X,
    User,
    Building2,
    Phone,
    Mail,
    Check,
    AlertCircle,
    FolderOpen,
    Users,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { zipService } from '../services/api';

const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
        case 'pdf':
            return <FileText size={20} color="#ef4444" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <Image size={20} color="#3b82f6" />;
        case 'xls':
        case 'xlsx':
            return <FileSpreadsheet size={20} color="#22c55e" />;
        default:
            return <FileText size={20} color="#94a3b8" />;
    }
};

const StatusChip = ({ status }) => {
    const configs = {
        Pending: { color: 'warning', icon: <Clock size={12} />, bg: alpha('#f59e0b', 0.1) },
        Accepted: { color: 'success', icon: <CheckCircle size={12} />, bg: alpha('#22c55e', 0.1) },
        Rejected: { color: 'error', icon: <XCircle size={12} />, bg: alpha('#ef4444', 0.1) }
    };
    const config = configs[status] || configs.Pending;
    
    return (
        <Chip
            size="small"
            icon={config.icon}
            label={status}
            sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: config.bg,
                color: `${config.color}.main`
            }}
        />
    );
};

const DirectionChip = ({ direction }) => (
    <Chip
        size="small"
        label={direction === 'outgoing' ? 'Outgoing' : 'Incoming'}
        icon={direction === 'outgoing' ? <Send size={12} /> : <Download size={12} />}
        sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: direction === 'outgoing' ? alpha('#8b5cf6', 0.1) : alpha('#10b981', 0.1),
            color: direction === 'outgoing' ? '#7c3aed' : '#059669'
        }}
    />
);

const TransactionCard = ({ transaction, onClick }) => {
    const theme = useTheme();
    const studentCount = transaction.students?.length || 0;
    const totalDocs = transaction.students?.reduce((sum, s) => sum + (s.documents?.length || 0), 0) || 0;
    const pendingDocs = transaction.students?.reduce((sum, s) => sum + (s.pending_documents || 0), 0) || 0;
    const acceptedDocs = transaction.students?.reduce((sum, s) => sum + (s.accepted_documents || 0), 0) || 0;
    const rejectedDocs = transaction.students?.reduce((sum, s) => sum + (s.rejected_documents || 0), 0) || 0;

    return (
        <Card
            component={motion.div}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
            onClick={() => onClick(transaction)}
            sx={{
                cursor: 'pointer',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main' }
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                            <FileArchive size={20} />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                {transaction.zip_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <Users size={12} color="#94a3b8" />
                                <Typography variant="caption" color="text.secondary">
                                    {studentCount} student{studentCount !== 1 ? 's' : ''} • {totalDocs} docs
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <DirectionChip direction={transaction.direction} />
                        <StatusChip status={transaction.status} />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {transaction.sender_partner_name && (
                        <Chip size="small" icon={<Building2 size={12} />} 
                            label={transaction.direction === 'outgoing' ? `To: ${transaction.receiver_partner_name}` : `From: ${transaction.sender_partner_name}`} 
                            sx={{ fontSize: '0.65rem', height: 22 }} />
                    )}
                    {transaction.sender_name && (
                        <Chip size="small" icon={<User size={12} />} label={transaction.sender_name} sx={{ fontSize: '0.65rem', height: 22 }} />
                    )}
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 700 }}>
                            {pendingDocs} Pending
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                            {acceptedDocs} Accepted
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                            {rejectedDocs} Rejected
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.created_at).toLocaleDateString()}
                        </Typography>
                        <ChevronRight size={16} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const ZipViewer = ({ transactionId, open, onClose, onUpdate }) => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDocs, setSelectedDocs] = useState({});
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [bulkAction, setBulkAction] = useState('');
    const [bulkReason, setBulkReason] = useState('');

    useEffect(() => {
        if (open && transactionId) {
            loadTransaction();
        }
    }, [open, transactionId]);

    const loadTransaction = async () => {
        setLoading(true);
        try {
            const data = await zipService.getTransaction(transactionId);
            setTransaction(data);
            const msgs = await zipService.getMessages(transactionId);
            setMessages(msgs || []);
        } catch (err) {
            console.error('Load transaction error:', err);
            setSnackbar({ open: true, message: 'Failed to load transaction', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentAction = async (docId, action, reason = null) => {
        if (action === 'Rejected' && !reason) {
            setSnackbar({ open: true, message: 'Rejection reason is required', severity: 'error' });
            return;
        }
        try {
            await zipService.updateDocumentStatus(docId, {
                status: action,
                rejectionReason: reason
            });
            setSnackbar({ open: true, message: `Document ${action.toLowerCase()} successfully`, severity: 'success' });
            loadTransaction();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    };

    const handleBulkAction = async () => {
        if (bulkAction === 'Rejected' && !bulkReason) {
            setSnackbar({ open: true, message: 'Rejection reason is required', severity: 'error' });
            return;
        }
        const selectedIds = Object.entries(selectedDocs)
            .filter(([, v]) => v)
            .map(([k]) => k);
        
        if (selectedIds.length === 0) {
            setSnackbar({ open: true, message: 'Select at least one document', severity: 'error' });
            return;
        }

        try {
            await Promise.all(selectedIds.map(id => 
                zipService.updateDocumentStatus(id, {
                    status: bulkAction,
                    rejectionReason: bulkReason
                })
            ));
            setSnackbar({ open: true, message: `${selectedIds.length} documents ${bulkAction.toLowerCase()}`, severity: 'success' });
            setSelectedDocs({});
            setBulkAction('');
            setBulkReason('');
            loadTransaction();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setSendingMsg(true);
        try {
            await zipService.sendMessage(transactionId, newMessage);
            setNewMessage('');
            const msgs = await zipService.getMessages(transactionId);
            setMessages(msgs || []);
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setSendingMsg(false);
        }
    };

    const handleRequestDownload = async () => {
        try {
            await zipService.requestDownload(transactionId);
            setSnackbar({ open: true, message: 'Download request sent!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    };

    const toggleDocSelection = (docId) => {
        setSelectedDocs(prev => ({ ...prev, [docId]: !prev[docId] }));
    };

    const toggleStudentSelection = (student) => {
        const newSelected = {};
        student.documents?.forEach(d => {
            newSelected[d.id] = !Object.values(selectedDocs).every(v => v);
        });
        setSelectedDocs(prev => ({ ...prev, ...newSelected }));
    };

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        );
    }

    if (!transaction) return null;

    const totalDocs = transaction.students?.reduce((sum, s) => sum + (s.documents?.length || 0), 0) || 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
            PaperProps={{ sx: { borderRadius: 4, maxHeight: '90vh' } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 48, height: 48 }}>
                            <FileArchive size={24} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                {transaction.zip_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {transaction.students?.length || 0} students • {totalDocs} documents
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <DirectionChip direction={transaction.direction} />
                        <StatusChip status={transaction.status} />
                        <IconButton onClick={onClose} size="small">
                            <X size={18} />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>

            <Divider />

            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Students" icon={<Users size={16} />} iconPosition="start" />
                <Tab label="Chat" icon={<MessageSquare size={16} />} iconPosition="start" />
                <Tab label="Details" icon={<User size={16} />} iconPosition="start" />
            </Tabs>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                {tab === 0 && (
                    <Box sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
                        {transaction.students?.map((student) => (
                            <Accordion 
                                key={student.id} 
                                expanded={expandedStudent === student.id}
                                onChange={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                                sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}
                            >
                                <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, pr: 2 }}>
                                        <Checkbox
                                            size="small"
                                            checked={student.documents?.every(d => selectedDocs[d.id]) || false}
                                            indeterminate={student.documents?.some(d => selectedDocs[d.id]) && !student.documents?.every(d => selectedDocs[d.id])}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleStudentSelection(student);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <FolderOpen size={18} color={theme.palette.primary.main} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                {student.student_name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {student.application_id || 'No App ID'} • {student.documents?.length || 0} docs
                                            </Typography>
                                        </Box>
                                        <StatusChip status={student.status} />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ pt: 0 }}>
                                    <Stack spacing={1}>
                                        {student.documents?.map((doc) => (
                                            <Paper key={doc.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Checkbox
                                                        size="small"
                                                        checked={!!selectedDocs[doc.id]}
                                                        onChange={() => toggleDocSelection(doc.id)}
                                                    />
                                                    {getFileIcon(doc.file_type)}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {doc.file_name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {doc.file_type?.toUpperCase()} • {(doc.file_size / 1024).toFixed(1)} KB
                                                        </Typography>
                                                    </Box>
                                                    <StatusChip status={doc.status} />
                                                    {doc.status === 'Pending' && (
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            <Button size="small" color="success" onClick={() => handleDocumentAction(doc.id, 'Accepted')}>
                                                                <CheckCircle size={14} />
                                                            </Button>
                                                            <Button size="small" color="error" onClick={() => handleDocumentAction(doc.id, 'Rejected', prompt('Rejection reason:'))}>
                                                                <XCircle size={14} />
                                                            </Button>
                                                        </Box>
                                                    )}
                                                </Box>
                                                {doc.rejection_reason && (
                                                    <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>
                                                        <Typography variant="caption">{doc.rejection_reason}</Typography>
                                                    </Alert>
                                                )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}

                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                                BULK ACTIONS ({Object.values(selectedDocs).filter(Boolean).length} selected)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Action</InputLabel>
                                    <Select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} label="Action">
                                        <MenuItem value="Accepted">Accept All</MenuItem>
                                        <MenuItem value="Rejected">Reject All</MenuItem>
                                    </Select>
                                </FormControl>
                                {bulkAction === 'Rejected' && (
                                    <TextField
                                        size="small"
                                        placeholder="Rejection reason"
                                        value={bulkReason}
                                        onChange={(e) => setBulkReason(e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                )}
                                <Button variant="contained" onClick={handleBulkAction} disabled={!bulkAction}>
                                    Apply
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}

                {tab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: 400 }}>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                            {messages.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
                                    <MessageSquare size={40} />
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        No messages yet. Start the conversation!
                                    </Typography>
                                </Box>
                            ) : (
                                messages.map((msg, idx) => (
                                    <Box key={idx} sx={{ mb: 2, display: 'flex', justifyContent: msg.sender_type === 'CRM' ? 'flex-end' : 'flex-start' }}>
                                        <Box sx={{ maxWidth: '70%', p: 1.5, borderRadius: 2, bgcolor: msg.sender_type === 'CRM' ? 'primary.main' : 'grey.100', color: msg.sender_type === 'CRM' ? 'white' : 'text.primary' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                                                {msg.sender_name}
                                            </Typography>
                                            <Typography variant="body2">{msg.message}</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button variant="contained" onClick={handleSendMessage} disabled={sendingMsg || !newMessage.trim()}>
                                    <Send size={18} />
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}

                {tab === 2 && (
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            <Grid size={ 6 }>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TRANSACTION INFO</Typography>
                                <Paper sx={{ p: 2, mt: 1, borderRadius: 2 }}>
                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Direction</Typography>
                                            <DirectionChip direction={transaction.direction} />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Sender</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{transaction.sender_name}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Receiver</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{transaction.receiver_partner_name || '-'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Created</Typography>
                                            <Typography variant="body2">{new Date(transaction.created_at).toLocaleString()}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Status</Typography>
                                            <StatusChip status={transaction.status} />
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid size={ 6 }>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SUMMARY</Typography>
                                <Paper sx={{ p: 2, mt: 1, borderRadius: 2 }}>
                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Total Students</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{transaction.students?.length || 0}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Total Documents</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{totalDocs}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Pending</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                                {transaction.students?.reduce((sum, s) => sum + (s.pending_documents || 0), 0) || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Accepted</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                {transaction.students?.reduce((sum, s) => sum + (s.accepted_documents || 0), 0) || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="text.secondary">Rejected</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                                                {transaction.students?.reduce((sum, s) => sum + (s.rejected_documents || 0), 0) || 0}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>QUICK ACTIONS</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Button variant="outlined" startIcon={<Download size={16} />} onClick={handleRequestDownload}>
                                    Request Download
                                </Button>
                                <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={loadTransaction}>
                                    Refresh
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Dialog>
    );
};

// Main ZIP Transactions Page
const ZipTransactions = () => {
    const theme = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadData, setUploadData] = useState({
        direction: 'outgoing',
        receiverPartnerId: '',
        receiverPartnerName: ''
    });
    const [file, setFile] = useState(null);
    const [partners, setPartners] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadTransactions();
        loadPartners();
    }, [direction]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const params = {};
            if (direction !== 'all') params.direction = direction;
            
            const data = await zipService.getTransactions(params);
            setTransactions(data.transactions || []);
        } catch (err) {
            console.error('Load transactions error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadPartners = async () => {
        try {
            const data = await zipService.getPartners();
            setPartners(data || []);
        } catch (err) {
            console.error('Load partners error:', err);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.zip')) {
            setFile(selectedFile);
        } else {
            setSnackbar({ open: true, message: 'Please select a ZIP file', severity: 'error' });
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setSnackbar({ open: true, message: 'Please select a ZIP file', severity: 'error' });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('direction', uploadData.direction);
            formData.append('receiverPartnerId', uploadData.receiverPartnerId);
            formData.append('receiverPartnerName', uploadData.receiverPartnerName);

            await zipService.upload(formData);
            setSnackbar({ open: true, message: 'ZIP uploaded successfully!', severity: 'success' });
            setUploadOpen(false);
            setFile(null);
            setUploadData({ direction: 'outgoing', receiverPartnerId: '', receiverPartnerName: '' });
            loadTransactions();
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleViewTransaction = (transaction) => {
        setSelectedTransactionId(transaction.id);
        setViewerOpen(true);
    };

    const filteredTransactions = transactions.filter(t => 
        t.zip_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.receiver_partner_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                        ZIP Transactions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Manage document packets with student-wise folder structure
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Upload size={18} />}
                    onClick={() => setUploadOpen(true)}
                    sx={{ borderRadius: 3, px: 3, py: 1.2, fontWeight: 700 }}
                >
                    Upload ZIP
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Search by file name, sender, or receiver..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1, minWidth: 200 }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>
                    }}
                />
                <Tabs
                    value={direction}
                    onChange={(e, v) => setDirection(v)}
                    sx={{
                        bgcolor: alpha(theme.palette.divider, 0.06),
                        borderRadius: 2,
                        px: 1,
                        '& .MuiTab-root': { minHeight: 38, fontWeight: 700, fontSize: '0.8rem' }
                    }}
                >
                    <Tab label="All" value="all" />
                    <Tab label="Outgoing" value="outgoing" />
                    <Tab label="Incoming" value="incoming" />
                </Tabs>
                <Button
                    variant="outlined"
                    startIcon={<RefreshCw size={16} />}
                    onClick={loadTransactions}
                    sx={{ fontWeight: 700 }}
                >
                    Refresh
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                    <CircularProgress size={48} />
                </Box>
            ) : filteredTransactions.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: 'divider' }}>
                    <FileArchive size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>No transactions found</Typography>
                    <Typography variant="body2" color="text.secondary">Upload a ZIP file to get started</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredTransactions.map((tx) => (
                        <Grid size={ 12 } sm={6} lg={4} key={tx.id}>
                            <TransactionCard transaction={tx} onClick={handleViewTransaction} />
                        </Grid>
                    ))}
                </Grid>
            )}

            <ZipViewer
                transactionId={selectedTransactionId}
                open={viewerOpen}
                onClose={() => setViewerOpen(false)}
                onUpdate={loadTransactions}
            />

            <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Upload ZIP File</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            <Typography variant="body2">
                                ZIP should contain student-wise folders. Example: <code>Student_John_Doe_APP001/aadhar.pdf</code>
                            </Typography>
                        </Alert>

                        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02) } }} onClick={() => document.getElementById('zip-input').click()}>
                            <input id="zip-input" type="file" accept=".zip" onChange={handleFileChange} style={{ display: 'none' }} />
                            <FileArchive size={40} color={theme.palette.primary.main} />
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                                {file ? file.name : 'Click to select ZIP file'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Max size: 50MB
                            </Typography>
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel>Direction</InputLabel>
                            <Select
                                value={uploadData.direction}
                                onChange={(e) => setUploadData({ ...uploadData, direction: e.target.value })}
                                label="Direction"
                            >
                                <MenuItem value="outgoing">Outgoing (Send to Partner)</MenuItem>
                                <MenuItem value="incoming">Incoming (Receive from Partner)</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Partner</InputLabel>
                            <Select
                                value={uploadData.receiverPartnerId}
                                onChange={(e) => {
                                    const partner = partners.find(p => p.id === e.target.value);
                                    setUploadData({ ...uploadData, receiverPartnerId: e.target.value, receiverPartnerName: partner?.name || '' });
                                }}
                                label="Partner"
                            >
                                {partners.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.name} ({p.bank_name})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUploadOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpload} disabled={uploading || !file} sx={{ fontWeight: 700 }}>
                        {uploading ? <CircularProgress size={20} /> : 'Upload & Send'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ZipTransactions;
