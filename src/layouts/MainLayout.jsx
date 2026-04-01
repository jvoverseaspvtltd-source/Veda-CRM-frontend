import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    Badge,
    Button,
    useTheme,
    useMediaQuery,
    alpha,
} from '@mui/material';
import {
    Bell,
    Menu as MenuIcon,
    X,
    LayoutDashboard,
    Users,
    Briefcase,
    Building2,
    DollarSign,
    LogOut,
    Settings,
    TrendingUp,
    Handshake,
    FolderKanban,
    Globe,
    Activity,
    FolderInput,
    FolderOutput,
    Target,
    ChevronLeft,
    ChevronRight,
    LifeBuoy,
    FileArchive,
    MessageSquareDiff,
    Trash2
} from 'lucide-react';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 68;

const MainLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

    // On mobile: drawer is closed by default (overlay mode)
    // On desktop: drawer is open by default (persistent mode)
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getAll();
            setNotifications(data);
        } catch (err) {
            // Silent fail for polling
        }
    }, []);

    useEffect(() => {
        if (!profile) return;
        fetchNotifications();
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') fetchNotifications();
        }, 30000);
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') fetchNotifications();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [profile, fetchNotifications]);

    const handleMobileToggle = () => setMobileOpen(prev => !prev);
    const handleDesktopToggle = () => setDesktopCollapsed(prev => !prev);

    const handleMenuClose = () => {
        setAnchorEl(null);
        setNotifAnchorEl(null);
    };

    const handleMarkRead = async (id, link) => {
        await notificationService.markRead(id);
        fetchNotifications();
        if (link) { handleMenuClose(); navigate(link); }
    };

    const handleMarkAllRead = async () => {
        await notificationService.markAllRead();
        fetchNotifications();
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const handleNav = useCallback((path) => {
        navigate(path);
        if (isMobile) setMobileOpen(false);
    }, [navigate, isMobile]);

    const role = profile?.role || 'Super Admin';

    const menuItems = [
        { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager', 'Telecaller', 'JV Overseas', 'DSA Agent', 'Partner'] },
        { text: 'Online Submissions', icon: <Globe size={20} />, path: '/forms', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager', 'Telecaller'] },
        { text: 'Application Registry', icon: <Briefcase size={20} />, path: '/leads', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager', 'Telecaller', 'JV Overseas', 'DSA Agent', 'Partner'] },
        { text: 'Stage Tracker', icon: <Activity size={20} />, path: '/cases', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager', 'JV Overseas'] },
        { text: 'Disbursement Desk', icon: <FolderKanban size={20} />, path: '/applications', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager', 'JV Overseas'] },
        { text: 'Eligibility Hub', icon: <Target size={20} />, path: '/eligibility-hub', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager'] },
        { text: 'Banks', icon: <Building2 size={20} />, path: '/banks', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager'] },

        { text: 'Commissions', icon: <DollarSign size={20} />, path: '/commissions', roles: ['Super Admin', 'Admin', 'Partner'] },
        { text: 'Credit Partners', icon: <Handshake size={20} />, path: '/lending-partners', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager', 'JV Overseas', 'DSA Agent', 'Telecaller', 'Partner'] },
        { text: 'Employees', icon: <Users size={20} />, path: '/employees', roles: ['Super Admin', 'Admin'] },
        { text: 'Performance', icon: <TrendingUp size={20} />, path: '/performance', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Partner'] },
        { text: 'Settings', icon: <Settings size={20} />, path: '/settings', roles: ['Super Admin', 'Admin', 'Partner'] },
        { text: 'Tracking Analytics', icon: <TrendingUp size={20} />, path: '/tracking-dashboard', roles: ['Super Admin', 'Admin'] },
        { text: 'Chat', icon: <MessageSquareDiff size={20} />, path: role === 'Partner' ? '/partner/chat' : '/veda/chat', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Partner'] },
        { text: 'Help Desk', icon: <LifeBuoy size={20} />, path: '/help-desk', roles: ['Super Admin', 'Admin', 'Normal Employee', 'Loan Manager', 'Telecaller', 'JV Overseas', 'DSA Agent', 'Partner'] },
        { text: 'Trash', icon: <Trash2 size={20} />, path: '/trash', roles: ['Super Admin', 'Admin'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(role));

    // On desktop, sidebar can be collapsed to icon-only
    const sidebarWidth = isMobile ? DRAWER_WIDTH : desktopCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
    const showText = !desktopCollapsed || isMobile;
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const DrawerContent = () => (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Sidebar Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: desktopCollapsed && !isMobile ? 'center' : 'space-between',
                    px: desktopCollapsed && !isMobile ? 1 : 2,
                    py: 2,
                    minHeight: 64,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {showText && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                        <img src="/logo-bgremove.png" alt="Logo" style={{ height: 28, objectFit: 'contain', flexShrink: 0 }} />
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 800,
                                color: 'primary.main',
                                letterSpacing: -0.5,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            Veda Loans
                        </Typography>
                    </Box>
                )}
                {!isMobile ? (
                    <IconButton
                        onClick={handleDesktopToggle}
                        size="small"
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1.5,
                            p: 0.5,
                            flexShrink: 0,
                        }}
                    >
                        {desktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </IconButton>
                ) : (
                    <IconButton onClick={handleMobileToggle} size="small">
                        <X size={20} />
                    </IconButton>
                )}
            </Box>

            {/* Nav Items */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, px: 1 }}>
                <List disablePadding>
                    {filteredMenu.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                <Tooltip
                                    title={desktopCollapsed && !isMobile ? item.text : ''}
                                    placement="right"
                                    arrow
                                >
                                    <ListItemButton
                                        onClick={() => handleNav(item.path)}
                                        selected={isActive}
                                        sx={{
                                            minHeight: 44,
                                            borderRadius: 2,
                                            justifyContent: desktopCollapsed && !isMobile ? 'center' : 'initial',
                                            px: desktopCollapsed && !isMobile ? 1 : 1.5,
                                            transition: 'all 0.15s ease',
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'primary.dark' },
                                                '& .MuiListItemIcon-root': { color: 'white' },
                                                '& .MuiListItemText-primary': { color: 'white' },
                                            },
                                            '&:hover:not(.Mui-selected)': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: desktopCollapsed && !isMobile ? 0 : 1.5,
                                                color: isActive ? 'white' : 'text.secondary',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        {showText && (
                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: isActive ? 700 : 500,
                                                    noWrap: true,
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Bottom user quick info */}
            <Box
                sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    p: desktopCollapsed && !isMobile ? 1 : 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    justifyContent: desktopCollapsed && !isMobile ? 'center' : 'initial',
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: 'primary.main',
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        fontWeight: 800,
                        flexShrink: 0,
                        cursor: 'pointer',
                    }}
                    onClick={() => { navigate('/profile'); if (isMobile) setMobileOpen(false); }}
                >
                    {profile?.full_name?.charAt(0) || 'A'}
                </Avatar>
                {showText && (
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {profile?.full_name || 'Admin'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                            {role}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* === APPBAR === */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)',
                    width: { md: `calc(100% - ${sidebarWidth}px)` },
                    ml: { md: `${sidebarWidth}px` },
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
                    {/* Mobile hamburger */}
                    <IconButton
                        color="inherit"
                        onClick={handleMobileToggle}
                        edge="start"
                        sx={{ display: { md: 'none' } }}
                    >
                        <MenuIcon size={22} />
                    </IconButton>

                    {/* Page title / logo on mobile */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mr: 1 }}>
                        <img src="/logo-bgremove.png" alt="Logo" style={{ height: 26, objectFit: 'contain' }} />
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Right side actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                        {/* Notifications */}
                        <Tooltip title="Notifications">
                            <IconButton size="small" onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
                                <Badge badgeContent={unreadCount} color="error" max={9}>
                                    <Bell size={20} />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Notifications Menu */}
                        <Menu
                            anchorEl={notifAnchorEl}
                            open={Boolean(notifAnchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    width: { xs: 300, sm: 340 },
                                    maxHeight: 420,
                                    mt: 1,
                                    borderRadius: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                },
                            }}
                        >
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Notifications</Typography>
                                <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.72rem' }}>Mark all read</Button>
                            </Box>
                            <Divider />
                            {notifications.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">No new notifications</Typography>
                                </Box>
                            ) : (
                                notifications.slice(0, 10).map((n) => (
                                    <MenuItem
                                        key={n.id}
                                        onClick={() => handleMarkRead(n.id, n.link)}
                                        sx={{
                                            display: 'block',
                                            py: 1.5,
                                            px: 2,
                                            borderLeft: n.is_read ? '3px solid transparent' : '3px solid',
                                            borderColor: n.is_read ? 'transparent' : 'primary.main',
                                            bgcolor: n.is_read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                                            whiteSpace: 'normal',
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: n.is_read ? 600 : 800, mb: 0.5 }}>
                                            {n.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                                            {n.message}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.55, mt: 0.5, display: 'block' }}>
                                            {new Date(n.created_at).toLocaleString()}
                                        </Typography>
                                    </MenuItem>
                                ))
                            )}
                        </Menu>

                        <Divider orientation="vertical" flexItem sx={{ height: 22, alignSelf: 'center', mx: 0.5 }} />

                        {/* Profile */}
                        <IconButton
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={{ p: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: '50%' }}
                        >
                            <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30, fontSize: 13, fontWeight: 800 }}>
                                {profile?.full_name?.charAt(0) || 'A'}
                            </Avatar>
                        </IconButton>

                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ mt: 1 }}>
                            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                                My Profile
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
                                <LogOut size={16} style={{ marginRight: 8 }} /> Sign Out
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* === SIDEBAR: Mobile Overlay Drawer === */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleMobileToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
            >
                <DrawerContent />
            </Drawer>

            {/* === SIDEBAR: Desktop Persistent Drawer === */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: sidebarWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: sidebarWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        overflowX: 'hidden',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    },
                }}
                open
            >
                <DrawerContent />
            </Drawer>

            {/* === MAIN CONTENT === */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${sidebarWidth}px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                {/* Spacer for AppBar */}
                <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />

                {/* Page Content */}
                <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 3 } }}>
                    {children}
                </Box>

                {/* Footer */}
                <Box sx={{ py: 2, px: 3, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        © 2026 Veda Loans and Finance. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
