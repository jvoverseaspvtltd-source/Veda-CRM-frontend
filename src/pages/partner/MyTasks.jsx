import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Card, Grid, Chip, Button, Avatar, 
    useTheme, alpha, CircularProgress, IconButton, Tooltip,
    TextField, InputAdornment, LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ClipboardList, Clock, CheckCircle2, AlertCircle, 
    Search, Filter, ChevronRight, Calendar, 
    MessageSquare, ArrowUpRight, Sparkles
} from 'lucide-react';

const MyTasks = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Mock data for the Credit Partner tasks
    const [tasks, setTasks] = useState([
        { 
            id: 1, 
            title: 'Verify KYC Documents - Rajesh Kumar', 
            priority: 'High', 
            status: 'Pending', 
            dueDate: '2026-04-05', 
            category: 'Verification',
            description: 'Double check the PAN and Aadhar card details provided for the personal loan application.'
        },
        { 
            id: 2, 
            title: 'Update Commission Structure', 
            priority: 'Medium', 
            status: 'In Progress', 
            dueDate: '2026-04-10', 
            category: 'Admin',
            description: 'Review and sign the new commission agreement for Q2 2026.'
        },
        { 
            id: 3, 
            title: 'Respond to Query: Case #8842', 
            priority: 'High', 
            status: 'Pending', 
            dueDate: '2026-04-03', 
            category: 'Support',
            description: 'The employee needs clarification on the income proof provided for the SME loan.'
        },
        { 
            id: 4, 
            title: 'Complete Training Module', 
            priority: 'Low', 
            status: 'Completed', 
            dueDate: '2026-03-28', 
            category: 'Training',
            description: 'New standard operating procedures for digital disbursement.'
        }
    ]);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#10b981';
            default: return theme.palette.primary.main;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={18} />;
            case 'In Progress': return <Clock size={18} />;
            case 'Pending': return <AlertCircle size={18} />;
            default: return <ClipboardList size={18} />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>LOADING TASKS...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 6 }}>
            {/* Header Area */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                            <ClipboardList size={24} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>My Tasks</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Manage your operational actions and pending requirements here.
                    </Typography>
                </motion.div>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" startIcon={<Sparkles size={18} />} sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}>
                        AI Prioritize
                    </Button>
                </Box>
            </Box>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Efficiency Rate</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5, mb: 1 }}>84%</Typography>
                            <LinearProgress variant="determinate" value={84} sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }} />
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Pending High Priority</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5, color: '#ef4444' }}>2</Typography>
                        <Typography variant="caption" color="text.secondary">Requires immediate attention</Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Next Deadline</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>Tommorrow</Typography>
                        <Typography variant="caption" color="text.secondary">Responding to Case #8842</Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Tasks List */}
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Action Items <Chip label={tasks.length} size="small" sx={{ fontWeight: 900, height: 20 }} />
            </Typography>

            <Grid container spacing={2}>
                <AnimatePresence>
                    {tasks.map((task, index) => (
                        <Grid item xs={12} key={task.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card sx={{ 
                                    p: 2.5, 
                                    borderRadius: 3.5, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 3,
                                    transition: 'all 0.2s',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { 
                                        borderColor: theme.palette.primary.main,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}>
                                    <Box sx={{ 
                                        width: 50, height: 50, borderRadius: '50%', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        bgcolor: alpha(getPriorityColor(task.priority), 0.1),
                                        color: getPriorityColor(task.priority)
                                    }}>
                                        {getStatusIcon(task.status)}
                                    </Box>
                                    
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{task.title}</Typography>
                                            <Chip 
                                                label={task.priority} 
                                                size="small" 
                                                sx={{ 
                                                    height: 18, 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: 900, 
                                                    bgcolor: alpha(getPriorityColor(task.priority), 0.1),
                                                    color: getPriorityColor(task.priority),
                                                    border: '1px solid',
                                                    borderColor: alpha(getPriorityColor(task.priority), 0.2)
                                                }} 
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>{task.description}</Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                <Calendar size={14} color={theme.palette.text.secondary} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{task.dueDate}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                <Typography variant="caption" sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 700 }}>{task.category}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                <MessageSquare size={14} color={theme.palette.text.secondary} />
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>2 notes</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    
                                    <Box>
                                        <Button 
                                            variant="outlined" 
                                            endIcon={<ChevronRight size={16} />}
                                            sx={{ borderRadius: 2, fontWeight: 700, borderColor: 'divider' }}
                                        >
                                            Resolve
                                        </Button>
                                    </Box>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>
        </Box>
    );
};

export default MyTasks;
