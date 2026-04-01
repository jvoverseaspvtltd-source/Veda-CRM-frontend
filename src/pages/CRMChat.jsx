import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Alert, alpha, useTheme, 
    TextField, Button, IconButton, Avatar, Paper, Chip, LinearProgress,
    Menu, MenuItem
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { 
    FileArchive, Send, 
    Paperclip, SendHorizontal, Clock, 
    Download, Lock, ChevronDown, MessageSquare, Check,
    ArrowUp, ArrowDown, ArrowLeft, File, Folder, Image as ImageIcon, 
    Eye, Users, X, Trash2
} from 'lucide-react';
import { zipService, lendingPartnerService } from '../services/api';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const CRMChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();
    const chatEndRef = useRef(null);
    const channelRef = useRef(null);
    
    // Core State
    const [partners, setPartners] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isRealtime, setIsRealtime] = useState(false);
    const [viewMode, setViewMode] = useState('chat');
    const [selectedTx, setSelectedTx] = useState(null);
    const [txDetails, setTxDetails] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [downloadRequests, setDownloadRequests] = useState([]);
    const [attachAnchorEl, setAttachAnchorEl] = useState(null);

    // Derived State
    const selectedPartner = partners.find(p => p.id === id) || null;
    const selectedPartnerId = selectedPartner?.id || null;

    useEffect(() => {
        fetchAllData();
        channelRef.current = setupRealtime();
        return () => { 
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, []);

    useEffect(() => { 
        if (id && viewMode !== 'chat') {
            setViewMode('chat');
        }
    }, [id]);

    useEffect(() => { 
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
        }
    }, [messages]);

    const handleAttachClick = (event) => setAttachAnchorEl(event.currentTarget);
    const handleAttachClose = () => setAttachAnchorEl(null);

    const setupRealtime = () => {
        if (!supabase) {
            console.warn('[CRMChat] Supabase not configured, realtime disabled');
            return null;
        }
        try {
            const channel = supabase
                .channel('crm-chat-updates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'zip_transactions' }, () => {
                    fetchAllData();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'zip_download_requests' }, () => {
                    fetchDownloadRequests();
                })
                .subscribe((status, err) => {
                    if (err) {
                        console.warn('[CRMChat] Realtime subscription error:', err.message);
                        setIsRealtime(false);
                    } else {
                        setIsRealtime(status === 'SUBSCRIBED');
                    }
                });
            return channel;
        } catch (err) {
            console.warn('[CRMChat] Failed to setup realtime:', err.message);
            return null;
        }
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            // Fetch all transactions (both incoming and outgoing)
            const txResponse = await zipService.getTransactions();
            const txs = txResponse.transactions || [];
            setTransactions(txs);
            
            // Fetch partners
            const partnersData = await lendingPartnerService.getAll();
            setPartners(Array.isArray(partnersData) ? partnersData : []);
            
            // Convert transactions to messages
            const chatMsgs = txs.map(tx => ({
                id: tx.id,
                sender: tx.direction === 'outgoing' ? 'me' : 'them',
                type: 'file',
                text: tx.zip_name,
                timestamp: tx.created_at,
                status: 'sent',
                tx: tx,
                fileCount: tx.totalDocuments || 0,
                partnerName: tx.receiver_partner_name || tx.sender_name || 'Unknown',
                partnerId: tx.direction === 'incoming' ? tx.sender_id : tx.receiver_partner_id,
                isOutgoing: tx.direction === 'outgoing'
            }));
            
            // Deduplicate by transaction ID, sort oldest first (ASC)
            const uniqueMsgs = chatMsgs
                .filter((msg, idx, arr) => arr.findIndex(m => m.id === msg.id) === idx)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            setMessages(uniqueMsgs);
            
            // Fetch download requests
            await fetchDownloadRequests();
        } catch (err) {
            setError('Failed to load: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDownloadRequests = async () => {
        try {
            const response = await zipService.getDownloadRequests();
            setDownloadRequests(response.requests || []);
        } catch (err) {
            console.error('Failed to fetch download requests:', err);
        }
    };

    const handleDeleteFolder = async (txId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Delete this ZIP folder and all its files? This cannot be undone.')) return;
        try {
            await zipService.deleteTransaction(txId);
            fetchAllData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(10);

        try {
            const messageId = Date.now();
            const msg = {
                id: messageId,
                sender: 'me',
                type: 'file',
                text: file.name,
                timestamp: new Date().toISOString(),
                status: 'uploading'
            };
            setMessages(prev => [...prev, msg]);

            // Use selected partner
            const partner = partners.find(p => p.id === selectedPartnerId);
            if (!partner) {
                throw new Error('Please select a partner first');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('leadId', '');
            formData.append('direction', 'outgoing');
            formData.append('receiverPartnerId', partner.id);
            formData.append('receiverPartnerName', partner.name || partner.company_name || 'Partner');

            await zipService.upload(formData);
            setUploadProgress(100);
            
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'sent' } : m));
            fetchAllData();
        } catch (err) {
            setError('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [partners]);

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

    const handleApproveDownloadRequest = async (requestId) => {
        try {
            await zipService.approveDownloadRequest(requestId);
            fetchDownloadRequests();
            setError(null);
        } catch (err) {
            setError('Failed to approve');
        }
    };

    const handleRejectDownloadRequest = async (requestId) => {
        try {
            await zipService.rejectDownloadRequest(requestId, 'Rejected by Veda CRM');
            fetchDownloadRequests();
        } catch (err) {
            setError('Failed to reject');
        }
    };

    const handleDownloadDocument = async (doc) => {
        try {
            setDownloading(true);
            const response = await zipService.downloadDocument(doc.id);
            const link = document.createElement('a');
            link.href = response.url;
            link.download = doc.file_name;
            link.click();
        } catch (err) {
            setError(err.message);
            setUploading(false);
        }
    };

    const handlePreview = async (doc) => {
        try {
            setPreviewing(true);
            const blob = await zipService.streamDocument(doc.id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            setError('Preview failed: ' + err.message);
        } finally {
            setPreviewing(false);
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

    const pendingRequests = downloadRequests.filter(r => r.status === 'Pending');
    const incomingCount = transactions.filter(t => t.direction === 'incoming').length;
    const outgoingCount = transactions.filter(t => t.direction === 'outgoing').length;

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

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', bgcolor: '#f0f2f5' }}>
            {/* Left Sidebar - Transactions List */}
            <Box sx={{ 
                width: { xs: viewMode === 'list' ? '100%' : 0, md: 350 }, 
                bgcolor: '#fff', borderRight: '1px solid #e0e0e0',
                display: { xs: viewMode === 'list' ? 'flex' : 'none', md: 'flex' },
                flexDirection: 'column', overflow: 'hidden'
            }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight={800}>Chat</Typography>
                        <Chip size="small" label={isRealtime ? 'Live' : 'Offline'} 
                            sx={{ bgcolor: isRealtime ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 700 }} />
                    </Box>
                </Box>

                {/* Stats */}
                <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 2 }}>
                    <Chip icon={<ArrowDown size={14} />} label={`${incomingCount} Received`} size="small" sx={{ fontWeight: 700 }} />
                    <Chip icon={<ArrowUp size={14} />} label={`${outgoingCount} Sent`} size="small" sx={{ fontWeight: 700 }} />
                </Box>

                {/* Download Requests Alert */}
                {pendingRequests.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: '#fef3c7', borderBottom: '1px solid #fcd34d' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Lock size={16} color="#d97706" />
                            <Typography variant="caption" fontWeight={700} color="#92400e">
                                {pendingRequests.length} download request{pendingRequests.length > 1 ? 's' : ''} pending
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
                    ) : partners.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                            <Users size={40} style={{ opacity: 0.3 }} />
                            <Typography variant="body2" sx={{ mt: 1 }}>No Credit Partners found</Typography>
                        </Box>
                    ) : (
                        partners.map((partner) => (
                            <Box key={partner.id} onClick={() => {
                                    navigate(`/veda/chat/user/${partner.id}`);
                                }}
                                sx={{ p: 2, cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                                    bgcolor: selectedPartnerId === partner.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, fontSize: 16, fontWeight: 800 }}>
                                        {partner.company_name?.charAt(0) || partner.name?.charAt(0) || 'P'}
                                    </Avatar>
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                                            {partner.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                            {partner.partner_role} • {partner.bank_name}
                                        </Typography>
                                    </Box>
                                    {messages.filter(m => m.partnerId === partner.id).length > 0 && (
                                        <Chip 
                                            label={messages.filter(m => m.partnerId === partner.id).length} 
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

            {/* Right Side - Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                {/* Header */}
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    {id && (
                        <IconButton onClick={() => navigate('/veda/chat')} sx={{ color: 'text.secondary' }}>
                            <ArrowLeft size={20} />
                        </IconButton>
                    )}
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, fontSize: 16, fontWeight: 800 }}>
                        {selectedPartner?.name?.charAt(0) || 'P'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {selectedPartner ? selectedPartner.name : 'Veda CRM - Chat'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {selectedPartner ? (
                                `${selectedPartner.partner_role || 'Partner'} • ${selectedPartner.bank_name || 'Bank'} • ${selectedPartner.branch_name || 'Branch'}`
                            ) : (
                                'Secure Credit Partner Communication Hub'
                            )}
                        </Typography>
                    </Box>
                </Box>

                {/* Download Requests Section */}
                {viewMode === 'requests' && (
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Download Requests</Typography>
                        
                        {pendingRequests.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Lock size={40} color="#22c55e" style={{ marginBottom: 8 }} />
                                <Typography variant="body2" color="text.secondary">No pending requests</Typography>
                            </Paper>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {pendingRequests.map((request) => (
                                    <Paper key={request.id} sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#10b981' }}>
                                                <Users size={20} />
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    {request.requester_name || 'Partner'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Requested: {formatDate(request.created_at)}
                                                </Typography>
                                            </Box>
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                color="success"
                                                onClick={() => handleApproveDownloadRequest(request.id)}
                                            >
                                                Approve
                                            </Button>
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color="error"
                                                onClick={() => handleRejectDownloadRequest(request.id)}
                                            >
                                                Reject
                                            </Button>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}

                {/* Files View */}
                {viewMode === 'files' && selectedTx ? (
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>{selectedTx.zip_name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {txDetails?.documents?.length || 0} files • {formatDate(selectedTx.created_at)}
                                </Typography>
                            </Box>
                            <Button size="small" startIcon={<MessageSquare size={14} />} onClick={() => setViewMode('chat')}>
                                Back
                            </Button>
                        </Box>

                        {/* Documents Grid */}
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
                    <>
                        {/* Upload Progress */}
                        {uploading && (
                            <Box sx={{ p: 1, bgcolor: alpha('#6366f1', 0.1), borderBottom: '1px solid #e0e0e0' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
                                    <Typography variant="caption" fontWeight={700}>Uploading...</Typography>
                                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                                    <Typography variant="caption">{uploadProgress}%</Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Chat Area */}
                        <Box 
                            {...getDropzoneProps()} 
                            sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f0f2f5', position: 'relative', display: 'flex', flexDirection: 'column' }}
                        >
                            {loading && (
                                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                        Credit Partner Hub
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 4, lineHeight: 1.6 }}>
                                        Select a Credit Partner from the directory on the left to start exchanging files, 
                                        review ZIP packages, and manage direct communications.
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, p: 1, bgcolor: '#fff', borderRadius: 4, border: '1px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <Chip label="Admin Verified" size="small" sx={{ fontWeight: 700, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                                        <Chip label="Partner Direct" size="small" sx={{ fontWeight: 700, bgcolor: '#f3e5f5', color: '#7b1fa2' }} />
                                        <Chip label="Audit Ready" size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
                                    </Box>
                                </Box>
                            )}

                            {!loading && selectedPartnerId && messages.filter(m => m.partnerId === selectedPartnerId).length === 0 && (
                                <Box sx={{ p: 4, textAlign: 'center', mb: 4 }}>
                                    <Box sx={{ p: 3, borderRadius: '50%', bgcolor: alpha('#6366f1', 0.1), display: 'inline-block', mb: 2 }}>
                                        <Users size={48} color="#6366f1" />
                                    </Box>
                                    <Typography variant="h6" fontWeight={800} gutterBottom>No Exchanges Yet</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Send your first ZIP file to start the exchange with this partner.
                                    </Typography>
                                </Box>
                            )}

                            {selectedPartnerId && messages.filter(m => m.partnerId === selectedPartnerId).map((msg, idx, arr) => {
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
                                                {msg.sender === 'me' ? 'You' : (msg.partnerName || 'Partner')}
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
                    </>
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
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03), 0 0 0 1px rgba(99, 102, 241, 0.05)',
                        transition: 'all 0.3s ease',
                        '&:focus-within': {
                            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15), 0 0 0 2px rgba(99, 102, 241, 0.2)',
                            borderColor: '#6366f1'
                        }
                    }}>
                        <IconButton 
                            onClick={handleAttachClick}
                            sx={{ color: '#6366f1', '&:hover': { bgcolor: alpha('#6366f1', 0.05) } }}
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
                                            bgcolor: alpha('#6366f1', 0.08),
                                            color: '#6366f1',
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
                                <Box sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 1.5, mx: 1, my: 0.5, transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha('#6366f1', 0.08), color: '#6366f1', transform: 'translateX(4px)' } }}>
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
                                <Typography variant="caption" fontWeight={700} color="text.secondary">Real-time Encrypted</Typography>
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
                                bgcolor: '#6366f1', 
                                color: '#fff', 
                                borderRadius: '14px',
                                width: 36,
                                height: 36,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { 
                                    bgcolor: '#4f46e5',
                                    transform: 'scale(1.05) rotate(-5deg)',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
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

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', bottom: 20, left: 20, maxWidth: 400 }}>{error}</Alert>}
        </Box>
    );
};

export default CRMChat;
