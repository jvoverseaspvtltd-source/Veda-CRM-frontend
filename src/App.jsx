import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PublicForm from './pages/PublicForm';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerPortalLayout from './layouts/PartnerPortalLayout';
import { PartnerAuthProvider } from './context/PartnerAuthContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const Leads = lazy(() => import('./pages/Leads'));
const Banks = lazy(() => import('./pages/Banks'));
const Cases = lazy(() => import('./pages/Cases'));
const Commissions = lazy(() => import('./pages/Commissions'));

const EligibilityHub = lazy(() => import('./pages/EligibilityHub'));
const Performance = lazy(() => import('./pages/Performance'));
const LendingPartners = lazy(() => import('./pages/LendingPartners'));
const PartnerDetail = lazy(() => import('./pages/PartnerDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Employees = lazy(() => import('./pages/Employees'));
const Settings = lazy(() => import('./pages/Settings'));
const Forms = lazy(() => import('./pages/Forms'));
const Applications = lazy(() => import('./pages/Applications'));
const ApplicationDetail = lazy(() => import('./pages/ApplicationDetail'));
const Inflow = lazy(() => import('./pages/Inflow'));
const CRMChat = lazy(() => import('./pages/CRMChat'));
const TrackingDashboard = lazy(() => import('./pages/TrackingDashboard'));
const HelpDesk = lazy(() => import('./pages/HelpDesk'));
const ZipTransactions = lazy(() => import('./pages/ZipTransactions'));

// Partner Pages
const PartnerProfile = lazy(() => import('./pages/partner/PartnerProfile'));
const PartnerHelpDesk = lazy(() => import('./pages/partner/PartnerHelpDesk'));
const PartnerCommissions = lazy(() => import('./pages/partner/PartnerCommissions'));
const PartnerPerformance = lazy(() => import('./pages/partner/PartnerPerformance'));
const PartnerChat = lazy(() => import('./pages/partner/PartnerChat'));
const PartnerSettings = lazy(() => import('./pages/partner/PartnerSettings'));

const PageLoader = () => (
    <Box sx={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
    </Box>
);

const LazyPage = ({ children }) => (
    <Suspense fallback={<PageLoader />}>
        {children}
    </Suspense>
);

const ProtectedRoute = ({ children, roles }) => {
    const { user, profile, loading, hasRole } = useAuth();
    if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !hasRole(roles)) return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected CRM Routes (Side-nav based) */}
                    <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                    <Route path="/leads" element={<ProtectedRoute><MainLayout><LazyPage><Leads /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/cases" element={<ProtectedRoute><MainLayout><LazyPage><Cases /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/applications" element={<ProtectedRoute><MainLayout><LazyPage><Applications /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/applications/:id" element={<ProtectedRoute><MainLayout><LazyPage><ApplicationDetail /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/eligibility-hub" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Loan Manager']}><MainLayout><LazyPage><EligibilityHub /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/banks" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Loan Manager']}><MainLayout><LazyPage><Banks /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/commissions" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Partner']}><MainLayout><LazyPage><Commissions /></LazyPage></MainLayout></ProtectedRoute>} />

                    <Route path="/performance" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Partner']}><MainLayout><LazyPage><Performance /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/lending-partners" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Loan Manager', 'Partner']}><MainLayout><LazyPage><LendingPartners /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/lending-partners/:id" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Loan Manager', 'Partner']}><MainLayout><LazyPage><PartnerDetail /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/inflow" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Partner']}><MainLayout><LazyPage><Inflow /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/veda/chat" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Partner']}><MainLayout><LazyPage><CRMChat /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/veda/chat/user/:id" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Partner']}><MainLayout><LazyPage><CRMChat /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/tracking-dashboard" element={<ProtectedRoute roles={['Super Admin', 'Admin']}><MainLayout><LazyPage><TrackingDashboard /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/employees" element={<ProtectedRoute roles={['Super Admin']}><MainLayout><LazyPage><Employees /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><MainLayout><LazyPage><Profile /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><MainLayout><LazyPage><Settings /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/forms" element={<ProtectedRoute><MainLayout><LazyPage><Forms /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/help-desk" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Loan Manager', 'Telecaller', 'JV Overseas', 'DSA Agent', 'Partner']}><MainLayout><LazyPage><HelpDesk /></LazyPage></MainLayout></ProtectedRoute>} />
                    <Route path="/zip-transactions" element={<ProtectedRoute roles={['Super Admin', 'Admin', 'Partner']}><MainLayout><LazyPage><ZipTransactions /></LazyPage></MainLayout></ProtectedRoute>} />
                    
                    {/* Legacy Public Forms */}
                    <Route path="/apply" element={<PublicForm />} />
                    <Route path="/apply/:id" element={<PublicForm />} />
                    
                    {/* Credit Partner Portal Routes */}
                    <Route path="/partner" element={<PartnerAuthProvider><Outlet /></PartnerAuthProvider>}>
                        <Route path="login" element={<Navigate to="/login" replace />} />
                        <Route element={<PartnerPortalLayout />}>
                            <Route path="dashboard" element={<PartnerDashboard />} />
                            <Route path="profile" element={<LazyPage><PartnerProfile /></LazyPage>} />
                            <Route path="help-desk" element={<LazyPage><PartnerHelpDesk /></LazyPage>} />
                            <Route path="commissions" element={<LazyPage><PartnerCommissions /></LazyPage>} />
                            <Route path="performance" element={<LazyPage><PartnerPerformance /></LazyPage>} />
                            <Route path="chat" element={<LazyPage><PartnerChat /></LazyPage>} />
                            <Route path="chat/user/:id" element={<LazyPage><PartnerChat /></LazyPage>} />
                            <Route path="settings" element={<LazyPage><PartnerSettings /></LazyPage>} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
