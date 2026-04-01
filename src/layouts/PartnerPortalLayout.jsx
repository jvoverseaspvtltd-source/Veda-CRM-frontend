import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Typography, IconButton, Avatar,
    Tooltip, Drawer, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Divider, useTheme, alpha, useMediaQuery, Chip
} from '@mui/material';
import {
    LayoutDashboard, UserCircle, Headphones, BadgeDollarSign,
    TrendingUp, MessageSquare, Settings,
    LogOut, Menu, X, Building2
} from 'lucide-react';
import { usePartnerAuth } from '../context/PartnerAuthContext';

const SIDEBAR_WIDTH = 240;

const NAV_ITEMS = [
    { label: 'Dashboard',       path: '/partner/dashboard',    icon: LayoutDashboard },
    { label: 'My Profile',      path: '/partner/profile',      icon: UserCircle },
    { label: 'Chat',            path: '/partner/chat',        icon: MessageSquare },
    { label: 'Help Desk',       path: '/partner/help-desk',    icon: Headphones },
    { label: 'Commissions',     path: '/partner/commissions',  icon: BadgeDollarSign },
    { label: 'Performance',     path: '/partner/performance',  icon: TrendingUp },
    { label: 'Settings',        path: '/partner/settings',     icon: Settings },
];

const PartnerPortalLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { partner, logout, loading } = usePartnerAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    React.useEffect(() => {
        if (!loading && !partner && location.pathname !== '/partner/login') {
            navigate('/partner/login', { replace: true });
        }
    }, [partner, loading, location.pathname, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/partner/login');
    };

    if (loading) return null;
    if (!partner && location.pathname !== '/partner/login') return null;

    const isActive = (path) => location.pathname === path;

    const SidebarContent = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <Box sx={{ px: 2.5, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -0.5, lineHeight: 1.2 }}>
                    VEDA LOANS
                </Typography>
                <Chip
                    label="Credit Partners Portal"
                    size="small"
                    sx={{ mt: 0.8, fontWeight: 700, fontSize: '0.65rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', height: 20 }}
                />
            </Box>

            {/* Partner Info */}
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, fontWeight: 800, fontSize: '1rem' }}>
                        {partner?.name?.charAt(0) || 'P'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {partner?.name || 'Credit Partner'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Building2 size={11} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {partner?.bank_name || 'Partner Bank'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Nav Items */}
            <List sx={{ flex: 1, px: 1.5, py: 1.5, overflow: 'auto' }}>
                {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                    <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => { navigate(path); if (isMobile) setMobileOpen(false); }}
                            selected={isActive(path)}
                            sx={{
                                borderRadius: 2.5,
                                py: 1,
                                px: 1.5,
                                '&.Mui-selected': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                                    '& .MuiListItemText-primary': { fontWeight: 800 },
                                },
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: isActive(path) ? 'primary.main' : 'text.secondary' }}>
                                <Icon size={18} />
                            </ListItemIcon>
                            <ListItemText
                                primary={label}
                                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive(path) ? 800 : 600 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* Logout */}
            <Box sx={{ px: 1.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{ borderRadius: 2.5, py: 1, px: 1.5, color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) } }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
                        <LogOut size={18} />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 700 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7fa' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Box
                    sx={{
                        width: SIDEBAR_WIDTH,
                        flexShrink: 0,
                        bgcolor: 'white',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        zIndex: 1200,
                        overflowY: 'auto',
                    }}
                >
                    <SidebarContent />
                </Box>
            )}

            {/* Mobile Drawer */}
            <Drawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={() => setMobileOpen(false)}><X size={20} /></IconButton>
                </Box>
                <SidebarContent />
            </Drawer>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`, display: 'flex', flexDirection: 'column' }}>
                {/* Top bar (mobile only) */}
                {isMobile && (
                    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Toolbar sx={{ justifyContent: 'space-between' }}>
                            <IconButton onClick={() => setMobileOpen(true)}><Menu size={22} /></IconButton>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>VEDA LOANS</Typography>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14, fontWeight: 700 }}>
                                {partner?.name?.charAt(0) || 'P'}
                            </Avatar>
                        </Toolbar>
                    </AppBar>
                )}

                {/* Page Content */}
                <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
                    <Outlet />
                </Box>

                {/* Footer */}
                <Box sx={{ py: 2.5, textAlign: 'center', bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        © 2026 Veda Loans & Finance — Secure Credit Partner Environment
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default PartnerPortalLayout;
