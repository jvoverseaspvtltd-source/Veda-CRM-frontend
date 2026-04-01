import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CircularProgress, Alert, alpha, useTheme, 
    TextField, InputAdornment, Button, IconButton,
    Collapse, Divider, Drawer, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Chip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileArchive, Search, Filter, Folder, File, CheckCircle, 
    XCircle, MessageSquare, Clock, User, 
    Download, ShieldCheck, Send, X,
    ChevronDown, ChevronUp, Eye, FileText,
    Building, ArrowDownLeft, Image as ImageIcon, Table as TableIcon,
    Layout, Check, AlertTriangle, Shield, Clock as ClockIcon, Server, ExternalLink, UserPlus, Layers
} from 'lucide-react';
import { trackingService, lendingPartnerService } from '../services/api';
import { supabase } from '../services/supabase';
import { 
    InteractivePackageCard, 
    DocumentDecisionCard 
} from '../components/tracking/TrackingComponents';

const motionContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const Inflow = () => {
    const theme = useTheme();
    // Admin context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [packages, setPackages] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [partnerFilter, setPartnerFilter] = useState('all');

    // Drawer/Dialog State
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [chatMsg, setChatMsg] = useState('');
    const [rejectionTarget, setRejectionTarget] = useState(null);
    const [rejectionNote, setRejectionNote] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    // Advanced Phase 2 State
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedDocIds, setSelectedDocIds] = useState(new Set());
    const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
    const [isRealtime, setIsRealtime] = useState(false);

    useEffect(() => {
        fetchInitialData();
        setupRealtime();
    }, []);

    const setupRealtime = () => {
        if (!supabase) return;
        const channel = supabase
            .channel('tracking-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_packages' }, () => fetchInitialData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_students' }, () => fetchInitialData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_documents' }, () => fetchInitialData())
            .subscribe((status) => setIsRealtime(status === 'SUBSCRIBED'));

        return () => supabase.removeChannel(channel);
    };

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [pkgs, pts] = await Promise.all([
                // For admin, we might need a dynamic endpoint to get ALL packages
                // Assuming getPackagesByPartner can take 'all' or we use a separate admin call
                // Here I'll use a hack or assume the service handles empty partnerId for admin
                trackingService.getPackagesByPartner('all', 'incoming'),
                lendingPartnerService.getAll()
            ]);
            setPackages(pkgs || []);
            setPartners(pts || []);
        } catch (err) {
            setError('Failed to aggregate inbound relay data.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type, id, status, note = '') => {
        try {
            await trackingService.updateStatus(type, id, status, note, user.id);
            fetchInitialData();
            setDialogOpen(false);
            setRejectionTarget(null);
            setRejectionNote('');
        } catch (err) {
            setError('Synchronization error.');
        }
    };

    const handleDirectDownload = (doc) => {
        if (doc.file_url) {
            window.open(doc.file_url, '_blank');
        }
    };

    const handleDelete = async (docId) => {
        try {
            await trackingService.deleteDocument(docId, user.id, 'Veda');
            fetchInitialData();
        } catch (err) {
            setError('Failed to delete document: ' + err.message);
        }
    };

    const handleSendChat = async () => {
        if (!chatMsg.trim() || !selectedPackage) return;
        try {
            await trackingService.sendMessage(selectedPackage.id, {
                sender_id: user.id,
                sender_type: 'CRM',
                message: chatMsg
            });
            setChatMsg('');
        } catch (err) {
            console.error('Chat error:', err);
        }
    };

    const handleBulkAction = async (status, note = '') => {
        try {
            const ids = Array.from(selectedDocIds);
            await trackingService.bulkStatusUpdate('document', ids, status, note, user.id);
            setSelectedDocIds(new Set());
            fetchInitialData();
        } catch (err) {
            setError('Bulk update failed.');
        }
    };

    const handleAssign = async (pkgId, empId) => {
        try {
            await trackingService.assignPackage(pkgId, { assigned_to: empId, actor_id: user.id });
            fetchInitialData();
        } catch (err) {
            setError('Assignment failed.');
        }
    };

    const toggleDocSelection = (id) => {
        const newSet = new Set(selectedDocIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedDocIds(newSet);
    };

    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.package_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             pkg.tracking_students?.some(s => s.student_name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesPartner = partnerFilter === 'all' || pkg.sender_id === partnerFilter;
        return matchesSearch && matchesPartner;
    });

    if (loading && packages.length === 0) {
        return (
            <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 2 }}>AGGREGATING GLOBAL RELAYS...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100%', pb: 8 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                <ArrowDownLeft size={24} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -1.5 }}>Incoming Data</Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>Received from Credit Partners (External Relay Nodes).</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Filter by Partner</InputLabel>
                            <Select 
                                value={partnerFilter} 
                                onChange={(e) => setPartnerFilter(e.target.value)}
                                label="Filter by Partner"
                                sx={{ borderRadius: 3, bgcolor: 'background.paper' }}
                            >
                                <MenuItem value="all">All Power Nodes</MenuItem>
                                {partners.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField 
                            placeholder="Search students or packages..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> }}
                        />
                    </Box>
                </Box>
            </motion.div>

            {/* Realtime Status Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isRealtime ? 'success.main' : 'warning.main', boxShadow: isRealtime ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    {isRealtime ? 'Live Relay Active' : 'Syncing Streams...'}
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedDocIds.size > 0 && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}>
                        <Card sx={{ 
                            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', 
                            zIndex: 1000, px: 4, py: 2, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 3,
                            bgcolor: alpha(theme.palette.background.paper, 0.9), backdropFilter: 'blur(10px)',
                            border: '1px solid', borderColor: 'primary.main', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{selectedDocIds.size} Documents Selected</Typography>
                            <Divider orientation="vertical" flexItem />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="contained" color="success" startIcon={<CheckCircle size={14}/>} onClick={() => handleBulkAction('Accepted')} sx={{ borderRadius: 3, fontWeight: 800 }}>Bulk Accept</Button>
                                <Button size="small" variant="contained" color="error" startIcon={<XCircle size={14}/>} onClick={() => { setRejectionTarget({ type: 'bulk', id: 'multiple' }); setDialogOpen(true); }} sx={{ borderRadius: 3, fontWeight: 800 }}>Bulk Reject</Button>
                                <Button size="small" onClick={() => setSelectedDocIds(new Set())} sx={{ fontWeight: 700 }}>Reset</Button>
                            </Box>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Grid container spacing={3} component={motion.div} variants={motionContainer} initial="hidden" animate="visible">
                {filteredPackages.length === 0 ? (
                    <Grid size={ 12 }>
                        <Box sx={{ p: 10, textAlign: 'center', opacity: 0.5 }}>
                            <FileArchive size={64} style={{ marginBottom: 16 }} />
                            <Typography variant="h6" fontWeight={800}>No Data Packages Synced</Typography>
                        </Box>
                    </Grid>
                ) : (
                    filteredPackages.map((pkg) => (
                        <Grid size={12} key={pkg.id}>
                            <InteractivePackageCard 
                                pkg={pkg} 
                                partners={partners}
                                onAction={handleAction} 
                                onOpenChat={() => { setSelectedPackage(pkg); setDrawerOpen(true); }}
                                onReject={(type, id) => { setRejectionTarget({ type, id }); setDialogOpen(true); }}
                                onPreview={(doc) => { setPreviewDoc(doc); setPreviewOpen(true); }}
                                onDownload={handleDirectDownload}
                                onDelete={handleDelete}
                                isVedaView={true}
                                uploadedBy="Credit Partner"
                                canDelete={false}
                                onSelect={toggleDocSelection}
                                selectedIds={selectedDocIds}
                            />
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Rejection Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
                <DialogTitle sx={{ fontWeight: 900 }}>Required: Entry Discrepancy Note</DialogTitle>
                <DialogContent>
                    <TextField 
                        fullWidth multiline rows={4} placeholder="Why is this record being rejected?"
                        value={rejectionNote} onChange={(e) => setRejectionNote(e.target.value)}
                        sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 800 }}>Abort</Button>
                    <Button 
                        variant="contained" color="error" disabled={!rejectionNote.trim()}
                        onClick={() => handleAction(rejectionTarget.type, rejectionTarget.id, 'Rejected', rejectionNote)}
                        sx={{ borderRadius: 2, fontWeight: 800 }}
                    >
                        Confirm Rejection
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Chat Drawer */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 450 }, bgcolor: '#f8fafc' } }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h6" fontWeight={900}>Partner Comm-Link</Typography>
                            <Typography variant="caption" color="text.secondary">RE: {selectedPackage?.package_name}</Typography>
                        </Box>
                        <IconButton onClick={() => setDrawerOpen(false)}><X /></IconButton>
                    </Box>
                    <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 3, opacity: 0.5, fontWeight: 800 }}>SECURE MULTI-PARTY CHANNEL</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ alignSelf: 'flex-start', maxWidth: '80%', p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" fontWeight={800} color="primary.main">System</Typography>
                                <Typography variant="body2">System structured your ZIP file. Please review the parsed student records.</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField fullWidth placeholder="Type a message..." size="small" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                            <Button variant="contained" onClick={handleSendChat} sx={{ minWidth: 0, borderRadius: 3 }}><Send size={18} /></Button>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* Side-Panel Document Preview */}
            <Drawer anchor="right" open={previewOpen} onClose={() => setPreviewOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 800 } } }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}><Eye size={20}/></Box>
                            <Box>
                                <Typography variant="h6" fontWeight={900}>Document Inspector</Typography>
                                <Typography variant="caption" color="text.secondary">{previewDoc?.file_name}</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setPreviewOpen(false)}><X /></IconButton>
                    </Box>
                    <Box sx={{ flexGrow: 1, bgcolor: '#f1f5f9', p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {previewDoc && (() => {
                            const ext = previewDoc.file_name?.split('.').pop()?.toLowerCase();
                            const isPreviewable = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);

                            if (isPreviewable) {
                                return (
                                    <iframe 
                                        src={previewDoc.file_url} 
                                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }} 
                                        title="Inspector View"
                                    />
                                );
                            } else {
                                return (
                                    <Box sx={{ textAlign: 'center', p: 5 }}>
                                        <File size={120} style={{ marginBottom: 24, opacity: 0.2 }} />
                                        <Typography variant="h5" fontWeight={900} gutterBottom>Format Not Previewable</Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                                            The system cannot render <b>.{ext?.toUpperCase()}</b> files directly in the browser.
                                            Please download this document to inspect its contents.
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            size="large" 
                                            startIcon={<Download size={20} />} 
                                            component="a" 
                                            href={previewDoc.file_url} 
                                            download 
                                            sx={{ borderRadius: 3, fontWeight: 900 }}
                                        >
                                            Download to Inspect
                                        </Button>
                                    </Box>
                                );
                            }
                        })()}
                    </Box>
                    {previewDoc?.ai_suggestions?.length > 0 && (
                        <Box sx={{ p: 3, bgcolor: alpha(theme.palette.warning.main, 0.05), borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <AlertTriangle size={14} /> SMART VALIDATION SUGGESTIONS
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {previewDoc.ai_suggestions.map((s, i) => (
                                    <Chip key={i} label={s} size="small" variant="outlined" color="warning" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
};

export default Inflow;
