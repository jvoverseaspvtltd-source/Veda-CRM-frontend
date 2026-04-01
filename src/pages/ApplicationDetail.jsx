import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Divider,
    Chip,
    Button,
    TextField,
    CircularProgress,
    Stack,
    Alert,
    Avatar,
    alpha,
    useTheme,
    Breadcrumbs,
    Link as MuiLink,
    IconButton,
    Tooltip,
    MenuItem,
    Tabs,
    Tab
} from '@mui/material';
import { 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    BookOpen, 
    Building, 
    DollarSign, 
    History, 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    ChevronRight,
    Briefcase,
    GraduationCap,
    Globe,
    ExternalLink,
    Users,
    Heart,
    Flag,
    FileText,
    ArrowLeft,
    Edit,
    UploadCloud,
    Trash2,
    X,
    Save
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { applicationService, documentService } from '../services/api';
import CaseExchangeTab from '../components/CaseExchangeTab';
import { motion } from 'framer-motion';

const ApplicationDetail = () => {
    const { id } = useParams();
    const theme = useTheme();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [activeTab, setActiveTab] = useState(0);

    // Document Upload State
    const [documents, setDocuments] = useState([]);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState('Aadhar Card');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchApplication();
        fetchDocuments();
    }, [id]);

    const fetchDocuments = async () => {
        try {
            const docs = await documentService.getForCase(id);
            setDocuments(docs);
        } catch (err) {
            console.error('Failed to fetch documents', err);
        }
    };

    const fetchApplication = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getById(id);
            setApplication(data);
            setEditedData(data); // Initialize edited data
        } catch (err) {
            setError('Failed to fetch application details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await applicationService.update(id, { status: newStatus });
            fetchApplication();
        } catch (err) {
            alert('Status update failed');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await applicationService.update(id, editedData);
            setIsEditing(false);
            fetchApplication();
        } catch (err) {
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleEditDataChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadDocument = async () => {
        if (!selectedFile) return alert('Please select a file');
        try {
            setUploadingDoc(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('leadId', id);
            formData.append('docType', selectedDocType);
            await documentService.upload(formData);
            setSelectedFile(null);
            fetchDocuments();
        } catch (err) {
            alert('Failed to upload document');
            console.error(err);
        } finally {
            setUploadingDoc(false);
        }
    };
    
    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await documentService.delete(docId);
            fetchDocuments();
        } catch (err) {
            alert('Failed to delete document');
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            await applicationService.addNote(id, newNote);
            setNewNote('');
            fetchApplication();
        } catch (err) {
            alert('Failed to add note');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': case 'Disbursed / Completed': return <CheckCircle2 size={16} color={theme.palette.success.main} />;
            case 'Rejected': return <AlertCircle size={16} color={theme.palette.error.main} />;
            default: return <Clock size={16} color={theme.palette.warning.main} />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!application) return <Alert severity="warning">Application not found</Alert>;

    const statuses = [
        'New Application', 
        'Under Review', 
        'Documents Pending', 
        'Submitted to Bank / University', 
        'Approved', 
        'Rejected', 
        'Disbursed / Completed'
    ];

    const InfoBlock = ({ label, value, icon, name, type = "text" }) => {
        if (isEditing && name) {
            return (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                        {icon} {label}
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        name={name}
                        type={type}
                        value={editedData[name] || ''}
                        onChange={handleEditDataChange}
                        variant="outlined"
                        InputLabelProps={type === 'date' ? { shrink: true } : {}}
                    />
                </Box>
            );
        }
        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
                    {icon} {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {value || 'Not provided'}
                </Typography>
            </Box>
        );
    };

    const SectionHeader = ({ title, icon }) => (
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, mt: 1, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
            <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, display: 'flex' }}>
                {icon}
            </Box>
            {title}
        </Typography>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/applications')} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Breadcrumbs separator={<ChevronRight size={14} />}>
                        <MuiLink component={Link} to="/applications" underline="hover" color="inherit" sx={{ fontWeight: 500 }}>Applications</MuiLink>
                        <Typography color="text.primary" sx={{ fontWeight: 700 }}>{application.applicant_name}</Typography>
                    </Breadcrumbs>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isEditing ? (
                        <>
                            <Button variant="outlined" color="error" startIcon={<X size={18} />} onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button 
                                variant="contained" 
                                color="success" 
                                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />} 
                                onClick={handleSave}
                                disabled={saving}
                            >
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button variant="contained" startIcon={<Edit size={18} />} onClick={() => setIsEditing(true)}>Edit Details</Button>
                    )}
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Left Side - Detailed Info */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 5, mb: 4, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ 
                            position: 'absolute', top: 0, left: 0, width: '100%', height: 6, 
                            bgcolor: application.status === 'Approved' ? 'success.main' : 'primary.main' 
                        }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 900, fontSize: 24 }}>
                                    {application.applicant_name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{application.applicant_name}</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" color="text.secondary">Application ID: {application.id.slice(0, 8).toUpperCase()}</Typography>
                                        <Chip label={application.application_source || 'Website'} size="small" variant="outlined" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                                    </Stack>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                <Chip 
                                    label={application.status} 
                                    color={getStatusColor(application.status)} 
                                    sx={{ fontWeight: 800, px: 2, py: 2, borderRadius: 3 }} 
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Updated: {new Date(application.updated_at).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>

                        <Tabs 
                            value={activeTab} 
                            onChange={(e, v) => setActiveTab(v)} 
                            sx={{ 
                                mb: 4, 
                                borderBottom: '1px solid', 
                                borderColor: 'divider',
                                '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minWidth: 100 }
                            }}
                        >
                            <Tab icon={<User size={18} />} iconPosition="start" label="Overview" />
                            <Tab icon={<FileText size={18} />} iconPosition="start" label="Documents" />
                            <Tab icon={<MessageSquareDiff size={18} />} iconPosition="start" label="Chat" />
                        </Tabs>

                        {activeTab === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {/* Personal Details */}
                                <SectionHeader title="Personal Information" icon={<User size={20} />} />
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Full Name" value={application.applicant_name} name="applicant_name" icon={<User size={14} />} /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Phone" value={application.phone} name="phone" icon={<Phone size={14} />} /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Email" value={application.email} name="email" icon={<Mail size={14} />} /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Date of Birth" value={application.dob} name="dob" type="date" icon={<Calendar size={14} />} /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Gender" value={application.gender} name="gender" /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Marital Status" value={application.marital_status} name="marital_status" /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Nationality" value={application.nationality} name="nationality" icon={<Flag size={14} />} /></Grid>
                                    <Grid size={{ xs: 12, sm: 8 }}><InfoBlock label="Current Address" value={application.address} name="address" icon={<MapPin size={14} />} /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="State" value={application.state} name="state" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="City" value={application.city} name="city" /></Grid>
                                </Grid>

                                <Divider sx={{ my: 4 }} />

                                {/* Financial Details */}
                                <SectionHeader title="Financial & Employment" icon={<DollarSign size={20} />} />
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Employment Type" value={application.employment_type} name="employment_type" icon={<Briefcase size={14} />} /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Monthly Income" value={application.monthly_income ? `₹${application.monthly_income.toLocaleString()}` : 'N/A'} name="monthly_income" type="number" /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Experience" value={application.job_experience} name="job_experience" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="Company Name" value={application.company_name} name="company_name" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="Business Name" value={application.business_name} name="business_name" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="GST Number" value={application.gst_number} name="gst_number" /></Grid>
                                </Grid>

                                <Divider sx={{ my: 4 }} />

                                {/* Loan Details */}
                                <SectionHeader title="Loan Requirements" icon={<Briefcase size={20} />} />
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Loan Type" value={application.course} name="course" icon={<FileText size={14} />} /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Requested Amount" value={application.loan_amount} name="loan_amount" type="number" /></Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}><InfoBlock label="Expected Tenure" value={application.loan_tenure} name="loan_tenure" type="number" /></Grid>
                                    <Grid size={{ xs: 12 }}><InfoBlock label="Loan Purpose" value={application.loan_purpose} name="loan_purpose" /></Grid>
                                </Grid>

                                {/* Education Specifics */}
                                {(application.course === 'Education Loan' || editedData.course === 'Education Loan') && (
                                    <>
                                        <Divider sx={{ my: 4 }} />
                                        <SectionHeader title="Education Details" icon={<GraduationCap size={20} />} />
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="University" value={application.university_name} name="university_name" icon={<Building size={14} />} /></Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="Destination" value={application.destination_country} name="destination_country" icon={<Globe size={14} />} /></Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="Course Name" value={application.course_name} name="course_name" icon={<BookOpen size={14} />} /></Grid>
                                            <Grid size={{ xs: 12, sm: 3 }}><InfoBlock label="Level" value={application.course_level} name="course_level" /></Grid>
                                            <Grid size={{ xs: 12, sm: 3 }}><InfoBlock label="Duration" value={application.course_duration} name="course_duration" /></Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="Admission Status" value={application.admission_status} name="admission_status" /></Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}><InfoBlock label="Entrance Exams" value={application.entrance_exams} name="entrance_exams" /></Grid>
                                        </Grid>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <SectionHeader title="Uploaded Documents" icon={<FileText size={20} />} />
                                
                                <Paper sx={{ p: 3, borderRadius: 4, mb: 4, border: '1px dashed', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                label="Document Type"
                                                value={selectedDocType}
                                                onChange={(e) => setSelectedDocType(e.target.value)}
                                                sx={{ bgcolor: 'white' }}
                                            >
                                                {['Aadhar Card', 'PAN Card', 'Income Proof', 'Bank Statement', 'Admission Letter', 'Passport', 'Other'].map(type => (
                                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 5 }}>
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                color="primary"
                                                fullWidth
                                                startIcon={<UploadCloud size={18} />}
                                                sx={{ textTransform: 'none', height: '40px', bgcolor: 'white' }}
                                            >
                                                {selectedFile ? selectedFile.name : 'Choose File'}
                                                <input type="file" hidden onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                                            </Button>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <Button 
                                                variant="contained" 
                                                fullWidth 
                                                onClick={handleUploadDocument}
                                                disabled={!selectedFile || uploadingDoc}
                                                sx={{ height: '40px' }}
                                            >
                                                {uploadingDoc ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Paper>
                                
                                <Stack spacing={2}>
                                    {documents.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>No documents uploaded yet.</Typography>
                                    ) : documents.map((doc) => (
                                        <Paper key={doc.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                                                    <FileText size={20} />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{doc.doc_type}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{doc.file_name || 'Document'}</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip label={doc.status} size="small" color={doc.status === 'Verified' ? 'success' : 'warning'} sx={{ fontWeight: 600, height: 24 }} />
                                                <IconButton size="small" color="primary" onClick={() => window.open(doc.file_url, '_blank')}><ExternalLink size={18} /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteDocument(doc.id)}><Trash2 size={18} /></IconButton>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            </motion.div>
                        )}

                        {activeTab === 2 && (
                            <CaseExchangeTab leadId={id} />
                        )}
                    </Paper>

                    {/* Action History / Timeline */}
                    <Paper sx={{ p: 4, borderRadius: 5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <History size={20} /> Activity Timeline
                        </Typography>
                        <Stack spacing={3}>
                            {application.activities?.map((activity, idx) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Box sx={{ p: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '50%', color: 'primary.main' }}>
                                            {getStatusIcon(activity.action)}
                                        </Box>
                                        {idx !== application.activities.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 1 }} />}
                                    </Box>
                                    <Box sx={{ pb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activity.action}</Typography>
                                        <Typography variant="body2" color="text.secondary">{activity.details}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>{new Date(activity.created_at).toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Side - Actions & Consultancy */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 5, mb: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>Update Pipeline Status</Typography>
                        <Stack spacing={1}>
                            {statuses.map(s => (
                                <Button 
                                    key={s} 
                                    variant={application.status === s ? "contained" : "outlined"}
                                    onClick={() => handleUpdateStatus(s)}
                                    size="small"
                                    sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                >
                                    {s}
                                </Button>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Consultancy Info */}
                    {(application.consultancy_name || application.referral_code) && (
                        <Paper sx={{ p: 3, borderRadius: 5, mb: 4, bgcolor: alpha(theme.palette.secondary.main, 0.02), border: '1px solid', borderColor: alpha(theme.palette.secondary.main, 0.1) }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.main' }}>
                                <Users size={18} /> Referral Tracking
                            </Typography>
                            <Stack spacing={2}>
                                {application.consultancy_name && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Consultancy Firm</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>{application.consultancy_name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{application.consultancy_city}</Typography>
                                    </Box>
                                )}
                                {application.consultant_person_name && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Contact Person</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>{application.consultant_person_name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{application.consultant_phone}</Typography>
                                    </Box>
                                )}
                                {application.referral_code && (
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">Referral Code</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'secondary.main' }}>{application.referral_code}</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    )}

                    <Paper sx={{ p: 3, borderRadius: 5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MessageSquare size={18} /> Internal Notes
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <TextField 
                                fullWidth 
                                multiline 
                                rows={3} 
                                placeholder="Add a private note..." 
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                            <Button fullWidth variant="contained" onClick={handleAddNote} disabled={!newNote.trim()}>Add Note</Button>
                        </Box>
                        <Stack spacing={2}>
                            {application.notes?.map((note, idx) => (
                                <Box key={idx} sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 3 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{note.note}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{new Date(note.created_at).toLocaleString()}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case 'New Application': return 'info';
        case 'Under Review': return 'warning';
        case 'Documents Pending': return 'secondary';
        case 'Submitted to Bank / University': return 'primary';
        case 'Approved': return 'success';
        case 'Rejected': return 'error';
        case 'Disbursed / Completed': return 'success';
        default: return 'default';
    }
};

export default ApplicationDetail;
