import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    Button,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Card,
    CardContent,
    TextField
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { FileText, User, MapPin, Calculator, Calendar, ArrowLeft, Shield, History } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SecureViewer from '../../components/SecureViewer';
import { partnerFileService } from '../../services/api';

const PartnerProfileView = ({ profile, onBack, onDecision }) => {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const partner = JSON.parse(localStorage.getItem('partner') || '{}');

    const handleViewDoc = (doc) => {
        setSelectedDoc(doc);
        setViewerOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('partner_id', partner.id);
        formData.append('lead_id', profile.lead_id);
        formData.append('file_type', 'Processing Document');

        try {
            setUploading(true);
            await partnerFileService.upload(formData);
            alert('File uploaded successfully!');
            // Refresh logic could go here
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (!profile) return null;

    const lead = profile.leads;

    return (
        <Box>
            <Button 
                startIcon={<ArrowLeft size={18} />} 
                onClick={onBack}
                sx={{ mb: 3, fontWeight: 700 }}
            >
                Back to Dashboard
            </Button>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>Applicant Profile</Typography>
                                <Typography variant="body2" color="text.secondary">Shared for review on {new Date(profile.created_at).toLocaleDateString()}</Typography>
                            </Box>
                            <Chip 
                                label={profile.status} 
                                color={profile.status === 'Accepted' ? 'success' : profile.status === 'Rejected' ? 'error' : 'warning'} 
                                sx={{ fontWeight: 700 }}
                            />
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <User size={20} className="text-primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Full Name</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{lead.name}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <MapPin size={20} className="text-primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">City</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{lead.city}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Calculator size={20} className="text-primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Requested Amount</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>₹{lead.loan_amount?.toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Shield size={20} className="text-primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Loan Type</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{lead.loan_type}</Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 4, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Applicant Documents</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, p: 1.5, bgcolor: '#fff5f5', borderRadius: 2, color: '#c53030', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Shield size={16} /> Documents are in Read-Only Secure View mode.
                        </Typography>
                        
                        <List>
                            {/* In a real app, these would come from documentService.getForCase(lead.id) */}
                            {['Aadhar Card', 'PAN Card', 'Income Certificate', 'Bank Statements'].map((docName, i) => (
                                <ListItem key={i} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 1, '&:hover': { bgcolor: '#f7fafc' } }}>
                                    <ListItemIcon><FileText size={20} color="#4a5568" /></ListItemIcon>
                                    <ListItemText primary={docName} secondary="PDF Document" />
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={() => handleViewDoc({ title: docName })}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Secure View
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: 4, border: '2px solid', borderColor: 'primary.main', mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Decision Box</Typography>
                            {profile.status === 'Shared' ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button 
                                        variant="contained" 
                                        color="success" 
                                        fullWidth 
                                        onClick={() => onDecision(profile, 'Accepted')}
                                        sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                                    >
                                        Accept Profile
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        color="error" 
                                        fullWidth 
                                        onClick={() => onDecision(profile, 'Rejected')}
                                        sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                                    >
                                        Reject Profile
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Decision already submitted:</Typography>
                                    <Typography variant="h6" color={profile.status === 'Accepted' ? 'success.main' : 'error.main'} sx={{ fontWeight: 800 }}>
                                        {profile.status}
                                    </Typography>
                                    {profile.rejection_reason && (
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                                            "{profile.rejection_reason}"
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Upload Processing Documents</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Upload sanction letters, requirement lists, or further queries.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            component="label"
                            disabled={uploading}
                            startIcon={uploading ? <History className="animate-spin" size={18} /> : <Calculator size={18} />}
                            sx={{ borderRadius: 2, borderStyle: 'dashed' }}
                        >
                            {uploading ? 'Uploading...' : 'Select File'}
                            <input type="file" hidden onChange={handleFileUpload} />
                        </Button>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Interaction Message</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Once you accept, you can send processing queries and required document requests back to the CRM team.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {viewerOpen && (
                <SecureViewer 
                    url={selectedDoc?.url} 
                    title={selectedDoc?.title} 
                    onClose={() => setViewerOpen(false)} 
                />
            )}
        </Box>
    );
};

export default PartnerProfileView;
