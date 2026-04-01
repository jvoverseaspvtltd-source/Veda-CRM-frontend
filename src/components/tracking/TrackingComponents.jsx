import React, { useState } from 'react';
import {
    Box, Typography, Card, alpha, useTheme, Button, IconButton,
    Collapse, Divider, Tooltip, Chip, Badge, Avatar, Stack, Grid, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileArchive, User, FileText, CheckCircle, XCircle, 
    MessageSquare, ChevronDown, ChevronUp, Eye, Download, 
    Lock, ShieldCheck, AlertTriangle, Clock, Building, Zap,
    File, Image as ImageIcon, Table, FileEdit, Shield, Trash2
} from 'lucide-react';

const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return <FileText size={18} />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp': return <ImageIcon size={18} />;
        case 'xlsx':
        case 'xls':
        case 'csv': return <Table size={18} />;
        case 'doc':
        case 'docx': return <FileEdit size={18} />;
        case 'zip':
        case 'rar':
        case '7z': return <FileArchive size={18} />;
        default: return <File size={18} />;
    }
};

export const StatusBadge = ({ status }) => {
    const theme = useTheme();
    const config = {
        'Pending': { color: 'warning', icon: <Clock size={14} />, label: 'PENDING' },
        'Accepted': { color: 'success', icon: <CheckCircle size={14} />, label: 'ACCEPTED' },
        'Rejected': { color: 'error', icon: <XCircle size={14} />, label: 'REJECTED' },
        'Under Review': { color: 'info', icon: <Zap size={14} />, label: 'REVIEWING' }
    };

    const current = config[status] || config['Pending'];

    return (
        <Chip 
            icon={current.icon}
            label={current.label}
            size="small"
            color={current.color}
            sx={{ 
                fontWeight: 900, 
                height: 24, 
                px: 1,
                fontSize: '0.65rem',
                letterSpacing: 1,
                borderRadius: 1.5,
                boxShadow: `0 4px 12px ${alpha(theme.palette[current.color].main, 0.2)}`
            }} 
        />
    );
};

export const UploadedByBadge = ({ uploadedBy }) => {
    const isVeda = uploadedBy === 'Veda';
    return (
        <Chip 
            size="small"
            icon={isVeda ? <Shield size={10} /> : <Building size={10} />}
            label={isVeda ? 'VEDA' : 'CREDIT PARTNER'}
            sx={{ 
                fontWeight: 800, 
                height: 20, 
                fontSize: '0.6rem',
                bgcolor: isVeda ? alpha('#6366f1', 0.1) : alpha('#10b981', 0.1),
                color: isVeda ? '#6366f1' : '#10b981',
                '& .MuiChip-icon': { color: 'inherit' }
            }}
        />
    );
};

