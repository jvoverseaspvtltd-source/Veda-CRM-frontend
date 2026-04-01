import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, alpha, useTheme, 
    TextField, Button, IconButton, Avatar, Paper, Chip, LinearProgress,
    Menu, MenuItem
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { 
    FileArchive, Send, X as CloseIcon,
    Paperclip, SendHorizontal, Clock, 
    Download, Lock, ChevronDown, MessageSquare, Check,
    ArrowUp, ArrowDown, ArrowLeft, File, Folder, Image as ImageIcon, 
    Eye, ExternalLink, Users, Trash2
} from 'lucide-react';
import { zipService, profileService } from '../../services/api';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { supabase } from '../../services/supabase';
import FilePreviewModal from '../../components/FilePreviewModal';

const PartnerChat = ({ leadId }) => {
    const theme = useTheme();
    const { partner } = usePartnerAuth();
    const chatEndRef = useRef(null);
    const channelRef = useRef(null);
    
    const [activeTab, setActiveTab] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [attachAnchorEl, setAttachAnchorEl] = useState(null);
    
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isRealtime, setIsRealtime] = useState(false);
    const [viewMode, setViewMode] = useState('chat');
    const [selectedTx, setSelectedTx] = useState(null);
    const [txDetails, setTxDetails] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [zipDownloadRequested, setZipDownloadRequested] = useState({});
    const [employees, setEmployees] = useState([]);
    const [transactions, setTransactions] = useState([]);
    
    // Selection is derived from URL 'id'
    const selectedEmployee = employees.find(e => e.id === id) || null;
    const selectedEmployeeId = selectedEmployee?.id || null;

    useEffect(() => {
        if (partner?.id) {
            fetchAllTransactions();
            channelRef.current = setupRealtime();
            return () => { 
                if (channelRef.current) {
                    supabase.removeChannel(channelRef.current);
                    channelRef.current = null;
                }
            };
        }
    }, [partner?.id]);

    useEffect(() => { 
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
        }
    }, [messages]);

    const handleAttachClick = (event) => setAttachAnchorEl(event.currentTarget);
    const handleAttachClose = () => setAttachAnchorEl(null);

    useEffect(() => { 
        if (id && viewMode !== 'chat') {
            setViewMode('chat');
        }
    }, [id]);

    const setupRealtime = () => {
        if (!supabase) {
            console.warn('[PartnerChat] Supabase not configured, realtime disabled');
            return null;
        }
        try {
            const channel = supabase
                .channel('partner-chat-updates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'zip_transactions' }, () => {
                    fetchAllTransactions();
                })
                .subscribe((status, err) => {
                    if (err) {
                        console.warn('[PartnerChat] Realtime subscription error:', err.message);
                        setIsRealtime(false);
                    } else {
                        setIsRealtime(status === 'SUBSCRIBED');
                    }
                });
            return channel;
        } catch (err) {
            console.warn('[PartnerChat] Failed to setup realtime:', err.message);
            return null;
        }
    };

    const fetchAllTransactions = async () => {
        try {
            setLoading(true);
            const response = await zipService.getTransactionsByPartner(partner.id, 'all');
            const txs = response.transactions || [];
            setTransactions(txs);
            
            const chatMsgs = txs.map(tx => ({
                id: tx.id,
                sender: tx.sender_type === 'CRM' ? 'them' : 'me',
                senderId: tx.sender_id,
                receiverId: tx.receiver_id,
                type: 'file',
                text: tx.zip_name,
                timestamp: tx.created_at,
                status: 'sent',
                tx: tx,
                fileCount: tx.totalDocuments || 0,
                partnerName: tx.receiver_partner_name || tx.sender_name || 'Unknown'
            }));
            
            // Deduplicate by transaction ID
            const uniqueMsgs = chatMsgs.filter((msg, idx, arr) => 
                arr.findIndex(m => m.id === msg.id) === idx
            );
            
            setMessages(uniqueMsgs.reverse());
            
            // Fetch employees
            const employeesData = await profileService.getAllEmployees();
            setEmployees(Array.isArray(employeesData) ? employeesData : []);
        } catch (err) {
            setError('Failed to load: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFolder = async (txId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Delete this ZIP folder and all its files? This cannot be undone.')) return;
        try {
            await zipService.deleteTransaction(txId);
            fetchAllTransactions();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(10);

        const messageId = Date.now();
        try {
            const msg = {
                id: messageId,
                sender: 'me',
                type: 'file',
                text: file.name,
                timestamp: new Date().toISOString(),
                status: 'uploading'
            };
            setMessages(prev => [...prev, msg]);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('leadId', leadId || '');
            formData.append('direction', 'outgoing');
            formData.append('receiverPartnerId', '');
            formData.append('receiverPartnerName', 'Veda CRM');
            formData.append('receiverId', '');
            formData.append('receiverName', 'Veda CRM');

            const response = await zipService.upload(formData);
            setUploadProgress(100);
            
            // Refresh the list - realtime will also update
            fetchAllTransactions();
        } catch (err) {
            setError('Upload failed: ' + (err.response?.data?.error || err.message));
            // Remove the temporary message on error
            setMessages(prev => prev.filter(m => m.id !== messageId));
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [partner?.id, id]);

    const { getRootProps: getDropzoneProps, getInputProps: getDropzoneInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: { 'application/zip': ['.zip'] }
    });

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        
        const msg = {
            id: Date.now(),
            sender: 'me',
            type: 'text',
            text: newMessage,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
    };

    const openTransaction = async (tx) => {
        try {
            const details = await zipService.getTransaction(tx.id);
            setTxDetails(details);
            setSelectedTx(tx);
            setViewMode('files');
        } catch (err) {
            setError('Failed to load');
        }
    };

    const handlePreview = async (doc) => {
        try {
            setPreviewing(true);
            const ext = doc.file_name?.toLowerCase().split('.').pop();
            const isOfficeDoc = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext);

            let url;
            if (isOfficeDoc) {
                const response = await zipService.previewDocument(doc.id);
                url = response.url;
            } else {
                const blob = await zipService.streamDocument(doc.id);
                url = URL.createObjectURL(blob);
            }

            setPreviewData({
                url,
                name: doc.file_name,
                type: ext,
                isBlob: !isOfficeDoc
            });
            setPreviewOpen(true);
        } catch (err) {
            setError('Preview failed: ' + err.message);
        } finally {
            setPreviewing(false);
        }
    };

    const handleClosePreview = () => {
        if (previewData?.isBlob && previewData?.url) {
            URL.revokeObjectURL(previewData.url);
        }
        setPreviewOpen(false);
        setPreviewData(null);
    };

    const handleDownloadFile = async (doc) => {
        try {
            setDownloading(true);
            const response = await zipService.downloadDocument(doc.id);
            const link = document.createElement('a');
            link.href = response.url;
            link.download = doc.file_name;
            link.click();
        } catch (err) {
            setError('Download failed');
        } finally {
            setDownloading(false);
        }
    };

    const handleRequestZipDownload = async (txId) => {
        try {
            await zipService.requestDownload(txId);
            setZipDownloadRequested(prev => ({ ...prev, [txId]: true }));
        } catch (err) {
            setError('Request failed');
        }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };
    
    const formatDate = (ts) => {
        if (!ts) return '';
        return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isIncoming = (tx) => tx.receiver_partner_id === partner?.id || tx.sender_type === 'CRM';
    const incomingCount = transactions.filter(t => isIncoming(t)).length;
    const outgoingCount = transactions.length - incomingCount;

    const getFileIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf': return <FileArchive size={20} color="#ef4444" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return <ImageIcon size={20} color="#22c55e" />;
            case 'doc':
            case 'docx': return <File size={20} color="#3b82f6" />;
            default: return <File size={20} color="#666" />;
        }
    };

    if (!partner) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Please login first</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', bgcolor: '#f0f2f5' }}>
            <Box sx={{ 
                width: { xs: viewMode === 'list' ? '100%' : 0, md: 350 }, 
                bgcolor: '#fff', borderRight: '1px solid #e0e0e0',
                display: { xs: viewMode === 'list' ? 'flex' : 'none', md: 'flex' },
                flexDirection: 'column', overflow: 'hidden'
            }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight={800}>ZIP Files</Typography>
                        <Chip size="small" label={isRealtime ? 'Live' : 'Offline'} 
                            sx={{ bgcolor: isRealtime ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 700 }} />
                    </Box>
                </Box>

                <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 2 }}>
                    <Chip icon={<ArrowDown size={14} />} label={`${incomingCount} Received`} size="small" sx={{ fontWeight: 700 }} />
                    <Chip icon={<ArrowUp size={14} />} label={`${outgoingCount} Sent`} size="small" sx={{ fontWeight: 700 }} />
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
                    ) : employees.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                            <Users size={40} style={{ opacity: 0.3 }} />
                            <Typography variant="body2" sx={{ mt: 1 }}>No Veda Staff available</Typography>
                        </Box>
                    ) : (
                        employees.map((emp) => (
                            <Box key={emp.id} onClick={() => {
                                    navigate(`/partner/chat/user/${emp.id}`);
                                }}
                                sx={{ p: 2, cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                                    bgcolor: id === emp.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, fontSize: 16, fontWeight: 800 }}>
                                        {emp.full_name?.charAt(0) || 'V'}
                                    </Avatar>
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <Typography variant="subtitle2" fontWeight={700} noWrap>{emp.full_name}</Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                            {emp.role} • Veda CRM
                                        </Typography>
                                    </Box>
                                    {messages.filter(m => m.senderId === emp.id || m.receiverId === emp.id).length > 0 && (
                                        <Chip 
                                            label={messages.filter(m => m.senderId === emp.id || m.receiverId === emp.id).length} 
                                            size="small" 
                                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1) }} 
                                        />
                                    )}
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                {/* Header */}
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    {id && (
                        <IconButton onClick={() => navigate('/partner/chat')} sx={{ color: 'text.secondary' }}>
                            <ArrowLeft size={20} />
                        </IconButton>
                    )}
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, fontSize: 16, fontWeight: 800 }}>
                        {selectedEmployee?.full_name?.charAt(0) || 'V'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {selectedEmployee ? selectedEmployee.full_name : 'Veda CRM - Chat'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {selectedEmployee ? 'Active conversation with CRM Staff' : 'Secure Document Exchange Interface'}
                        </Typography>
                    </Box>
                </Box>

                {/* ZIP Contents View */}
                {viewMode === 'files' && selectedTx ? (
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        {/* Navigation Breadcrumb */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                            <Button 
                                onClick={() => setViewMode('chat')} 
                                startIcon={<ArrowLeft size={18} />}
                                sx={{ color: 'text.secondary', fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main } }}
                            >
                                Back to Exchange Timeline
                            </Button>
                        </Box>

                        {/* ZIP Info Card */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#6366f1', width: 56, height: 56 }}>
                                    <FileArchive size={28} />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={700}>{selectedTx.zip_name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {txDetails?.documents?.length || 0} files • {formatDate(selectedTx.created_at)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* View Notice */}
                            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, mb: 2 }}>
                                <Typography variant="body2" color="#166534">
                                    You can view all documents below. No permission needed for preview.
                                </Typography>
                            </Box>

                            {/* Download ZIP Request (Only for Incoming) */}
                            {isIncoming(selectedTx) && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#fff7ed', borderRadius: 2, border: '1px solid #fed7aa' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Lock size={20} color="#ea580c" />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={700} color="#9a3412">
                                                Download Full ZIP
                                            </Typography>
                                            <Typography variant="body2" color="#9a3412">
                                                Request permission to download the complete ZIP file
                                            </Typography>
                                        </Box>
                                        {zipDownloadRequested[selectedTx.id] ? (
                                            <Chip label="Request Sent" color="warning" size="small" />
                                        ) : (
                                            <Button 
                                                variant="contained" 
                                                size="small"
                                                startIcon={<Download size={16} />}
                                                onClick={() => handleRequestZipDownload(selectedTx.id)}
                                                sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' } }}
                                            >
                                                Request ZIP Download
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Paper>

                        {/* Documents Grid */}
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                            Documents - Click to View ({txDetails?.documents?.length || 0})
                        </Typography>

                        {txDetails?.documents?.length > 0 ? (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                                {txDetails.documents.map((doc) => (
                                    <Paper 
                                        key={doc.id} 
                                        sx={{ 
                                            p: 2, 
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s',
                                            '&:hover': { 
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                transform: 'translateY(-2px)',
                                                boxShadow: 3
                                            }
                                        }}
                                        onClick={() => handlePreview(doc)}
                                    >
                                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 1, display: 'flex', justifyContent: 'center' }}>
                                            {getFileIcon(doc.file_type)}
                                        </Box>
                                        <Typography variant="caption" fontWeight={600} noWrap sx={{ display: 'block' }}>
                                            {doc.file_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {doc.file_type?.toUpperCase()}
                                        </Typography>
                                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Chip 
                                                icon={<Eye size={12} />} 
                                                label="View" 
                                                size="small" 
                                                sx={{ fontSize: '0.65rem', height: 20 }}
                                            />
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No documents</Typography>
                        )}
                    </Box>
                ) : viewMode === 'chat' ? (
                    <Box 
                        {...getDropzoneProps()} 
                        sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f0f2f5', position: 'relative', display: 'flex', flexDirection: 'column' }}
                    >
                        <input {...getDropzoneInputProps()} />
                        
                        {isDragActive && (
                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                bgcolor: alpha('#6366f1', 0.9), display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', zIndex: 10 }}>
                                <Box sx={{ textAlign: 'center', color: '#fff' }}>
                                    <ArrowUp size={60} />
                                    <Typography variant="h5" fontWeight={800}>Drop ZIP to send</Typography>
                                </Box>
                            </Box>
                        )}

                        {loading && (
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                                <CircularProgress size={40} thickness={4} sx={{ color: theme.palette.primary.main }} />
                            </Box>
                        )}

                        {!loading && !id && (
                            <Box sx={{ 
                                p: 4, height: '100%', display: 'flex', flexDirection: 'column', 
                                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                                background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`
                            }}>
                                <Box sx={{ 
                                    p: 4, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    boxShadow: `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.2)}`
                                }}>
                                    <MessageSquare size={64} color={theme.palette.primary.main} />
                                </Box>
                                <Typography variant="h5" fontWeight={900} gutterBottom sx={{ color: 'text.primary', letterSpacing: -0.5 }}>
                                    Welcome to Veda Chat
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 4, lineHeight: 1.6 }}>
                                    Select an employee from the directory on the left to start exchanging ZIP files, 
                                    tracking documents, and communicating directly with our processing team.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, p: 1, bgcolor: '#fff', borderRadius: 4, border: '1px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <Chip label="Secure Channel" size="small" sx={{ fontWeight: 700, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                                    <Chip label="Direct Link" size="small" sx={{ fontWeight: 700, bgcolor: '#f3e5f5', color: '#7b1fa2' }} />
                                    <Chip label="ZIP Enabled" size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
                                </Box>
                            </Box>
                        )}

                        {!loading && id && messages.filter(m => m.senderId === id || m.receiverId === id).length === 0 && (
                            <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <Box sx={{ p: 3, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'inline-block', mb: 2 }}>
                                    <Folder size={48} color={theme.palette.primary.main} />
                                </Box>
                                <Typography variant="h6" fontWeight={800} gutterBottom>No Exchanges Yet</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Send your first ZIP file to start the conversation with this employee.
                                </Typography>
                            </Box>
                        )}

                        {id && messages.filter(m => m.senderId === id || m.receiverId === id).map((msg, idx, arr) => {
                            // Date separator logic
                            const msgDate = new Date(msg.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                            const prevDate = idx > 0 ? new Date(arr[idx-1].timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
                            const showDateSep = msgDate !== prevDate;
                            return (
                                <Box key={msg.id}>
                                    {showDateSep && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2, gap: 1 }}>
                                            <Box sx={{ flex: 1, height: '1px', bgcolor: '#e0e0e0' }} />
                                            <Typography variant="caption" sx={{ px: 1.5, py: 0.5, bgcolor: '#e8eaed', borderRadius: 10, color: '#666', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                {msgDate}
                                            </Typography>
                                            <Box sx={{ flex: 1, height: '1px', bgcolor: '#e0e0e0' }} />
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start', mb: 1.5 }}>
                                        {/* Sender label */}
                                        <Typography variant="caption" sx={{ px: 0.5, mb: 0.3, fontWeight: 600, color: msg.sender === 'me' ? '#6366f1' : '#555', fontSize: '0.7rem' }}>
                                            {msg.sender === 'me' ? 'You' : (msg.partnerName || 'Veda CRM')}
                                        </Typography>
                                        <Box sx={{ 
                                            maxWidth: '70%', p: 2, 
                                            borderRadius: msg.sender === 'me' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                                            background: msg.sender === 'me' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#fff',
                                            color: msg.sender === 'me' ? '#fff' : '#1f2937',
                                            boxShadow: msg.sender === 'me' ? '0 10px 20px -5px rgba(99, 102, 241, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)',
                                            cursor: 'pointer',
                                            border: msg.sender === 'me' ? 'none' : '1px solid #e5e7eb',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::after': msg.sender === 'me' ? {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                background: 'linear-gradient(rgba(255,255,255,0.1), transparent)',
                                                pointerEvents: 'none'
                                            } : {}
                                        }}
                                        onClick={() => msg.tx && openTransaction(msg.tx)}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: msg.sender === 'me' ? alpha('#fff', 0.2) : '#f5f5f5' }}>
                                                    <FileArchive size={24} color={msg.sender === 'me' ? '#fff' : '#6366f1'} />
                                                </Paper>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={600} sx={{ color: msg.sender === 'me' ? '#fff' : 'inherit' }}>
                                                        {msg.text}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: msg.sender === 'me' ? alpha('#fff', 0.7) : '#666' }}>
                                                        {msg.fileCount} files • Click to open
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                                                <Typography variant="caption" sx={{ color: msg.sender === 'me' ? alpha('#fff', 0.7) : '#999', fontSize: '0.65rem' }}>
                                                    {formatTime(msg.timestamp)}
                                                </Typography>
                                                {msg.sender === 'me' && (
                                                    msg.status === 'uploading' ? <Clock size={12} color={alpha('#fff', 0.7)} /> : 
                                                    <Check size={12} color={alpha('#fff', 0.7)} />
                                                )}
                                                {msg.sender === 'me' && msg.tx && (
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={(e) => handleDeleteFolder(msg.tx.id, e)}
                                                        sx={{ p: 0.25, color: msg.sender === 'me' ? alpha('#fff', 0.7) : '#999', '&:hover': { color: 'error.main' } }}
                                                    >
                                                        <Trash2 size={12} />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </Box>
                ) : null}

                {/* Futuristic Message Input Pod */}
                {id && (
                <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255, 255, 255, 0.7)', 
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(224, 224, 224, 0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    position: 'relative',
                    zIndex: 2
                }}>
                    <Box sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        bgcolor: '#fff', 
                        borderRadius: '24px', 
                        px: 1.5, 
                        py: 0.5,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03), 0 0 0 1px rgba(99, 102, 241, 0.05)',
                        transition: 'all 0.3s ease',
                        '&:focus-within': {
                            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}, 0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderColor: theme.palette.primary.main
                        }
                    }}>
                        <IconButton 
                            onClick={handleAttachClick}
                            sx={{ color: theme.palette.primary.main, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                        >
                            <Paperclip size={20} />
                        </IconButton>

                        <Menu
                            anchorEl={attachAnchorEl}
                            open={Boolean(attachAnchorEl)}
                            onClose={handleAttachClose}
                            PaperProps={{
                                sx: {
                                    mt: -1.5,
                                    borderRadius: 3,
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    minWidth: 180,
                                    '& .MuiMenuItem-root': {
                                        borderRadius: 1.5,
                                        mx: 1,
                                        my: 0.5,
                                        display: 'flex',
                                        gap: 1.5,
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            color: theme.palette.primary.main,
                                            transform: 'translateX(4px)'
                                        }
                                    }
                                }
                            }}
                            transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                            anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                        >
                            <Box sx={{ p: 1.5, borderBottom: '1px solid #f0f0f0', mb: 0.5 }}>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Actions
                                </Typography>
                            </Box>
                            <label style={{ cursor: 'pointer', display: 'block' }}>
                                <input type="file" hidden multiple onChange={(e) => {
                                    if (e.target.files[0]) {
                                        onDrop(Array.from(e.target.files));
                                        handleAttachClose();
                                    }
                                }} />
                                <Box sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 1.5, mx: 1, my: 0.5, transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, transform: 'translateX(4px)' } }}>
                                    <FileArchive size={18} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Send ZIP File</Typography>
                                </Box>
                            </label>
                            <label style={{ cursor: 'pointer', display: 'block' }}>
                                <input type="file" hidden accept="image/*" multiple onChange={(e) => {
                                    if (e.target.files[0]) {
                                        onDrop(Array.from(e.target.files));
                                        handleAttachClose();
                                    }
                                }} />
                                <Box sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 1.5, mx: 1, my: 0.5, transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha('#10b981', 0.08), color: '#10b981', transform: 'translateX(4px)' } }}>
                                    <ImageIcon size={18} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Send Image</Typography>
                                </Box>
                            </label>
                            <label style={{ cursor: 'pointer', display: 'block' }}>
                                <input type="file" hidden accept=".pdf,.doc,.docx" multiple onChange={(e) => {
                                    if (e.target.files[0]) {
                                        onDrop(Array.from(e.target.files));
                                        handleAttachClose();
                                    }
                                }} />
                                <Box sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 1.5, mx: 1, my: 0.5, transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha('#EF4444', 0.08), color: '#EF4444', transform: 'translateX(4px)' } }}>
                                    <File size={18} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Send Document</Typography>
                                </Box>
                            </label>
                            <Box sx={{ p: 1.5, borderTop: '1px solid #f0f0f0', mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary">Real-time Connected</Typography>
                            </Box>
                        </Menu>

                        <TextField 
                            fullWidth 
                            variant="standard"
                            placeholder="Type a message or drop a ZIP file here..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            InputProps={{ disableUnderline: true, sx: { fontSize: '0.9rem', py: 1 } }}
                        />
                        <IconButton 
                            onClick={handleSendMessage} 
                            disabled={!newMessage.trim()}
                            sx={{ 
                                bgcolor: theme.palette.primary.main, 
                                color: '#fff', 
                                borderRadius: '14px',
                                width: 36,
                                height: 36,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { 
                                    bgcolor: alpha(theme.palette.primary.main, 0.9),
                                    transform: 'scale(1.05) rotate(-5deg)',
                                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`
                                },
                                '&.Mui-disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' }
                            }}
                        >
                            <SendHorizontal size={18} />
                        </IconButton>
                    </Box>
                </Box>
                )}
            </Box>

            {/* Preview Modal */}
            <FilePreviewModal
                open={previewOpen}
                onClose={handleClosePreview}
                fileUrl={previewData?.url}
                fileName={previewData?.name}
                fileType={previewData?.type}
                onDownload={null} // Strictly View Only
            />
            
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', bottom: 20, left: 20, maxWidth: 400 }}>{error}</Alert>}
        </Box>
    );
};

export default PartnerChat;
