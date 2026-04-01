import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Stack,
    Alert,
    CircularProgress,
    Container,
    MenuItem,
    alpha,
    useTheme,
    Grid,
    LinearProgress
} from '@mui/material';
import { Send, CheckCircle2, User, Mail, Phone, MapPin, CreditCard, Upload, FileText, Check, X, Briefcase } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadService, documentService } from '../services/api';

const loanTypes = ['Education Loan', 'Personal Loan', 'Business Loan', 'Home Loan'];
const defaultDocTypes = ['Aadhaar Card', 'PAN Card', 'Income Proof', 'Bank Statement', 'Other'];

const PublicForm = () => {
    const theme = useTheme();
    const { id } = useParams();
    const [step, setStep] = useState(1); // 1: Details, 2: Documents, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [leadId, setLeadId] = useState(id || null);
    const [docTypes, setDocTypes] = useState(defaultDocTypes);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        city: '',
        loan_type: 'Education Loan',
        loan_amount: '',
        placeholderId: id || null
    });

    const [uploadedDocs, setUploadedDocs] = useState([]);

    React.useEffect(() => {
        fetchDocTypes();
    }, []);

    const fetchDocTypes = async () => {
        try {
            const types = await documentService.getAllTypes();
            if (types && types.length > 0) {
                setDocTypes(types.map(t => t.name));
            }
        } catch (err) {
            console.error('Failed to fetch doc types, using defaults');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const result = await leadService.submitPublicForm(formData);
            setLeadId(result.lead.id);
            setStep(2);
        } catch (err) {
            setError('Failed to submit details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file || !leadId) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('docType', type);
        uploadFormData.append('leadId', leadId);

        try {
            setLoading(true);
            await documentService.uploadPublicDocument(uploadFormData);
            setUploadedDocs([...uploadedDocs, type]);
        } catch (err) {
            alert('Upload failed for ' + type);
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', p: 3 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 8, maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid white' }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                        <CheckCircle2 size={48} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Success!</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Your application and documents have been submitted. Our team will verify them shortly.</Typography>
                    <Button variant="contained" fullWidth onClick={() => window.location.href = 'https://vedaloans.com'} sx={{ py: 1.5, borderRadius: 4, fontWeight: 800 }}>Back to Website</Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', pb: 8 }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>VEDA <span style={{ color: '#3B82F6' }}>LOANS</span></Typography>
            </Box>

            <Container maxWidth="sm">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 1 }}>Loan Application</Typography>
                    <Box sx={{ width: '100%', mt: 2, display: 'flex', gap: 1 }}>
                        <Box sx={{ flex: 1, height: 4, bgcolor: step >= 1 ? '#3B82F6' : 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                        <Box sx={{ flex: 1, height: 4, bgcolor: step >= 2 ? '#3B82F6' : 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" sx={{ color: step >= 1 ? 'white' : 'text.secondary', fontWeight: 800 }}>BASIC DETAILS</Typography>
                        <Typography variant="caption" sx={{ color: step >= 2 ? 'white' : 'text.secondary', fontWeight: 800 }}>KYC DOCUMENTS</Typography>
                    </Box>
                </Box>

                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, bgcolor: 'rgba(255, 255, 255, 0.98)', position: 'relative', overflow: 'hidden' }}>
                    {step === 1 ? (
                        <form onSubmit={handleFormSubmit}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Step 1: Your Details</Typography>
                            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}
                            <Stack spacing={3}>
                                <TextField fullWidth name="name" required label="Full Name" value={formData.name} onChange={handleChange} InputProps={{ startAdornment: <User size={18} style={{ marginRight: 12, color: '#64748b' }} />, sx: { borderRadius: 3 } }} />
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <TextField fullWidth name="email" required type="email" label="Email" value={formData.email} onChange={handleChange} InputProps={{ startAdornment: <Mail size={18} style={{ marginRight: 12, color: '#64748b' }} />, sx: { borderRadius: 3 } }} />
                                    <TextField fullWidth name="mobile" required label="Mobile" value={formData.mobile} onChange={handleChange} InputProps={{ startAdornment: <Phone size={18} style={{ marginRight: 12, color: '#64748b' }} />, sx: { borderRadius: 3 } }} />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <TextField fullWidth name="city" required label="City" value={formData.city} onChange={handleChange} InputProps={{ startAdornment: <MapPin size={18} style={{ marginRight: 12, color: '#64748b' }} />, sx: { borderRadius: 3 } }} />
                                    <TextField select fullWidth name="loan_type" label="Loan Type" value={formData.loan_type} onChange={handleChange} InputProps={{ startAdornment: <Briefcase size={18} style={{ marginRight: 12, color: '#64748b' }} />, sx: { borderRadius: 3 } }}>
                                        {loanTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                    </TextField>
                                </Box>
                                <TextField fullWidth name="loan_amount" required type="number" label="Expected Loan Amount (₹)" value={formData.loan_amount} onChange={handleChange} InputProps={{ startAdornment: <CreditCard size={18} style={{ marginRight: 12, color: '#64748b' }} />, sx: { borderRadius: 3 } }} />
                                <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 2, borderRadius: 4, fontWeight: 900 }}>
                                    {loading ? <CircularProgress size={24} /> : 'Save & Continue'}
                                </Button>
                            </Stack>
                        </form>
                    ) : (
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Step 2: Upload KYC Documents</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Please upload clear photos or PDFs of your documents for verification.</Typography>
                            
                            <Stack spacing={2}>
                                {docTypes.map(type => (
                                    <Box key={type} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: uploadedDocs.includes(type) ? 'success.main' : 'divider', bgcolor: uploadedDocs.includes(type) ? alpha(theme.palette.success.main, 0.02) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}><FileText size={20} /></Box>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{type}</Typography>
                                                <Typography variant="caption" color="text.secondary">{uploadedDocs.includes(type) ? 'File uploaded successfully' : 'Not uploaded yet'}</Typography>
                                            </Box>
                                        </Box>
                                        <Button component="label" variant="soft" color={uploadedDocs.includes(type) ? 'success' : 'primary'} startIcon={uploadedDocs.includes(type) ? <Check size={16} /> : <Upload size={16} />} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>
                                            {uploadedDocs.includes(type) ? 'Change' : 'Upload'}
                                            <input type="file" hidden onChange={(e) => handleFileUpload(e, type)} disabled={loading} />
                                        </Button>
                                    </Box>
                                ))}
                            </Stack>

                            <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Button fullWidth variant="contained" size="large" onClick={() => setStep(3)} sx={{ py: 2, borderRadius: 4, fontWeight: 900 }}>Finish Application</Button>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary', fontWeight: 600 }}>You can also upload documents later via the CRM portal.</Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
            {loading && <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}><LinearProgress /></Box>}
        </Box>
    );
};

export default PublicForm;
