import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    Avatar,
    TextField,
    CircularProgress,
    Alert,
    MenuItem
} from '@mui/material';
import { User, CheckCircle2, Share2 } from 'lucide-react';
import SendToPartnerModal from '../components/SendToPartnerModal';
import { caseService, leadService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const caseStages = [
    'Lead Created',
    'Documents Collected',
    'CIBIL Checked',
    'Bank Applied',
    'Sanction Letter Received',
    'Disbursement Done',
    'Commission Received',
];

const Cases = () => {
    const { profile } = useAuth();
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [caseHistory, setCaseHistory] = useState([]);
    const [openShareModal, setOpenShareModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState('');
    const [updating, setUpdating] = useState(false);

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
            const history = await caseService.getCaseByLead(lead.id);
            setCaseHistory(history);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStageUpdate = async (stageIndex) => {
        if (!selectedLead) return;
        try {
            setUpdating(true);
            const nextStage = caseStages[stageIndex];
            await caseService.updateStage({
                lead_id: selectedLead.id,
                stage: nextStage,
                remarks: remarks || `Advanced to ${nextStage}`,
                employee_id: profile?.id
            });
            
            // Proactively update lead status if it matches high-level flow
            if (nextStage === 'Sanction Letter Received') await leadService.updateLead(selectedLead.id, { status: 'Sanctioned' });
            if (nextStage === 'Disbursement Done') await leadService.updateLead(selectedLead.id, { status: 'Disbursed' });

            setRemarks('');
            handleLeadSelect(selectedLead); // Refresh history and possibly updated lead status
        } catch (err) {
            console.error('Stage update error:', err);
            alert('Failed to update stage');
        } finally {
            setUpdating(false);
        }
    };

    const activeStep = caseHistory.length > 0 
        ? Math.max(0, caseStages.indexOf(caseHistory[0].stage)) 
        : (selectedLead ? 0 : 0);

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        Stage Tracker
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitor the detailed lifecycle milestones of every active file.
                    </Typography>
                </Box>
                <TextField
                    select
                    label="Select Active File"
                    value={selectedLead?.id || ''}
                    onChange={(e) => handleLeadSelect(leads.find(l => l.id === e.target.value))}
                    sx={{ width: 300 }}
                >
                    {leads.map(lead => (
                        <MenuItem key={lead.id} value={lead.id}>{lead.name} ({lead.status})</MenuItem>
                    ))}
                </TextField>
            </Box>

            {!selectedLead ? (
                <Alert severity="info">No active cases found. Create a lead to start tracking.</Alert>
            ) : (
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ borderRadius: 4, mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>{selectedLead.name.charAt(0)}</Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedLead.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">ID: {selectedLead.id.slice(0, 8)}</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Loan Type:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLead.loan_type}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Amount:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>₹{selectedLead.loan_amount?.toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Paper sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Tracking History</Typography>
                            <List disablePadding>
                                {caseHistory.map((item, index) => (
                                    <ListItem key={index} sx={{ px: 0, alignItems: 'flex-start' }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.stage}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{new Date(item.created_at).toLocaleDateString()}</Typography>
                                                </Box>
                                            }
                                            secondary={item.remarks}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 4, borderRadius: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>Case Timeline</Typography>
                            <Stepper activeStep={activeStep} orientation="vertical">
                                {caseStages.map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{label}</Typography>
                                        </StepLabel>
                                        <StepContent>
                                            <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    size="small"
                                                    placeholder="Add history remarks..."
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    sx={{ mb: 2, bgcolor: 'white' }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    disabled={updating}
                                                    onClick={() => handleStageUpdate(index + 1)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Mark as Completed
                                                </Button>
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                            {activeStep === caseStages.length - 1 && (
                                <Box sx={{ mt: 4, p: 3, bgcolor: '#f0fff4', borderRadius: 3, textAlign: 'center' }}>
                                    <CheckCircle2 size={48} color="#38a169" />
                                    <Typography variant="h6" sx={{ color: '#276749', mt: 1, fontWeight: 700 }}>
                                        Case Process Completed
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}
            
            <SendToPartnerModal 
                open={openShareModal} 
                onClose={() => setOpenShareModal(false)} 
                lead={selectedLead}
            />
        </Box>
    );
};

export default Cases;
