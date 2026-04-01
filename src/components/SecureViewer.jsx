import React, { useEffect } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { Shield, Eye, Lock, RefreshCw, X } from 'lucide-react';

const SecureViewer = ({ url, title, onClose }) => {
    
    useEffect(() => {
        // Disable Right Click
        const handleContextMenu = (e) => e.preventDefault();
        
        // Disable Print / Screenshot key
        const handleKeyDown = (e) => {
            if (e.ctrlKey && (e.key === 'p' || e.key === 's')) {
                e.preventDefault();
                alert('Printing and screenshots are disabled for security reasons.');
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <Box 
            sx={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                bgcolor: 'rgba(0,0,0,0.9)', 
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none' // Disable text selection
            }}
        >
            {/* Toolbar */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a202c', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Shield size={20} color="#48bb78" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
                    <Box sx={{ ml: 2, display: 'flex', gap: 1, alignItems: 'center', opacity: 0.7 }}>
                        <Lock size={14} />
                        <Typography variant="caption">Secure View Only</Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <X size={24} />
                </IconButton>
            </Box>

            {/* Viewer Area */}
            <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', p: 4 }}>
                {/* Watermark Overlay */}
                <Box 
                    sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        zIndex: 10, 
                        pointerEvents: 'none',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gridTemplateRows: 'repeat(4, 1fr)',
                        opacity: 0.1
                    }}
                >
                    {[...Array(16)].map((_, i) => (
                        <Box key={i} sx={{ transform: 'rotate(-45deg)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}>VEDA LOANS CONFIDENTIAL</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Content */}
                <Paper 
                    elevation={24} 
                    sx={{ 
                        width: '100%', 
                        maxWidth: '900px', 
                        height: '100%', 
                        bgcolor: 'white', 
                        borderRadius: 2, 
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 5
                    }}
                >
                    {/* Mock document content or iframe */}
                    <Box sx={{ p: 10, textAlign: 'center' }}>
                        <FileText size={120} color="#cbd5e0" style={{ marginBottom: 24 }} />
                        <Typography variant="h5" color="text.secondary">Document Preview Restricted</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            This document is encrypted and can only be viewed in this session. 
                            Downloading and sharing are strictly prohibited.
                        </Typography>
                        <Box sx={{ mt: 10, opacity: 0.3 }}>
                            {/* Realistic looking mock text */}
                            <Box sx={{ h: 20, bgcolor: '#edf2f7', mb: 2, borderRadius: 1 }} />
                            <Box sx={{ h: 20, bgcolor: '#edf2f7', mb: 2, borderRadius: 1, w: '80%', mx: 'auto' }} />
                            <Box sx={{ h: 20, bgcolor: '#edf2f7', mb: 2, borderRadius: 1 }} />
                            <Box sx={{ h: 20, bgcolor: '#edf2f7', mb: 2, borderRadius: 1, w: '90%', mx: 'auto' }} />
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Print protection CSS */}
            <style>
                {`
                    @media print {
                        body { display: none; }
                    }
                    div {
                        -webkit-touch-callout: none;
                        -webkit-user-select: none;
                        -khtml-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                    }
                `}
            </style>
        </Box>
    );
};

export default SecureViewer;
