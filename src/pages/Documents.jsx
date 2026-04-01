import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Card,
    CardContent,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import { Upload, Eye, CheckCircle, XCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { documentService, leadService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const docTypes = ['Aadhaar Card', 'PAN Card', 'Income Proof', 'Bank Statement', 'Admission Letter', 'Other'];

const Documents = () => {
    const { profile } = useAuth();
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Upload Form
    const [docType, setDocType] = useState('Aadhaar Card');
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchLeads();
    }, [profile]);

    const fetchLeads = async () => {
        try {
            const data = await leadService.getAllLeads(profile?.id, profile?.role);
            setLeads(data);
            if (data.length > 0) handleLeadSelect(data[0]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLeadSelect = async (lead) => {
        setSelectedLead(lead);
        try {
            const docs = await documentService.getForCase(lead.id);
            setDocuments(docs);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedLead) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', docType);
        formData.append('leadId', selectedLead.id);

        try {
            setUploading(true);
            await documentService.upload(formData);
            setOpen(false);
            handleLeadSelect(selectedLead); // Refresh docs
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Verified': return <CheckCircle size={18} color="#38a169" />;
            case 'Rejected': return <XCircle size={18} color="#e53e3e" />;
            default: return <AlertCircle size={18} color="#d69e2e" />;
        }
    };

    return (
        <Box>
            <Box sx={{ sx: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, display: 'flex' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Document Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Secure storage and verification for {selectedLead?.name || 'Customer'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        size="small"
                        label="Select Customer"
                        value={selectedLead?.id || ''}
                        onChange={(e) => handleLeadSelect(leads.find(l => l.id === e.target.value))}
                        sx={{ width: 250 }}
                    >
                        {leads.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
                    </TextField>
                    <Button
                        variant="contained"
                        startIcon={<Upload size={20} />}
                        onClick={() => setOpen(true)}
                        disabled={!selectedLead}
                    >
                        Upload New
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Document Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <FileText size={20} color="#718096" />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{doc.doc_type}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getStatusIcon(doc.status)}
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>{doc.status}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small"><Eye size={18} /></IconButton>
                                            <IconButton size="small"><Download size={18} /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {documents.length === 0 && (
                                    <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>No documents uploaded yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 4, bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Security Status</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Documents are encrypted and stored in Supabase private bucket. Only authorized employees can view files.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField select fullWidth label="Document Type" value={docType} onChange={(e) => setDocType(e.target.value)}>
                            {docTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </TextField>
                        <Button variant="outlined" component="label" fullWidth sx={{ py: 2 }}>
                            {file ? file.name : 'Choose File'}
                            <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpload} disabled={uploading || !file}>
                        {uploading ? <CircularProgress size={20} /> : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Documents;
