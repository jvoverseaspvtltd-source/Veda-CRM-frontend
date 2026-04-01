import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem,
    CircularProgress, Tooltip, Snackbar, Alert, Avatar
} from '@mui/material';
import { UserPlus, Edit, Trash2, Mail, ShieldCheck, Download, Copy, Building2, User } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font, Image } from '@react-pdf/renderer';

// =======================================================
// PDF Styles (Credentials Document)
// =======================================================
const pdfStyles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    header: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 20 },
    logoText: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    headerTitle: { fontSize: 12, color: '#64748b', alignSelf: 'flex-end' },
    title: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
    card: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 8, marginBottom: 20 },
    row: { flexDirection: 'row', marginBottom: 10 },
    label: { width: 120, fontSize: 12, color: '#64748b', fontWeight: 'bold' },
    value: { flex: 1, fontSize: 12, color: '#0f172a', fontWeight: 'bold' },
    passwordBox: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 5, marginTop: 10 },
    passwordLabel: { fontSize: 10, color: '#dc2626', marginBottom: 5 },
    passwordValue: { fontSize: 18, color: '#0f172a', fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 },
    footer: { position: 'absolute', bottom: 40, left: 40, right: 40 },
    warning: { fontSize: 10, color: '#ef4444', textAlign: 'center', marginBottom: 10 },
    divider: { borderBottom: '1px solid #cbd5e1', marginBottom: 10 },
    signatureRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
    signatureText: { fontSize: 10, color: '#64748b', borderTop: '1px solid #64748b', paddingTop: 5, width: 150, textAlign: 'center' }
});

const CredentialsPDF = ({ data }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <Text style={pdfStyles.logoText}>VEDA CRM</Text>
                <Text style={pdfStyles.headerTitle}>SECURE ONBOARDING</Text>
            </View>
            <Text style={pdfStyles.title}>Employee Credentials Issued</Text>
            
            <View style={pdfStyles.card}>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Employee ID:</Text><Text style={pdfStyles.value}>{data.emp_id}</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Full Name:</Text><Text style={pdfStyles.value}>{data.full_name}</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Email Address:</Text><Text style={pdfStyles.value}>{data.email}</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Designation:</Text><Text style={pdfStyles.value}>{data.role} ({data.department})</Text></View>
                <View style={pdfStyles.row}><Text style={pdfStyles.label}>Issue Date:</Text><Text style={pdfStyles.value}>{new Date(data.created_at).toLocaleString()}</Text></View>
                
                <View style={pdfStyles.passwordBox}>
                    <Text style={pdfStyles.passwordLabel}>INITIAL GENERATED PASSWORD (DO NOT SHARE):</Text>
                    <Text style={pdfStyles.passwordValue}>{data.password}</Text>
                </View>
            </View>

            <View style={pdfStyles.footer}>
                <Text style={pdfStyles.warning}>IMPORTANT: This document contains strictly confidential system credentials. Please ensure the employee resets this password upon their first login to the Veda CRM portal.</Text>
                <View style={pdfStyles.divider} />
                <View style={pdfStyles.signatureRow}>
                    <Text style={pdfStyles.signatureText}>Authorized Admin Signature</Text>
                    <Text style={pdfStyles.signatureText}>Employee Signature</Text>
                </View>
            </View>
        </Page>
    </Document>
);

