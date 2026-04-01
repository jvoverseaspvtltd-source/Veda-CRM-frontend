import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    IconButton,
    Chip,
    CircularProgress,
    Stack,
    Tooltip,
    alpha,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Tabs,
    Tab,
    Avatar,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    FileText,
    Download,
    Eye,
    Trash2,
    UploadCloud,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    X,
    Send,
    Building2,
    User,
    FileArchive,
    ShieldCheck,
    MessageSquareDiff,
    ChevronRight,
    ArrowLeft,
    Folder
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { zipService, lendingPartnerService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import FilePreviewModal from './FilePreviewModal';

const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const colors = { pdf: '#ef4444', doc: '#3b82f6', docx: '#3b82f6', xls: '#22c55e', xlsx: '#22c55e', png: '#f59e0b', jpg: '#f59e0b', jpeg: '#f59e0b', zip: '#8b5cf6' };
    return <FileText size={18} color={colors[ext] || '#94a3b8'} />;
};

const StatusBadge = ({ status }) => {
    const configs = {
        Active:    { color: '#22c55e', bg: '#dcfce7', icon: <CheckCircle2 size={11} /> },
        Replaced:  { color: '#94a3b8', bg: '#f1f5f9', icon: <RefreshCw size={11} /> },
        Pending:   { color: '#f59e0b', bg: '#fef3c7', icon: <Clock size={11} /> },
        Rejected:  { color: '#ef4444', bg: '#fee2e2', icon: <AlertCircle size={11} /> },
    };
    const cfg = configs[status] || configs.Pending;
    return (
        <Chip
            size="small"
            icon={cfg.icon}
            label={status}
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: cfg.bg, color: cfg.color, '& .MuiChip-icon': { color: cfg.color } }}
        />
    );
};

