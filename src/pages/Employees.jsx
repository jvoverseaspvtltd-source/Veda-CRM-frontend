import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { UserPlus, Edit, Trash2, Shield, Mail, Phone, Building2 } from 'lucide-react';
import { authService } from '../services/api';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'Telecaller',
        department: 'Sales',
        phone: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await authService.getAllProfiles();
            setEmployees(data);
        } catch (err) {
            console.error('Failed to fetch employees', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (emp = null) => {
        if (emp) {
            setFormData({
                full_name: emp.full_name,
                email: emp.email || '',
                password: '', // Don't show password
                role: emp.role,
                department: emp.department || 'Sales',
                phone: emp.phone || ''
            });
            setSelectedId(emp.id);
            setEditMode(true);
        } else {
            setFormData({
                full_name: '',
                email: '',
                password: '',
                role: 'Telecaller',
                department: 'Sales',
                phone: ''
            });
            setEditMode(false);
        }
        setOpenModal(true);
    };

    const handleSubmit = async () => {
        try {
            if (editMode) {
                await authService.updateProfile(selectedId, formData);
            } else {
                await authService.login(formData.email, formData.password); // Placeholder for register
                // Actually need register call here:
                await authService.register(formData); 
            }
            setOpenModal(false);
            fetchEmployees();
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee? This will also remove their login access.')) {
            try {
                await authService.deleteUser(id);
                fetchEmployees();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Super Admin': return 'error';
            case 'Admin': return 'warning';
            case 'Loan Manager': return 'primary';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        Internal Employees
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage CRM user access and department assignments
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<UserPlus size={20} />}
                    onClick={() => handleOpenModal()}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Add Employee
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
                ) : (
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.map((emp) => (
                                <TableRow key={emp.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                                {emp.full_name?.charAt(0)}
                                            </Box>
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{emp.full_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={emp.role} 
                                            size="small" 
                                            color={getRoleColor(emp.role)}
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </TableCell>
                                    <TableCell>{emp.department || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip label="Active" size="small" variant="outlined" color="success" sx={{ fontWeight: 700 }} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit Details">
                                            <IconButton size="small" onClick={() => handleOpenModal(emp)}><Edit size={18} /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remove Employee">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(emp.id)}><Trash2 size={18} /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid size={12}>
                            <TextField fullWidth label="Full Name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                        </Grid>
                        {!editMode && (
                            <Grid size={12}>
                                <TextField fullWidth label="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </Grid>
                        )}
                        {!editMode && (
                            <Grid size={12}>
                                <TextField fullWidth type="password" label="Initial Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select fullWidth label="Role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                <MenuItem value="Super Admin">Super Admin</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Loan Manager">Loan Manager</MenuItem>
                                <MenuItem value="Telecaller">Telecaller</MenuItem>
                                <MenuItem value="JV Overseas">JV Overseas</MenuItem>
                                <MenuItem value="DSA Agent">DSA Agent</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select fullWidth label="Department" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                                <MenuItem value="Sales">Sales</MenuItem>
                                <MenuItem value="Operations">Operations</MenuItem>
                                <MenuItem value="Management">Management</MenuItem>
                                <MenuItem value="Credit">Credit</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ px: 4, borderRadius: 2 }}>{editMode ? 'Update' : 'Register'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Employees;
