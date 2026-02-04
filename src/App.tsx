import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from "@vercel/analytics/react"
import './App.css';


// App components
import { AppLayout, AdminRoute, AdminLayout } from './components/layout';
import { Dashboard, Explore, Portfolio, Leaderboard, AuthCallback, CreatorProfile, TradePage, History, LandingPage } from './pages';

import { AdminDashboard, AdminPortfolioInspector, AdminUsers, GlobalLedger, TransactionDetailsPage } from './pages/admin';

import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
    // Skip initial loading screen on auth callback to avoid double-loading
    const [loading, setLoading] = useState(() => !window.location.pathname.startsWith('/auth/callback'));

    return (
        <>
            <AnimatePresence mode="wait">
                {loading && <LoadingScreen onComplete={() => setLoading(false)} key="loading-screen" />}
            </AnimatePresence>
            <BrowserRouter>
                <Routes>
                    {/* Landing Page */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Auth Callback */}
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Preview Route - Dev Only */}


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
            </BrowserRouter>
            <SpeedInsights />
            <Analytics />

        </>
    );
}

export default App;