const CaseExchangeTab = ({ leadId }) => {
    const theme = useTheme();
    const { profile, user } = useAuth();
    const isCRM = user?.role !== 'Partner';
    const bottomRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [partners, setPartners] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [filterTab, setFilterTab] = useState('all');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    
    // ZIP folder navigation
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await zipService.getForCase(leadId);
            setTransactions(data.transactions || []);
            if (isCRM) {
                const partnerData = await lendingPartnerService.getAll();
                setPartners(partnerData);
            }
        } catch (err) {
            console.error('Failed to fetch case exchange data', err);
        } finally {
            setLoading(false);
        }
    }, [leadId, isCRM]);

    useEffect(() => { 
        fetchData(); 
        // Reset view when leadId changes
        setSelectedTx(null);
    }, [fetchData, leadId]);

    useEffect(() => {
        if (!loading && !selectedTx) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [loading, transactions.length, selectedTx]);

    const handleUpload = async () => {
        if (!file || (isCRM && !selectedPartner)) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('leadId', leadId);
            formData.append('direction', 'outgoing');
            if (isCRM) {
                const partner = partners.find(p => p.id === selectedPartner);
                formData.append('receiverPartnerId', selectedPartner);
                formData.append('receiverPartnerName', partner?.company_name || 'Credit Partner');
            } else {
                formData.append('receiverPartnerId', '');
                formData.append('receiverPartnerName', 'Veda CRM');
            }
            await zipService.upload(formData);
            setUploadModalOpen(false);
            setFile(null);
            setSelectedPartner('');
            fetchData();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (doc) => {
        try {
            setDownloadingId(doc.id);
            const { url } = await zipService.downloadDocument(doc.id);
            window.open(url, '_blank');
        } catch (err) {
            alert('Download failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setDownloadingId(null);
        }
    };

    const handleRequestDownload = async (transactionId) => {
        try {
            await zipService.requestDownload(transactionId);
            alert('Download request sent to CRM');
        } catch (err) {
            alert('Request failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handlePreview = async (doc) => {
        try {
            setDownloadingId(doc.id);
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
            setPreviewData({ url, name: doc.file_name, type: ext, isBlob: !isOfficeDoc });
            setPreviewOpen(true);
        } catch (err) {
            alert('Preview failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setDownloadingId(null);
        }
    };

    const handleClosePreview = () => {
        if (previewData?.isBlob && previewData?.url) URL.revokeObjectURL(previewData.url);
        setPreviewOpen(false);
        setPreviewData(null);
    };

    const handleDelete = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await zipService.deleteDocument(docId);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteFolder = async (txId) => {
        if (!window.confirm('Delete this ZIP folder and all its files? This cannot be undone.')) return;
        try {
            await zipService.deleteTransaction(txId);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.error || err.message));
        }
    };

    // Sort transactions chronologically (oldest first for timeline)
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    // Filter transactions
    const filteredTxs = sortedTransactions.filter(tx => {
        if (filterTab === 'all') return true;
        if (filterTab === 'sent') {
            return isCRM ? tx.sender_type === 'CRM' : tx.sender_type === 'Partner';
        }
        if (filterTab === 'received') {
            return isCRM ? tx.sender_type === 'Partner' : tx.sender_type === 'CRM';
        }
        return true;
    });

    const sentCount = sortedTransactions.filter(tx => 
        isCRM ? tx.sender_type === 'CRM' : tx.sender_type === 'Partner'
    ).length;
    const receivedCount = sortedTransactions.filter(tx => 
        isCRM ? tx.sender_type === 'Partner' : tx.sender_type === 'CRM'
    ).length;

    const formatDateTime = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let datePart;
        if (d.toDateString() === today.toDateString()) {
            datePart = 'Today';
        } else if (d.toDateString() === yesterday.toDateString()) {
            datePart = 'Yesterday';
        } else {
            datePart = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }
        
        const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return { datePart, timePart, full: `${datePart} at ${timePart}` };
    };

    const isSentByMe = (tx) => {
        return isCRM ? tx.sender_type === 'CRM' : tx.sender_type === 'Partner';
    };

    if (loading && transactions.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // ── ZIP Folder View (when a transaction is selected) ──
    if (selectedTx) {
        const tx = selectedTx;
        const docs = tx.documents || [];
        const isSent = isSentByMe(tx);
        const { datePart, timePart } = formatDateTime(tx.created_at);

        return (
            <Box sx={{ py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Breadcrumb Navigation */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => setSelectedTx(null)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                        <ArrowLeft size={18} />
                    </IconButton>
                    <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => setSelectedTx(null)}
                            sx={{ 
                                color: 'primary.main', 
                                fontWeight: 600, 
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Case Exchange
                        </Link>
                        <Typography variant="body2" color="text.primary" fontWeight={600} noWrap sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.zip_name}
                        </Typography>
                    </Breadcrumbs>
                </Box>

                {/* ZIP Header */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: isSent ? alpha(theme.palette.primary.main, 0.04) : alpha('#10b981', 0.04) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: isSent ? theme.palette.primary.main : '#10b981' }}>
                            {isSent ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={800}>{tx.zip_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {docs.length} files • {isSent ? 'Sent' : 'Received'} {datePart} at {timePart}
                            </Typography>
                        </Box>
                        <Chip 
                            label={isSent ? 'Sent' : 'Received'} 
                            size="small"
                            sx={{ 
                                fontWeight: 700, 
                                bgcolor: isSent ? theme.palette.primary.main : '#10b981', 
                                color: '#fff' 
                            }}
                        />
                    </Box>
                </Paper>

                {/* Files List */}
                <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {docs.map((doc) => {
                        const isOwner = (isCRM && (doc.uploaded_by_type === 'CRM' || !doc.uploaded_by_type)) || (!isCRM && (doc.uploaded_by_type === 'Partner' || !doc.uploaded_by_type));
                        const needsApproval = !isCRM && doc.uploaded_by_type === 'CRM';
                        const isLoading = downloadingId === doc.id;

                        return (
                            <Paper key={doc.id} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                    {getFileIcon(doc.file_name)}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={700} noWrap>{doc.file_name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {(doc.file_size / 1024).toFixed(1)} KB • {doc.lifecycle_status}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.5}>
                                    <Tooltip title="View">
                                        <IconButton size="small" onClick={() => handlePreview(doc)} disabled={isLoading}>
                                            <Eye size={16} />
                                        </IconButton>
                                    </Tooltip>
                                    {needsApproval ? (
                                        <Tooltip title="Request Download">
                                            <Button size="small" variant="outlined" onClick={() => handleRequestDownload(tx.id)}
                                                sx={{ minWidth: 0, px: 1, height: 32, fontSize: '0.7rem', borderRadius: 2 }}>
                                                <ShieldCheck size={14} />
                                            </Button>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Download">
                                            <IconButton size="small" color="primary" onClick={() => handleDownload(doc)} disabled={isLoading}>
                                                {isLoading ? <CircularProgress size={16} /> : <Download size={16} />}
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {isOwner && (
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Stack>
                            </Paper>
                        );
                    })}
                </Box>

                <FilePreviewModal
                    open={previewOpen}
                    onClose={handleClosePreview}
                    fileUrl={previewData?.url}
                    fileName={previewData?.name}
                    fileType={previewData?.type}
                    onDownload={null}
                />
            </Box>
        );
    }

    // ── Main Timeline View ──
    return (
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MessageSquareDiff size={22} color={theme.palette.primary.main} />
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            Case Exchange
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Document timeline with Credit Partners
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={fetchData} disabled={loading}>
                            <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<UploadCloud size={18} />}
                        onClick={() => setUploadModalOpen(true)}
                        sx={{ borderRadius: 3, px: 3 }}
                    >
                        Upload ZIP
                    </Button>
                </Box>
            </Box>

            {/* Filter Tabs */}
            <Paper sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
                <Tabs
                    value={filterTab}
                    onChange={(_, v) => setFilterTab(v)}
                    sx={{ px: 1, '& .MuiTab-root': { minHeight: 44, fontWeight: 700, fontSize: '0.82rem' } }}
                >
                    <Tab value="all" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>All <Chip label={filteredTxs.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} /></Box>} />
                    <Tab value="sent" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ArrowUpRight size={14} />Sent <Chip label={sentCount} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} /></Box>} />
                    <Tab value="received" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ArrowDownLeft size={14} />Received <Chip label={receivedCount} size="small" color="success" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} /></Box>} />
                </Tabs>
            </Paper>

            {/* Timeline */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: 1,
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.primary.main, 0.2), borderRadius: 4 },
                }}
            >
                {filteredTxs.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, opacity: 0.5 }}>
                        <FileArchive size={56} />
                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>No ZIPs yet</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Upload a ZIP to start exchanging documents
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
                        {filteredTxs.map((tx, idx) => {
                            const isSent = isSentByMe(tx);
                            const docCount = tx.documents?.length || tx.totalDocuments || 0;
                            const { full } = formatDateTime(tx.created_at);

                            return (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                    <Paper
                                        onClick={() => setSelectedTx(tx)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            bgcolor: isSent ? alpha(theme.palette.primary.main, 0.03) : alpha('#10b981', 0.03),
                                            border: '1px solid',
                                            borderColor: isSent ? alpha(theme.palette.primary.main, 0.1) : alpha('#10b981', 0.1),
                                            '&:hover': {
                                                bgcolor: isSent ? alpha(theme.palette.primary.main, 0.06) : alpha('#10b981', 0.06),
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {/* Avatar - Left for received, Right for sent */}
                                            {isSent && (
                                                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 44, height: 44, flexShrink: 0 }}>
                                                    <ArrowUpRight size={22} />
                                                </Avatar>
                                            )}

                                            {/* ZIP Icon */}
                                            <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2, flexShrink: 0 }}>
                                                <Folder size={24} color={isSent ? theme.palette.primary.main : '#10b981'} />
                                            </Box>

                                            {/* Content */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Chip 
                                                        label={isSent ? 'Sent' : 'Received'} 
                                                        size="small"
                                                        sx={{ 
                                                            height: 18, 
                                                            fontSize: '0.6rem',
                                                            fontWeight: 700,
                                                            bgcolor: isSent ? theme.palette.primary.main : '#10b981',
                                                            color: '#fff'
                                                        }}
                                                    />
                                                    <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ flex: 1 }}>
                                                        {tx.zip_name}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {docCount} files • {isSent ? 'To: ' : 'From: '} {isSent ? tx.receiver_partner_name : tx.sender_name} • {full}
                                                </Typography>
                                            </Box>

                                            {/* Arrow */}
                                            <ChevronRight size={20} color="#999" />
                                        </Box>

                                        {/* Delete button for owner */}
                                        {(true) && (
                                            <Tooltip title="Delete ZIP">
                                                <IconButton 
                                                    size="small" 
                                                    color="error"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(tx.id); }}
                                                    sx={{ ml: 0.5 }}
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Paper>
                                </motion.div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </Box>
                )}
            </Box>

            {/* Upload Modal */}
            <Dialog open={uploadModalOpen} onClose={() => !uploading && setUploadModalOpen(false)}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}>
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Send size={20} color={theme.palette.primary.main} />
                        Upload Documents
                    </Box>
                    <IconButton onClick={() => setUploadModalOpen(false)} disabled={uploading} size="small"><X size={20} /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {isCRM && (
                            <TextField
                                select
                                fullWidth
                                label="Select Credit Partner"
                                value={selectedPartner}
                                onChange={(e) => setSelectedPartner(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            >
                                {partners.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.company_name}</MenuItem>
                                ))}
                            </TextField>
                        )}
                        <Box
                            sx={{
                                border: '2px dashed',
                                borderColor: file ? 'primary.main' : 'divider',
                                borderRadius: 4,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' }
                            }}
                            component="label"
                        >
                            <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} accept=".zip" />
                            <UploadCloud size={40} color={theme.palette.primary.main} style={{ marginBottom: 12 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {file ? file.name : 'Click to select ZIP file'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Max size: 50MB
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUploadModalOpen(false)} disabled={uploading}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploading || !file || (isCRM && !selectedPartner)}
                        startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <UploadCloud size={18} />}
                        sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            <FilePreviewModal
                open={previewOpen}
                onClose={handleClosePreview}
                fileUrl={previewData?.url}
                fileName={previewData?.name}
                fileType={previewData?.type}
                onDownload={null}
            />
        </Box>
    );
};

export default CaseExchangeTab;
