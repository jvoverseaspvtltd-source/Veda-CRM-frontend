import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Alert, alpha, useTheme, 
    TextField, Button, IconButton, Avatar, Paper, Chip, Badge, List, ListItem, InputBase
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileArchive, Search, Send, X, Image as ImageIcon, 
    MoreVertical, Paperclip, SendHorizontal, Clock, User, Archive, 
    Download, Eye, Lock, ChevronDown, MessageSquare, Check, File, FolderOpen,
    EyeOff, RefreshCw
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
    componentDidCatch(error, errorInfo) { console.error('PartnerInflow Error:', error, errorInfo); }
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

const PartnerInflow = () => {
    const theme = useTheme();
    const { partner } = usePartnerAuth();
    const chatEndRef = useRef(null);
    
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);
    const [txDetails, setTxDetails] = useState(null);
    const [viewMode, setViewMode] = useState('chat');
    const [isRealtime, setIsRealtime] = useState(false);
    const [downloadRequested, setDownloadRequested] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (partner?.id) {
            fetchTransactions();
            const channel = setupRealtime();
            return () => { if (channel) supabase.removeChannel(channel); };
        }
    }, [partner?.id]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedTx]);

    const setupRealtime = () => {
        if (!supabase) return;
        return supabase
            .channel('partner-inflow-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'zip_transactions' }, () => fetchTransactions())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'zip_documents' }, () => fetchTransactions())
            .subscribe((status) => setIsRealtime(status === 'SUBSCRIBED'));
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await zipService.getTransactionsByPartner(partner.id, 'incoming');
            setTransactions(response.transactions || []);
        } catch (err) {
            setError('Failed to load incoming files');
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

    const handleRequestDownload = async (txId) => {
        try {
            await zipService.requestDownload(txId);
            setDownloadRequested(prev => ({ ...prev, [txId]: true }));
            setError(null);
        } catch (err) {
            setError('Request failed');
        }
    };

    const handlePreview = async (doc) => {
        try {
            const response = await zipService.downloadDocument(doc.id);
            setPreviewUrl(response.url);
        } catch (err) {
            setError('Preview requires download approval. Please request access.');
        }
    };

    const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
                {/* Left Sidebar - Transaction List */}
                <Box sx={{ 
                    width: { xs: viewMode === 'list' ? '100%' : 0, md: 350 }, 
                    bgcolor: '#fff', borderRight: '1px solid #e0e0e0',
                    display: { xs: viewMode === 'list' ? 'flex' : 'none', md: 'flex' },
                    flexDirection: 'column', overflow: 'hidden'
                }}>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight={800}>Received from Veda</Typography>
                            <Chip size="small" label={isRealtime ? 'Live' : 'Offline'} 
                                sx={{ bgcolor: isRealtime ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 700 }} />
                        </Box>
                        <Paper sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, bgcolor: '#fff', borderRadius: 3 }}>
                            <Search size={18} color="#666" />
                            <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search..." />
                        </Paper>
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
                        ) : transactions.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                                <FolderOpen size={40} style={{ opacity: 0.3 }} />
                                <Typography variant="body2" sx={{ mt: 1 }}>No incoming files</Typography>
                            </Box>
                        ) : (
                            transactions.map((tx) => (
                                <Box key={tx.id} onClick={() => fetchTransactionDetails(tx)}
                                    sx={{ p: 2, cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                                        bgcolor: selectedTx?.id === tx.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: '#10b981' }}><Archive size={20} /></Avatar>
                                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                            <Typography variant="subtitle2" fontWeight={700} noWrap>{tx.zip_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                From: {tx.sender_name || 'Veda CRM'} • {tx.totalDocuments || 0} files
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" color="text.secondary">{formatDate(tx.created_at)}</Typography>
                                            <Chip label={tx.status || 'New'} size="small" sx={{ mt: 0.5, fontSize: '0.6rem', height: 18 }} />
                                        </Box>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>

                {/* Right Side - File View Area */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                    {selectedTx ? (
                        <>
                            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconButton onClick={() => setViewMode('list')} sx={{ display: { md: 'none' } }}><ChevronDown /></IconButton>
                                <Avatar sx={{ bgcolor: '#10b981' }}><Archive size={20} /></Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={700}>{selectedTx.zip_name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        From Veda CRM • {txDetails?.documents?.length || 0} files
                                    </Typography>
                                </Box>
                                <Chip label={selectedTx.status || 'New'} size="small" sx={{ fontWeight: 700 }} />
                            </Box>

                            {/* Info Banner */}
                            <Box sx={{ p: 2, bgcolor: alpha('#fef3c7', 0.5), borderBottom: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Lock size={20} color="#d97706" />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={700} color="#92400e">Files are encrypted</Typography>
                                    <Typography variant="caption" color="#92400e">View thumbnails or request download approval from Veda</Typography>
                                </Box>
                                {!downloadRequested[selectedTx.id] ? (
                                    <Button size="small" variant="contained" startIcon={<Download size={16} />}
                                        onClick={() => handleRequestDownload(selectedTx.id)}
                                        sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: alpha('#10b981', 0.9) } }}>
                                        Request Download
                                    </Button>
                                ) : (
                                    <Chip label="Request Sent" size="small" sx={{ bgcolor: '#f59e0b', color: '#fff', fontWeight: 700 }} />
                                )}
                            </Box>

                            {/* Files List */}
                            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                                {txDetails?.documents?.length > 0 ? (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                                        {txDetails.documents.map((doc) => (
                                            <Paper key={doc.id} sx={{ p: 2, textAlign: 'center', cursor: 'pointer',
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                                                onClick={() => handlePreview(doc)}>
                                                <Box sx={{ p: 2, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 2, mb: 1, display: 'flex', justifyContent: 'center' }}>
                                                    {getFileIcon(doc.file_type)}
                                                </Box>
                                                <Typography variant="caption" fontWeight={600} noWrap sx={{ display: 'block' }}>{doc.file_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{doc.file_type?.toUpperCase()}</Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip icon={<EyeOff size={12} />} label="Locked" size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center', color: '#666' }}>
                                        <FileArchive size={48} style={{ opacity: 0.3 }} />
                                        <Typography variant="body2" sx={{ mt: 1 }}>No documents in this transfer</Typography>
                                    </Box>
                                )}
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', bgcolor: '#f0f2f5' }}>
                            <Box sx={{ width: 150, height: 150, bgcolor: alpha('#10b981', 0.1), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <FolderOpen size={60} color="#10b981" />
                            </Box>
                            <Typography variant="h5" fontWeight={800} color="#333" gutterBottom>Incoming Files</Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                                Select a transaction from the left to view files received from Veda CRM
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Preview Modal */}
                {previewUrl && (
                    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                        <Box sx={{ bgcolor: '#fff', borderRadius: 2, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle1" fontWeight={700}>Preview</Typography>
                                <IconButton onClick={() => setPreviewUrl(null)}><X size={20} /></IconButton>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '70vh' }} />
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
            {error && <Alert severity="warning" onClose={() => setError(null)} sx={{ position: 'fixed', bottom: 20, left: 20, maxWidth: 400 }}>{error}</Alert>}
        </ErrorBoundary>
    );
};

export default PartnerInflow;
