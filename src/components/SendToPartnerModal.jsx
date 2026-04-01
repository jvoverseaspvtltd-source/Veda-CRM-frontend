import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Divider
} from '@mui/material';
import { Share2, Building2, User, Clock, FileText, Download } from 'lucide-react';
import { lendingPartnerService, partnerProfileService, partnerFileService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SendToPartnerModal = ({ open, onClose, lead }) => {
    const { profile } = useAuth();
    const [partners, setPartners] = useState([]);
    const [existingShares, setExistingShares] = useState([]);
    const [partnerFiles, setPartnerFiles] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [loading, setLoading] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (open && lead) {
            fetchData();
        }
    }, [open, lead]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [partnersData, sharesData, filesData] = await Promise.all([
                lendingPartnerService.getAll(),
                partnerProfileService.getLeadShares(lead.id),
                partnerFileService.getForLead(lead.id)
            ]);
            setPartners(partnersData.filter(p => p.status === 'Active'));
            setExistingShares(sharesData);
            setPartnerFiles(filesData || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load partners data');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!selectedPartner) return;
        
        try {
            setSharing(true);
            setError(null);
            await partnerProfileService.share({
                lead_id: lead.id,
                partner_id: selectedPartner,
                shared_by: profile.id
            });
            setSuccess('Profile shared successfully!');
            setSelectedPartner('');
            fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to share profile');
        } finally {
            setSharing(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Share2 size={24} className="text-primary" />
                Send Profile to Credit Partner
            </DialogTitle>
            <DialogContent dividers>
                {lead && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(26, 54, 93, 0.04)', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Applicant</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{lead.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{lead.loan_type} | ₹{lead.loan_amount?.toLocaleString()}</Typography>
                    </Box>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
                ) : (
                    <>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Select Partner to Share</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Choose Credit Partner"
                                value={selectedPartner}
                                onChange={(e) => setSelectedPartner(e.target.value)}
                            >
                                {partners.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        {p.bank_name} - {p.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button
                                variant="contained"
                                onClick={handleShare}
                                disabled={!selectedPartner || sharing}
                                sx={{ fontWeight: 700, minWidth: 100 }}
                            >
                                {sharing ? <CircularProgress size={20} /> : 'Share'}
                            </Button>
                        </Box>

                        <Divider sx={{ mb: 2, mt: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Partner Uploaded Files</Typography>
                        <List dense>
                            {partnerFiles.length === 0 ? (
                                <Typography variant="caption" color="text.secondary">No files uploaded by partners yet.</Typography>
                            ) : (
                                partnerFiles.map((file) => (
                                    <ListItem key={file.id} sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {file.file_name || 'Processing Document'}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="text.secondary">
                                                    From: {file.lending_partners?.name} ({file.lending_partners?.bank_name})
                                                </Typography>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Button 
                                                size="small" 
                                                startIcon={<Download size={14} />}
                                                onClick={() => window.open(file.file_url, '_blank')}
                                            >
                                                Download
                                            </Button>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} sx={{ fontWeight: 600 }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendToPartnerModal;