export const DocumentCard = ({ 
    doc, 
    onPreview, 
    onDownload, 
    onDownloadRequest,
    onDelete,
    onSelect, 
    isSelected,
    isVedaView = false,
    uploadedBy = 'Credit Partner',
    canDelete = false
}) => {
    const theme = useTheme();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    const isRejected = doc.status === 'Rejected';
    const isAccepted = doc.status === 'Accepted';
    const isCreditPartnerFile = uploadedBy === 'Credit Partner';
    const isVedaFile = uploadedBy === 'Veda';
    const hasDownloadAccess = doc.download_granted;

    return (
        <>
            <Card sx={{ 
                p: 2, borderRadius: 4, border: '1px solid', 
                borderColor: isRejected ? 'error.main' : isAccepted ? 'success.main' : 'divider',
                background: isAccepted ? alpha(theme.palette.success.main, 0.02) : isRejected ? alpha(theme.palette.error.main, 0.02) : '#fff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] }
            }}>
                {onSelect && (
                    <Box sx={{ position: 'absolute', top: 8, right: canDelete ? 48 : 8, zIndex: 10 }}>
                        <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => onSelect(doc.id)}
                            style={{ width: 16, height: 16, cursor: 'pointer' }}
                        />
                    </Box>
                )}

                {canDelete && (
                    <Tooltip title="Delete file">
                        <IconButton 
                            size="small" 
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) }}
                        >
                            <Trash2 size={14} />
                        </IconButton>
                    </Tooltip>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, pr: onSelect || canDelete ? 5 : 0 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 32, height: 32 }}>
                        {getFileIcon(doc.file_name)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={800} noWrap sx={{ maxWidth: '55%' }}>{doc.file_name}</Typography>
                            <UploadedByBadge uploadedBy={uploadedBy} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {doc.file_type?.toUpperCase()} • <StatusBadge status={doc.status} />
                        </Typography>
                    </Box>
                </Box>

                {isRejected && doc.rejection_note && (
                    <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderLeft: '4px solid', borderColor: 'error.main' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'error.main', display: 'block', mb: 0.5 }}>REJECTION NOTE:</Typography>
                        <Typography variant="caption" color="text.secondary">{doc.rejection_note}</Typography>
                    </Box>
                )}

                <Stack direction="row" spacing={1}>
                    {onPreview && (
                        <Tooltip title="View document">
                            <Button size="small" variant="outlined" onClick={() => onPreview(doc)} startIcon={<Eye size={14}/>} sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}>View</Button>
                        </Tooltip>
                    )}
                    
                    {/* VEDA VIEW - Credit Partner uploaded files */}
                    {isVedaView && isCreditPartnerFile && (
                        <Tooltip title="Download directly (No approval needed)">
                            <Button size="small" variant="contained" color="success" onClick={() => onDownload?.(doc)} startIcon={<Download size={14}/>} sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}>
                                Download
                            </Button>
                        </Tooltip>
                    )}

                    {/* VEDA VIEW - Veda uploaded files */}
                    {isVedaView && isVedaFile && (
                        <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
                            <Tooltip title="Accept">
                                <IconButton size="small" color="success" sx={{ border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.3), flex: 1 }}>
                                    <CheckCircle size={16} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                                <IconButton size="small" color="error" sx={{ border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.3), flex: 1 }}>
                                    <XCircle size={16} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}

                    {/* CREDIT PARTNER VIEW */}
                    {!isVedaView && (
                        isCreditPartnerFile ? (
                            hasDownloadAccess ? (
                                <Tooltip title="Download approved">
                                    <Button size="small" variant="contained" color="success" onClick={() => onDownload?.(doc)} startIcon={<Download size={14}/>} sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}>
                                        Download
                                    </Button>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Request permission to download">
                                    <Button size="small" variant="outlined" color="warning" onClick={() => onDownloadRequest?.(doc.id)} startIcon={<Lock size={14}/>} sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}>
                                        Request Download
                                    </Button>
                                </Tooltip>
                            )
                        ) : (
                            <Tooltip title="Download">
                                <Button size="small" variant="contained" color="primary" onClick={() => onDownload?.(doc)} startIcon={<Download size={14}/>} sx={{ borderRadius: 2, fontWeight: 700, flex: 1 }}>
                                    Download
                                </Button>
                            </Tooltip>
                        )
                    )}
                </Stack>
            </Card>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Trash2 size={20} color={theme.palette.error.main} />
                    Delete File
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Are you sure you want to delete <strong>"{doc.file_name}"</strong>?
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => { onDelete?.(doc.id); setDeleteDialogOpen(false); }} sx={{ fontWeight: 700 }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export const StudentCard = ({ 
    student, 
    onPreview, 
    onDownload,
    onDownloadRequest,
    onDelete,
    onSelect, 
    selectedIds,
    isVedaView = false,
    uploadedBy = 'Credit Partner',
    canDelete = false
}) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);

    return (
        <Card sx={{ p: 2.5, borderRadius: 5, border: '1px solid', borderColor: 'divider', bgcolor: alpha('#f8fafc', 0.5) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', color: '#fff', width: 44, height: 44 }}>
                    <User size={22} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={800}>{student.student_name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {student.tracking_documents?.length || 0} Documents • Uploaded by: <UploadedByBadge uploadedBy={uploadedBy} />
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <StatusBadge status={student.status} />
                    <Button variant="text" size="small" onClick={() => setExpanded(!expanded)} endIcon={expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} sx={{ fontWeight: 800 }}>
                        {expanded ? 'Hide' : 'View Files'}
                    </Button>
                </Box>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Grid container spacing={2}>
                        {student.tracking_documents?.map(doc => (
                            <Grid size={12} sm={6} lg={4} key={doc.id}>
                                <DocumentCard 
                                    doc={doc} 
                                    onPreview={onPreview} 
                                    onDownload={onDownload}
                                    onDownloadRequest={onDownloadRequest}
                                    onDelete={onDelete}
                                    onSelect={onSelect}
                                    isSelected={selectedIds?.has(doc.id)}
                                    isVedaView={isVedaView}
                                    uploadedBy={uploadedBy}
                                    canDelete={canDelete}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Collapse>
        </Card>
    );
};

export const PackageCard = ({ 
    pkg, 
    onPreview, 
    onDownload,
    onDownloadRequest,
    onDelete,
    onDeletePackage,
    onOpenChat, 
    partners, 
    onSelect, 
    selectedIds,
    isVedaView = false,
    uploadedBy = 'Credit Partner',
    canDelete = false
}) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    const isIncoming = pkg.direction === 'incoming';
    const senderName = isVedaView 
        ? partners?.find(p => p.id === pkg.sender_id)?.name || 'Credit Partner'
        : 'Veda CRM';

    return (
        <>
            <Card sx={{ 
                borderRadius: 6, border: '1px solid', borderColor: 'divider', overflow: 'visible',
                background: `linear-gradient(135deg, #ffffff 0%, ${alpha(isIncoming ? theme.palette.primary.main : theme.palette.error.main, 0.03)} 100%)`,
                position: 'relative',
                mb: 3,
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
            }}>
                <Box sx={{ position: 'absolute', top: -14, left: 32, display: 'flex', gap: 1.5 }}>
                    <Chip 
                        label={isIncoming ? 'INCOMING' : 'OUTGOING'} 
                        size="small" 
                        sx={{ 
                            fontWeight: 900, 
                            bgcolor: isIncoming ? alpha('#10b981', 0.9) : alpha('#8b5cf6', 0.9), 
                            color: '#fff',
                            boxShadow: theme.shadows[2] 
                        }} 
                    />
                    <Chip 
                        label={pkg.status || 'New'} 
                        size="small" 
                        variant="contained" 
                        color="primary" 
                        sx={{ fontWeight: 900, boxShadow: theme.shadows[2] }} 
                    />
                </Box>

                {canDelete && onDeletePackage && (
                    <Tooltip title="Delete entire package">
                        <IconButton 
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                zIndex: 10, 
                                color: 'error.main', 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                            }}
                        >
                            <Trash2 size={18} />
                        </IconButton>
                    </Tooltip>
                )}

                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', pt: 4 }}>
                    <Box sx={{ p: 2, borderRadius: 4, bgcolor: alpha(isIncoming ? theme.palette.primary.main : theme.palette.error.main, 0.1), color: isIncoming ? theme.palette.primary.main : theme.palette.error.main }}>
                        <FileArchive size={28} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={900}>{pkg.package_name}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {isIncoming ? 'From' : 'To'}: {senderName} • {new Date(pkg.created_at).toLocaleString()}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {onOpenChat && (
                            <Tooltip title="Secure Chat">
                                <IconButton onClick={onOpenChat} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                    <MessageSquare size={18} color={theme.palette.primary.main} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Button 
                            endIcon={expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>} 
                            onClick={() => setExpanded(!expanded)} 
                            sx={{ fontWeight: 900, borderRadius: 4, px: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                        >
                            {expanded ? 'HIDE' : `${pkg.tracking_students?.length || 0} Students`}
                        </Button>
                    </Box>
                </Box>

            <Collapse in={expanded}>
                <Divider />
                <Box sx={{ p: 4, bgcolor: alpha(theme.palette.divider, 0.02) }}>
                    <AnimatePresence>
                        {expanded && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                <Grid container spacing={3}>
                                    {pkg.tracking_students?.length > 0 ? (
                                        pkg.tracking_students.map(student => (
                                            <Grid size={12} key={student.id}>
                                                <StudentCard 
                                                    student={student} 
                                                    onPreview={onPreview} 
                                                    onDownload={onDownload}
                                                    onDownloadRequest={onDownloadRequest}
                                                    onDelete={onDelete}
                                                    onSelect={onSelect}
                                                    selectedIds={selectedIds}
                                                    isVedaView={isVedaView}
                                                    uploadedBy={uploadedBy}
                                                    canDelete={canDelete}
                                                />
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid size={12}>
                                            <Box sx={{ p: 6, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.4), borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                                                <AlertTriangle size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
                                                <Typography variant="h6" fontWeight={800} color="text.secondary">No Documents Found</Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            </Collapse>
            </Card>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Trash2 size={20} color={theme.palette.error.main} />
                    Delete Package
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Are you sure you want to delete the entire package <strong>"{pkg.package_name}"</strong>?
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
                        This will delete all {pkg.tracking_students?.length || 0} students and their documents. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => { onDeletePackage?.(pkg.id); setDeleteDialogOpen(false); }} sx={{ fontWeight: 700 }}>
                        Delete Package
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// Backward compatibility aliases
export const DocumentDecisionCard = DocumentCard;
export const StudentDecisionCard = StudentCard;
export const InteractivePackageCard = PackageCard;
