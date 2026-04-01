import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Card, CircularProgress, Alert, alpha, useTheme, 
    TextField, InputAdornment, Button, IconButton, Avatar,
    Divider, List, ListItem, ListItemAvatar, ListItemText, Badge,
    Paper, Chip, InputBase, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    LinearProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileArchive, Search, Send, X, Image as ImageIcon, FileText,
    Phone, Video, MoreVertical, Paperclip, SendHorizontal,
    Check, CheckCheck, Clock, User, Archive, Delete,
    Upload, Download, Eye, Lock, Unlock, ChevronDown, 
    Paperclip as Attach, MessageSquare, FolderOpen, File, RefreshCw,
    List as ListIcon, MessageSquare as ChatIcon
} from 'lucide-react';
import { zipService, lendingPartnerService } from '../services/api';
import { supabase } from '../services/supabase';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Outflow Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">Something went wrong</Typography>
                    <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Reload Page</Button>
                </Box>
            );
        }
        return this.props.children;
    }
}

const Outflow = () => {
    const theme = useTheme();
    const chatEndRef = useRef(null);
    
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [conversations, setConversations] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mobileView, setMobileView] = useState('list');
    const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'files'
    const [isRealtime, setIsRealtime] = useState(false);
    
    // Transaction details
    const [selectedTx, setSelectedTx] = useState(null);
    const [txDetails, setTxDetails] = useState(null);
    const [downloadingDoc, setDownloadingDoc] = useState(null);

    useEffect(() => {
        fetchPartners();
        const channel = setupRealtime();
        return () => { if (channel) supabase.removeChannel(channel); };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [selectedPartner, conversations]);

    const setupRealtime = () => {
        if (!supabase) return;
        return supabase
            .channel('outflow-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'zip_transactions' }, () => fetchPartners())
            .subscribe((status) => setIsRealtime(status === 'SUBSCRIBED'));
    };

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const data = await lendingPartnerService.getAll();
            setPartners(Array.isArray(data) ? data : []);
            
            const saved = localStorage.getItem('outflow_conversations');
            if (saved) setConversations(JSON.parse(saved));
        } catch (err) {
            console.error('Failed to fetch partners:', err);
            setError('Failed to load partners');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectPartner = (partner) => {
        setSelectedPartner(partner);
        setMobileView('chat');
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedPartner) return;
        
        const message = {
            id: Date.now(),
            sender: 'me',
            text: newMessage,
            timestamp: new Date().toISOString(),
            status: 'sent',
            type: 'text'
        };

        addMessageToConversation(selectedPartner.id, message);
        setNewMessage('');
    };

    const handleFileUpload = async (files) => {
        if (!selectedPartner || files.length === 0) return;
        
        setUploading(true);
        setUploadProgress(10);
        try {
            for (const file of files) {
                const messageId = Date.now() + Math.random();
                const message = {
                    id: messageId,
                    sender: 'me',
                    text: file.name,
                    timestamp: new Date().toISOString(),
                    status: 'uploading',
                    type: 'file',
                    file: file,
                    fileSize: file.size
                };
                
                addMessageToConversation(selectedPartner.id, message);
                
                const formData = new FormData();
                formData.append('file', file);
                formData.append('leadId', null);
                formData.append('direction', 'outgoing');
                formData.append('receiverPartnerId', selectedPartner.id);
                formData.append('receiverPartnerName', selectedPartner.name || selectedPartner.company_name || 'Partner');
                
                await zipService.upload(formData);
                setUploadProgress(100);
                updateMessageStatus(selectedPartner.id, messageId, 'sent');
            }
        } catch (uploadErr) {
            console.error('Upload failed:', uploadErr);
            setError('Upload failed: ' + uploadErr.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const updateMessageStatus = (partnerId, msgId, status) => {
        setConversations(prev => {
            const updated = { ...prev };
            const msgs = updated[partnerId] || [];
            const idx = msgs.findIndex(m => m.id === msgId);
            if (idx !== -1) {
                msgs[idx] = { ...msgs[idx], status };
                updated[partnerId] = msgs;
            }
            saveConversations(updated);
            return updated;
        });
    };

    const addMessageToConversation = (partnerId, message) => {
        setConversations(prev => {
            const updated = { ...prev };
            if (!updated[partnerId]) updated[partnerId] = [];
            updated[partnerId] = [...updated[partnerId], message];
            saveConversations(updated);
            return updated;
        });
    };

    const saveConversations = (data) => {
        localStorage.setItem('outflow_conversations', JSON.stringify(data));
    };

    const { getRootProps: getDropzoneProps, getInputProps: getDropzoneInputProps, isDragActive } = useDropzone({
        onDrop: handleFileUpload,
        noClick: true
    });

    const filteredPartners = partners.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bank_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentMessages = selectedPartner ? (conversations[selectedPartner.id] || []) : [];

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getLastMessage = (partnerId) => {
        const msgs = conversations[partnerId] || [];
        if (msgs.length === 0) return null;
        const last = msgs[msgs.length - 1];
        if (last.type === 'file') return '📎 ' + last.text;
        return last.text.substring(0, 30) + (last.text.length > 30 ? '...' : '');
    };

    const fetchTransactionDetails = async (tx) => {
        try {
            const details = await zipService.getTransaction(tx.id);
            setTxDetails(details);
            setSelectedTx(tx);
            setViewMode('files');
        } catch (err) {
            setError('Failed to load transaction details');
        }
    };

    const handleDownloadDocument = async (doc) => {
        try {
            setDownloadingDoc(doc.id);
            const response = await zipService.downloadDocument(doc.id);
            window.open(response.url, '_blank');
        } catch (err) {
            setError('Download failed: ' + err.message);
        } finally {
            setDownloadingDoc(null);
        }
    };

    const getFileIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf': return <FileArchive size={20} color="#ef4444" />;
            case 'jpg':
            case 'jpeg':
            case 'png': return <ImageIcon size={20} color="#22c55e" />;
            case 'doc':
            case 'docx': return <FileText size={20} color="#3b82f6" />;
            default: return <File size={20} color="#666" />;
        }
    };

    return (
        <ErrorBoundary>
            <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', bgcolor: '#f0f2f5' }}>
                {/* Left Sidebar - Partner List */}
                <Box sx={{ 
                    width: { xs: mobileView === 'list' ? '100%' : 0, md: 350 }, 
                    bgcolor: '#fff', 
                    borderRight: '1px solid #e0e0e0',
                    display: { xs: mobileView === 'list' ? 'flex' : 'none', md: 'flex' },
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight={800}>Credit Partners</Typography>
                            <Chip size="small" label={isRealtime ? 'Live' : 'Offline'} 
                                sx={{ bgcolor: isRealtime ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 700 }} />
                        </Box>
                        <Paper sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, bgcolor: '#fff', borderRadius: 3 }}>
                            <Search size={18} color="#666" />
                            <InputBase 
                                sx={{ ml: 1, flex: 1 }} 
                                placeholder="Search partners..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Paper>
                    </Box>

                    {/* Partner List */}
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : filteredPartners.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                            <User size={40} style={{ opacity: 0.3 }} />
                            <Typography variant="body2" sx={{ mt: 1 }}>No partners found</Typography>
                        </Box>
                    ) : (
                        filteredPartners.map(partner => (
                            <Box
                                key={partner.id}
                                onClick={() => handleSelectPartner(partner)}
                                sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    bgcolor: selectedPartner?.id === partner.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        badgeContent={<Box sx={{ width: 12, height: 12, bgcolor: '#22c55e', borderRadius: '50%', border: '2px solid #fff' }} />}
                                    >
                                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                            {partner.name?.charAt(0)?.toUpperCase() || 'P'}
                                        </Avatar>
                                    </Badge>
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                                            {partner.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {partner.bank_name || partner.email}
                                        </Typography>
                                        {getLastMessage(partner.id) && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }} noWrap>
                                                {getLastMessage(partner.id)}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {conversations[partner.id]?.length > 0 && formatTime(conversations[partner.id][conversations[partner.id].length - 1].timestamp)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>

            {/* Right Side - Chat Area */}
            <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: '#fff'
            }}>
                {selectedPartner ? (
                    <>
                        {/* Chat Header */}
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => setMobileView('list')} sx={{ display: { md: 'none' } }}>
                                <ChevronDown />
                            </IconButton>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={<Box sx={{ width: 10, height: 10, bgcolor: '#22c55e', borderRadius: '50%', border: '2px solid #f5f5f5' }} />}
                            >
                                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                    {selectedPartner.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </Badge>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    {selectedPartner.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {selectedPartner.bank_name || selectedPartner.email}
                                </Typography>
                            </Box>
                            {/* View Toggle */}
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" onClick={() => setViewMode('chat')}
                                    sx={{ bgcolor: viewMode === 'chat' ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}>
                                    <ChatIcon size={18} />
                                </IconButton>
                                <IconButton size="small" onClick={() => setViewMode('files')}
                                    sx={{ bgcolor: viewMode === 'files' ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}>
                                    <FolderOpen size={18} />
                                </IconButton>
                            </Box>
                            <IconButton><Phone size={20} /></IconButton>
                            <IconButton><MoreVertical size={20} /></IconButton>
                        </Box>

                        {/* Upload Progress */}
                        {uploading && (
                            <Box sx={{ p: 1, bgcolor: alpha('#3b82f6', 0.1), borderBottom: '1px solid #e0e0e0' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
                                    <Typography variant="caption" fontWeight={700}>Uploading...</Typography>
                                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                                    <Typography variant="caption">{uploadProgress}%</Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Chat View */}
                        {viewMode === 'chat' && (
                            <Box 
                                {...getDropzoneProps()} 
                                sx={{ 
                                    flex: 1, 
                                    overflow: 'auto', 
                                    p: 2, 
                                    bgcolor: '#f0f2f5',
                                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e0e0e0\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                                }}
                            >
                                <input {...getDropzoneInputProps()} />
                                
                                {isDragActive && (
                                    <Box sx={{ 
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                        bgcolor: alpha(theme.palette.primary.main, 0.9), 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        zIndex: 10
                                    }}>
                                        <Box sx={{ textAlign: 'center', color: '#fff' }}>
                                            <Upload size={60} />
                                            <Typography variant="h5" fontWeight={800}>Drop files to send</Typography>
                                        </Box>
                                    </Box>
                                )}

                                <AnimatePresence>
                                    {currentMessages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            style={{
                                                display: 'flex',
                                                justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                                                mb: 1
                                            }}
                                        >
                                            <Box sx={{ 
                                                maxWidth: '70%', 
                                                p: 2, 
                                                borderRadius: 3,
                                                bgcolor: msg.sender === 'me' ? theme.palette.primary.main : '#fff',
                                                color: msg.sender === 'me' ? '#fff' : '#000',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                position: 'relative'
                                            }}>
                                                {msg.type === 'file' ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: msg.sender === 'me' ? alpha('#fff', 0.2) : '#f5f5f5' }}>
                                                            <FileArchive size={24} color={msg.sender === 'me' ? '#fff' : theme.palette.primary.main} />
                                                        </Paper>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: msg.sender === 'me' ? '#fff' : 'inherit' }}>
                                                                {msg.text}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: msg.sender === 'me' ? alpha('#fff', 0.7) : '#666' }}>
                                                                {formatFileSize(msg.fileSize || 0)}
                                                            </Typography>
                                                        </Box>
                                                        {msg.status === 'sent' && (
                                                            <Check size={16} color={msg.sender === 'me' ? alpha('#fff', 0.7) : '#666'} />
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2">{msg.text}</Typography>
                                                )}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'flex-end',
                                                    gap: 0.5,
                                                    mt: 0.5 
                                                }}>
                                                    <Typography variant="caption" sx={{ color: msg.sender === 'me' ? alpha('#fff', 0.7) : '#999', fontSize: '0.65rem' }}>
                                                        {formatTime(msg.timestamp)}
                                                    </Typography>
                                                    {msg.sender === 'me' && (
                                                        msg.status === 'sent' ? <Check size={12} color={alpha('#fff', 0.7)} /> : 
                                                        msg.status === 'uploading' ? <Clock size={12} color={alpha('#fff', 0.7)} /> :
                                                        <CheckCheck size={12} color="#53bdeb" />
                                                    )}
                                                </Box>
                                            </Box>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={chatEndRef} />
                            </Box>
                        )}

                        {/* Files View */}
                        {viewMode === 'files' && (
                            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f0f2f5' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight={700}>Sent Files</Typography>
                                    <Button size="small" startIcon={<RefreshCw size={14} />} onClick={() => setSelectedTx(null)}>
                                        Refresh
                                    </Button>
                                </Box>
                                
                                {selectedTx ? (
                                    <Card sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>{selectedTx.zip_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {txDetails?.documents?.length || 0} files • {formatDate(selectedTx.created_at)}
                                                </Typography>
                                            </Box>
                                            <Button size="small" onClick={() => setSelectedTx(null)}>Close</Button>
                                        </Box>
                                        
                                        {txDetails?.documents?.length > 0 ? (
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
                                                {txDetails.documents.map((doc) => (
                                                    <Paper key={doc.id} sx={{ p: 1.5, textAlign: 'center', cursor: 'pointer',
                                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                                                        onClick={() => handleDownloadDocument(doc)}>
                                                        <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, mb: 1, display: 'flex', justifyContent: 'center' }}>
                                                            {getFileIcon(doc.file_type)}
                                                        </Box>
                                                        <Typography variant="caption" fontWeight={600} noWrap sx={{ display: 'block' }}>{doc.file_name}</Typography>
                                                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                            {downloadingDoc === doc.id ? (
                                                                <CircularProgress size={14} />
                                                            ) : (
                                                                <Download size={14} color="#3b82f6" />
                                                            )}
                                                            <Typography variant="caption" color="primary">Download</Typography>
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                                No documents in this transaction
                                            </Typography>
                                        )}
                                    </Card>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                        Select a transaction to view files
                                    </Typography>
                                )}

                                {/* Recent Transactions */}
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 2 }}>Recent Transactions</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {[1, 2, 3].map((i) => (
                                        <Card key={i} sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                                            onClick={() => {
                                                setSelectedTx({ id: `demo-${i}`, zip_name: `Package_${i}.zip`, created_at: new Date().toISOString() });
                                                setTxDetails({ documents: [] });
                                            }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                                    <FileArchive size={20} color={theme.palette.primary.main} />
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>Package_{i}.zip</Typography>
                                                    <Typography variant="caption" color="text.secondary">{i * 5} files • {formatDate(new Date())}</Typography>
                                                </Box>
                                                <Chip label="Sent" size="small" sx={{ fontSize: '0.65rem' }} />
                                            </Box>
                                        </Card>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Message Input */}
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton component="label">
                                <Paperclip size={24} />
                                <input 
                                    type="file" 
                                    hidden 
                                    multiple 
                                    onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                                />
                            </IconButton>
                            <IconButton component="label">
                                <ImageIcon size={24} />
                                <input 
                                    type="file" 
                                    hidden 
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                                />
                            </IconButton>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 4,
                                        bgcolor: '#fff'
                                    }
                                }}
                            />
                            <IconButton 
                                color="primary" 
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                sx={{ bgcolor: theme.palette.primary.main, color: '#fff', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.9) } }}
                            >
                                <SendHorizontal size={20} />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ flex: 1, display: { xs: mobileView === 'chat' ? 'none' : 'flex', md: 'flex' }, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', bgcolor: '#f0f2f5' }}>
                        <Box sx={{ 
                            width: 150, height: 150, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1), 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 3
                        }}>
                            <MessageSquare size={60} color={theme.palette.primary.main} />
                        </Box>
                        <Typography variant="h5" fontWeight={800} color="#333" gutterBottom>
                            WhatsApp-style File Transfer
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                            Select a Credit Partner from the left panel to start chatting and sharing files
                        </Typography>
                    </Box>
                )}
            </Box>
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', bottom: 20, left: 20, maxWidth: 400 }}>{error}</Alert>}
        </Box>
        </ErrorBoundary>
    );
};

export default Outflow;
