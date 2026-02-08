import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from "@vercel/analytics/react"
import './App.css';

import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/ui/LoadingScreen';

// Landing page - loaded eagerly (critical path)
import LandingPage from './pages/LandingPage';

// All other pages - lazy loaded for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Explore = lazy(() => import('./pages/Explore').then(m => ({ default: m.Explore })));
const Portfolio = lazy(() => import('./pages/Portfolio').then(m => ({ default: m.Portfolio })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const CreatorProfile = lazy(() => import('./pages/CreatorProfile').then(m => ({ default: m.CreatorProfile })));
const TradePage = lazy(() => import('./pages/TradePage').then(m => ({ default: m.TradePage })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));

// Layout components - lazy loaded
const AppLayout = lazy(() => import('./components/layout').then(m => ({ default: m.AppLayout })));
const AdminRoute = lazy(() => import('./components/layout').then(m => ({ default: m.AdminRoute })));
const AdminLayout = lazy(() => import('./components/layout').then(m => ({ default: m.AdminLayout })));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminDashboard })));
const AdminPortfolioInspector = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminPortfolioInspector })));
const AdminUsers = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminUsers })));
const GlobalLedger = lazy(() => import('./pages/admin').then(m => ({ default: m.GlobalLedger })));
const TransactionDetailsPage = lazy(() => import('./pages/admin').then(m => ({ default: m.TransactionDetailsPage })));

// Simple loading fallback for lazy components
const PageLoader = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#050505',
        color: '#ffffff',
    }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid #fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    </div>
);

function App() {
    // Skip initial loading screen on auth callback to avoid double-loading
    const [loading, setLoading] = useState(() => !window.location.pathname.startsWith('/auth/callback'));

    return (
        <>
            <AnimatePresence mode="wait">
                {loading && <LoadingScreen onComplete={() => setLoading(false)} key="loading-screen" />}
            </AnimatePresence>
            <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Landing Page - eagerly loaded */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Auth Callback */}
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Protected App Routes */}
                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/explore" element={<Explore />} />
                            <Route path="/portfolio" element={<Portfolio />} />
                            <Route path="/leaderboard" element={<Leaderboard />} />
                            <Route path="/history" element={<History />} />

                            <Route path="/creator/:id" element={<CreatorProfile />} />
                            <Route path="/trade/:id" element={<TradePage />} />

                        </Route>

                        {/* Admin Routes (Protected) */}
                        <Route element={<AdminRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/admin/users" element={<AdminUsers />} />
                                <Route path="/admin/transactions" element={<GlobalLedger />} />
                                <Route path="/admin/transactions/:txId" element={<TransactionDetailsPage />} />
                                <Route path="/admin/inspect/:userId" element={<AdminPortfolioInspector />} />
                            </Route>
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <SpeedInsights debug={false} />
            <Analytics debug={false} />

        </>
    );
}

export default App;
