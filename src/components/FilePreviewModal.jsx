import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    CircularProgress,
    alpha,
    useTheme,
    Chip
} from '@mui/material';
import { X, FileText, ShieldAlert } from 'lucide-react';

const FilePreviewModal = ({ open, onClose, fileUrl, fileName, fileType }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const docxContainerRef = useRef(null);
    const xlsxContainerRef = useRef(null);

    const ext = fileType?.toLowerCase();
    const isDocx = ['docx', 'doc'].includes(ext);
    const isXlsx = ['xlsx', 'xls'].includes(ext);
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    const isPdf = ext === 'pdf';

    useEffect(() => {
        if (!open || !fileUrl) return;
        setLoading(true);
        setError(null);

        const renderDoc = async () => {
            try {
                // Fetch file as ArrayBuffer - no Content-Disposition download header
                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error('Failed to fetch file');
                const arrayBuffer = await response.arrayBuffer();

                if (isDocx) {
                    const { renderAsync } = await import('docx-preview');
                    if (docxContainerRef.current) {
                        docxContainerRef.current.innerHTML = '';
                        await renderAsync(arrayBuffer, docxContainerRef.current, null, {
                            className: 'docx-viewer',
                            inWrapper: true,
                            ignoreWidth: false,
                            ignoreHeight: false,
                            ignoreFonts: false,
                            breakPages: true,
                            debug: false,
                        });
                    }
                } else if (isXlsx) {
                    const XLSX = await import('xlsx');
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const html = XLSX.utils.sheet_to_html(sheet, { editable: false });

                    if (xlsxContainerRef.current) {
                        xlsxContainerRef.current.innerHTML = `
                            <div style="overflow:auto; width:100%; height:100%; padding: 16px;">
                                <style>
                                    table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 13px; }
                                    td, th { border: 1px solid #e0e0e0; padding: 6px 12px; text-align: left; }
                                    th { background: #f5f5f5; font-weight: 600; }
                                    tr:nth-child(even) { background: #fafafa; }
                                </style>
                                ${html}
                            </div>`;
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Render error:', err);
                setError('Could not render document preview. ' + err.message);
                setLoading(false);
            }
        };

        if (isDocx || isXlsx) {
            renderDoc();
        } else {
            setLoading(false);
        }
    }, [open, fileUrl, isDocx, isXlsx]);

    // Reset on close
    useEffect(() => {
        if (!open) {
            setLoading(true);
            setError(null);
        }
    }, [open]);

    if (!fileUrl) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    height: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, display: 'flex', color: 'primary.main' }}>
                        <FileText size={20} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{fileName}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                icon={<ShieldAlert size={12} />}
                                label="View Only — Download Requires Permission"
                                size="small"
                                sx={{ bgcolor: '#fef3c7', color: '#92400e', fontSize: '0.65rem', height: 20 }}
                            />
                        </Box>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, flexGrow: 1, position: 'relative', bgcolor: '#f8fafc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {loading && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: '#f8fafc', zIndex: 10 }}>
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">Rendering document...</Typography>
                    </Box>
                )}

                {error && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="error">{error}</Typography>
                    </Box>
                )}

                {/* DOCX Native Renderer */}
                {isDocx && (
                    <Box
                        ref={docxContainerRef}
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            bgcolor: '#fff',
                            '& .docx-viewer': { padding: '24px', maxWidth: '900px', margin: '0 auto' }
                        }}
                    />
                )}

                {/* XLSX Native Renderer */}
                {isXlsx && (
                    <Box
                        ref={xlsxContainerRef}
                        sx={{ flex: 1, overflow: 'auto', bgcolor: '#fff' }}
                    />
                )}

                {/* PDF — toolbar disabled via URL parameter */}
                {isPdf && (
                    <iframe
                        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        title="PDF Viewer"
                        style={{ border: 'none', flex: 1 }}
                    />
                )}

                {/* Images */}
                {isImage && (
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', p: 4 }}>
                        <img
                            src={fileUrl}
                            alt={fileName}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </Box>
                )}

                {/* Unknown format */}
                {!isDocx && !isXlsx && !isPdf && !isImage && !loading && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={64} color="#bbb" />
                        <Typography variant="h6" sx={{ mt: 2 }}>Cannot Preview This Format</Typography>
                        <Typography variant="body2" color="text.secondary">Use the Download button (permission required) to open this file.</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default FilePreviewModal;