// =======================================================
// Main Component
// =======================================================
const Employees = () => {
    const { user, profile } = useAuth();
    const isAdmin = ['Super Admin', 'Admin'].includes(profile?.role);

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Add Employee State
    const [openAddModal, setOpenAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', role: 'Telecaller', department: 'Sales' });
    
    // Success Credential State
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState(null);

    // Notifications
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await authService.getAllProfiles();
            // Admins see all, others only see themselves
            if (!isAdmin) {
                setEmployees(data.filter(emp => emp.id === user.id));
            } else {
                setEmployees(data);
            }
        } catch (err) {
            console.error('Failed to fetch employees', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async () => {
        if (!formData.full_name || !formData.email) return;
        setIsSubmitting(true);
        try {
            const res = await authService.createEmployee(formData);
            setGeneratedCredentials(res.credentials);
            setOpenAddModal(false);
            setOpenSuccessModal(true);
            setFormData({ full_name: '', email: '', phone: '', role: 'Telecaller', department: 'Sales' });
            fetchEmployees();
            setToast({ open: true, message: 'Employee successfully created!', type: 'success' });
        } catch (err) {
            setToast({ open: true, message: err.response?.data?.error || 'Registration failed', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyCredentials = () => {
        const text = `Veda CRM Account\nEmail: ${generatedCredentials?.email}\nPassword: ${generatedCredentials?.password}\nID: ${generatedCredentials?.emp_id}`;
        navigator.clipboard.writeText(text);
        setToast({ open: true, message: 'Credentials copied to clipboard!', type: 'info' });
    };

    const handleDelete = async (id) => {
        if (!isAdmin) return;
        if (window.confirm('Are you sure you want to delete this employee? This instantly revokes portal access.')) {
            try {
                await authService.deleteUser(id);
                fetchEmployees();
                setToast({ open: true, message: 'Employee deleted', type: 'success' });
            } catch (err) {
                setToast({ open: true, message: 'Failed to delete', type: 'error' });
            }
        }
    };

    const filteredEmployees = employees.filter(emp => 
        (emp.full_name?.toLowerCase().includes(search.toLowerCase()) || emp.emp_id?.toLowerCase().includes(search.toLowerCase()))
    );

    // Helper to extract nested department strings
    const parseDepartment = (deptData) => {
        if (!deptData) return 'General';
        if (typeof deptData === 'object') return deptData.dept || 'General';
        if (typeof deptData === 'string' && deptData.startsWith('{')) {
            try {
                return JSON.parse(deptData).dept || 'General';
            } catch (e) {}
        }
        return deptData;
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Building2 size={32} /> Internal Employees
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isAdmin ? 'Manage CRM staff access, roles, and onboarding.' : 'Your employee profile view.'}
                    </Typography>
                </Box>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<UserPlus size={20} />}
                        onClick={() => setOpenAddModal(true)}
                        sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 800, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                    >
                        + Add Employee
                    </Button>
                )}
            </Box>

            {/* Search */}
            {isAdmin && (
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField 
                        placeholder="Search by ID, Name or Role..." 
                        size="small" 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        sx={{ flexGrow: 1 }}
                    />
                </Paper>
            )}

            {/* Employee Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
                ) : (
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Employee ID</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Full Name</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Role & Dept</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Contact Info</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Created Date</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                                {isAdmin && <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmployees.map((emp) => (
                                <TableRow key={emp.id} hover>
                                    <TableCell>
                                        <Chip label={emp.emp_id || 'LEGACY'} size="small" sx={{ fontWeight: 800, color: 'primary.main', bgcolor: '#f1f5f9' }} />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'white', fontWeight: 800, fontSize: '0.875rem' }}>
                                                {emp.full_name?.charAt(0) || <User size={16} />}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{emp.full_name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Chip label={emp.role} size="small" sx={{ fontWeight: 700, bgcolor: emp.role?.includes('Admin') ? 'error.light' : 'primary.light', color: emp.role?.includes('Admin') ? 'error.dark' : 'primary.dark' }} />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{parseDepartment(emp.department)}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, fontWeight: 600 }}>
                                            <Mail size={12} /> {emp.email || 'N/A'}
                                        </Typography>
                                        {emp.phone && (
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                                N/A
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'Unknown'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label="Active" size="small" color="success" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                {emp.role !== 'Super Admin' && (
                                                    <Tooltip title="Revoke Access (Delete)">
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(emp.id)}><Trash2 size={16} /></IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            {/* Add Employee Modal */}
            <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShieldCheck className="text-primary-main" size={24} /> Register System Access
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'warning.main', fontWeight: 700, bgcolor: 'warning.light', p: 1.5, borderRadius: 2 }}>
                                Employee IDs and Passwords will be securely auto-generated. Ensure email address is correct.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Full Name" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} InputProps={{ sx: { borderRadius: 3 } }}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Corporate Email Address" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} InputProps={{ sx: { borderRadius: 3 } }}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} InputProps={{ sx: { borderRadius: 3 } }}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="System Role" required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} InputProps={{ sx: { borderRadius: 3 } }}>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Loan Manager">Loan Manager</MenuItem>
                                <MenuItem value="Telecaller">Telecaller</MenuItem>
                                <MenuItem value="JV Overseas">JV Overseas</MenuItem>
                                <MenuItem value="DSA Agent">DSA Agent</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Department" required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} InputProps={{ sx: { borderRadius: 3 } }}>
                                <MenuItem value="Sales">Sales</MenuItem>
                                <MenuItem value="Operations">Operations</MenuItem>
                                <MenuItem value="Credit">Credit</MenuItem>
                                <MenuItem value="Management">Management</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAddModal(false)} sx={{ fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateEmployee} disabled={isSubmitting || !formData.full_name || !formData.email} sx={{ px: 4, borderRadius: 2, fontWeight: 800 }}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Generate Secure Link'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Invoice/Credentials Modal */}
            <Dialog open={openSuccessModal} maxWidth="sm" fullWidth disableEscapeKeyDown PaperProps={{ sx: { borderRadius: 6 } }}>
                <Box sx={{ bgcolor: 'primary.main', p: 4, color: 'white', textAlign: 'center' }}>
                    <ShieldCheck size={48} style={{ margin: '0 auto 16px auto' }} />
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>Credentials Issued</Typography>
                    <Typography variant="body2">Employee profile created securely.</Typography>
                </Box>
                <DialogContent sx={{ p: 4 }}>
                    {generatedCredentials && (
                        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 4, p: 3, bgcolor: '#f8fafc' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>EMPLOYEE ID</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>{generatedCredentials.emp_id}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>ROLE</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{generatedCredentials.role}</Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 1 }}>ONE-TIME PASSWORD</Typography>
                                    <Box sx={{ bgcolor: 'error.main', color: 'white', p: 2, borderRadius: 2, textAlign: 'center', mt: 1 }}>
                                        <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 900, letterSpacing: 3 }}>
                                            {generatedCredentials.password}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 1, textAlign: 'center', fontWeight: 700 }}>
                                        This password overrides any previous data. Do NOT lose this code.
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center',flexWrap: 'wrap', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Copy size={18} />} onClick={handleCopyCredentials} sx={{ borderRadius: 3, fontWeight: 800 }}>
                        Copy Text
                    </Button>
                    {generatedCredentials && (
                        <PDFDownloadLink
                            document={<CredentialsPDF data={generatedCredentials} />}
                            fileName={`VEDA_${generatedCredentials.emp_id}_Credentials.pdf`}
                            style={{ textDecoration: 'none' }}
                        >
                            {({ loading }) => (
                                <Button variant="contained" disabled={loading} startIcon={<Download size={18} />} sx={{ borderRadius: 3, fontWeight: 800, px: 4 }}>
                                    {loading ? 'Preparing PDF...' : 'Download PDF Document'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    )}
                    <Button onClick={() => setOpenSuccessModal(false)} sx={{ width: '100%', mt: 2, color: 'text.secondary', fontWeight: 800 }}>
                        Close & Confirm Received
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({...toast, open: false})}>
                <Alert severity={toast.type} sx={{ width: '100%' }}>{toast.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Employees;
