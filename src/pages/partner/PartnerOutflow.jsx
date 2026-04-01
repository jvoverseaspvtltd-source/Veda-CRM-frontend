import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Alert, alpha, useTheme, 
    TextField, Button, IconButton, Avatar, Paper, Chip, Badge,
    LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileArchive, Search, Send, X, Image as ImageIcon, FileText,
    MoreVertical, Paperclip, SendHorizontal, Clock, User, Archive, 
    Download, Eye, Lock, Unlock, ChevronDown, MessageSquare, Check, CheckCheck,
    FolderOpen, File, ArrowUp
} from 'lucide-react';
import { zipService } from '../../services/api';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { supabase } from '../../services/supabase';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error('PartnerOutflow Error:', error, errorInfo); }
    render() {
        if (this.state.hasError) return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">Something went wrong</Typography>
                <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Reload</Button>
            </Box>
        );
        return this.props.children;
    }
}

const PartnerOutflow = () => {
    const theme = useTheme();
    const { partner } = usePartnerAuth();
    const chatEndRef = useRef(null);
    
    const [conversations, setConversations] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);
    const [txDetails, setTxDetails] = useState(null);
    const [isRealtime, setIsRealtime] = useState(false);
    const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'list'

    useEffect(() => {
        if (partner?.id) {
            fetchTransactions();
            const channel = setupRealtime();
            return () => { if (channel) supabase.removeChannel(channel); };
        }
    }, [partner?.id]);

    const setupRealtime = () => {
        if (!supabase) return;
        return supabase
            .channel('partner-outflow-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'zip_transactions' }, () => fetchTransactions())
            .subscribe((status) => setIsRealtime(status === 'SUBSCRIBED'));
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await zipService.getTransactionsByPartner(partner.id, 'outgoing');
            const txs = response.transactions || [];
            
            // Group by CRM conversation
            const grouped = {};
            txs.forEach(tx => {
                const key = 'Veda CRM';
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(tx);
            });
            
            setConversations(grouped);
        } catch (err) {
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionDetails = async (tx) => {
        try {
            const details = await zipService.getTransaction(tx.id);
            setTxDetails(details);
            setSelectedTx(tx);
        } catch (err) {
            setError('Failed to load details');
        }
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversations]);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(10);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('leadId', null);
            formData.append('direction', 'outgoing');
            formData.append('receiverPartnerId', null);
            formData.append('receiverPartnerName', 'Veda CRM');

            await zipService.upload(formData);
            setUploadProgress(100);
            setTimeout(() => { setUploading(false); setUploadProgress(0); fetchTransactions(); }, 1000);
        } catch (err) {
            setError('Upload failed: ' + err.message);
            setUploading(false);
        }
    }, [partner.id]);

    const { getRootProps: getDropzoneProps, getInputProps: getDropzoneInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: { 'application/zip': ['.zip'] }
    });

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const msg = {
            id: Date.now(), sender: 'me', text: newMessage,
            timestamp: new Date().toISOString(), status: 'sent', type: 'text'
        };
        addMessageToConversation('Veda CRM', msg);
        setNewMessage('');
    };

    const addMessageToConversation = (key, msg) => {
        setConversations(prev => {
            const updated = { ...prev };
            if (!updated[key]) updated[key] = [];
            updated[key] = [...updated[key], msg];
            localStorage.setItem('partner_outflow_conversations', JSON.stringify(updated));
            return updated;
        });
    };

    const currentMessages = conversations['Veda CRM'] || [];

    const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <ErrorBoundary>
            <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', bgcolor: '#f0f2f5' }}>
                {/* Left Sidebar - Transaction List */}
                <Box sx={{ 
                    width: { xs: viewMode === 'list' ? '100%' : 0, md: 350 }, 
                    bgcolor: '#fff', borderRight: '1px solid #e0e0e0',
                    display: { xs: viewMode === 'list' ? 'flex' : 'none', md: 'flex' },
                    flexDirection: 'column', overflow: 'hidden'
                }}>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight={800}>Sent to Veda</Typography>
                            <Chip size="small" label={isRealtime ? 'Live' : 'Offline'} 
                                sx={{ bgcolor: isRealtime ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 700 }} />
                        </Box>
                        <Paper sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, bgcolor: '#fff', borderRadius: 3 }}>
                            <Search size={18} color="#666" />
                            <TextField 
                                sx={{ ml: 1, flex: 1 }} variant="standard" disableUnderline
                                placeholder="Search transactions..." 
                            />
                        </Paper>
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
                        ) : Object.keys(conversations).length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                                <Archive size={40} style={{ opacity: 0.3 }} />
                                <Typography variant="body2" sx={{ mt: 1 }}>No sent transactions</Typography>
                            </Box>
                        ) : (
                            Object.entries(conversations).map(([key, msgs]) => (
                                <Box key={key} onClick={() => { setSelectedTx(msgs[0]); setViewMode('chat'); }}
                                    sx={{ p: 2, cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: '#6366f1' }}><Archive size={20} /></Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>{key}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {msgs.length} transaction{msgs.length !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>

                {/* Right Side - Chat/Upload Area */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => setViewMode('list')} sx={{ display: { md: 'none' } }}><ChevronDown /></IconButton>
                        <Avatar sx={{ bgcolor: '#6366f1' }}><Archive size={20} /></Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700}>Send to Veda CRM</Typography>
                            <Typography variant="caption" color="text.secondary">Upload ZIP files for review</Typography>
                        </Box>
                        <Chip label={uploading ? 'Uploading...' : 'Ready'} size="small" 
                            sx={{ bgcolor: uploading ? '#f59e0b' : '#22c55e', color: '#fff', fontWeight: 700 }} />
                    </Box>

                    {/* Upload Zone */}
                    <Box 
                        {...getDropzoneProps()} 
                        sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f0f2f5',
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e0e0e0\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
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

                        {uploading && (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                                <Typography variant="body2" fontWeight={700}>Uploading... {uploadProgress}%</Typography>
                            </Box>
                        )}

                        {!uploading && (
                            <Box sx={{ p: 6, textAlign: 'center', border: '2px dashed', borderColor: '#d0d0d0', borderRadius: 4, bgcolor: '#fff' }}>
                                <Box sx={{ p: 3, borderRadius: '50%', bgcolor: alpha('#6366f1', 0.1), display: 'inline-block', mb: 2 }}>
                                    <ArrowUp size={48} color="#6366f1" />
                                </Box>
                                <Typography variant="h6" fontWeight={800}>Drop ZIP file here</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Files will be sent to Veda CRM for review
                                </Typography>
                            </Box>
                        )}

                        <AnimatePresence>
                            {currentMessages.map((msg) => (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                    <Box sx={{ maxWidth: '70%', p: 2, borderRadius: 3, bgcolor: '#6366f1', color: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                        <Typography variant="body2">{msg.text}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                                            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>{formatTime(msg.timestamp)}</Typography>
                                            {msg.status === 'sent' && <Check size={12} />}
                                        </Box>
                                    </Box>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={chatEndRef} />
                    </Box>

                    {/* Message Input */}
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton component="label">
                            <Paperclip size={24} />
                            <input type="file" hidden multiple onChange={(e) => {
                                if (e.target.files[0]) onDrop(Array.from(e.target.files));
                            }} />
                        </IconButton>
                        <TextField fullWidth size="small" placeholder="Type a message..." value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#fff' } }} />
                        <IconButton color="primary" onClick={handleSendMessage} disabled={!newMessage.trim()}
                            sx={{ bgcolor: '#6366f1', color: '#fff', '&:hover': { bgcolor: alpha('#6366f1', 0.9) } }}>
                            <SendHorizontal size={20} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Transaction Details Drawer */}
                {selectedTx && (
                    <Box sx={{ width: 350, bgcolor: '#fff', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" fontWeight={700}>Transaction Details</Typography>
                            <IconButton size="small" onClick={() => setSelectedTx(null)}><X size={18} /></IconButton>
                        </Box>
                        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                            <Typography variant="caption" color="text.secondary">ID</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 2, wordBreak: 'break-all' }}>{selectedTx.id}</Typography>
                            
                            <Typography variant="caption" color="text.secondary">File</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>{selectedTx.zip_name}</Typography>
                            
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Chip label={selectedTx.status || 'Pending'} size="small" sx={{ mb: 2, fontWeight: 700 }} />
                            
                            <Typography variant="caption" color="text.secondary">Documents</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>{selectedTx.totalDocuments || 0} files</Typography>
                        </Box>
                    </Box>
                )}
            </Box>
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', bottom: 20, left: 20 }}>{error}</Alert>}
        </ErrorBoundary>
    );
};

export default PartnerOutflow;
