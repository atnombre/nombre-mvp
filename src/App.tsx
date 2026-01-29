import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from "@vercel/analytics/react"
import './App.css';

// Landing page components (your friend's work)
import InteractiveGrid from './components/InteractiveGrid';
import InfiniteTicker from './components/InfiniteTicker';
import Header from './components/Header';

// App components
import { AppLayout, AdminRoute, AdminLayout } from './components/layout';
import { Dashboard, Explore, Portfolio, Leaderboard, AuthCallback, CreatorProfile, History } from './pages';
import { AdminDashboard, AdminPortfolioInspector, AdminUsers, GlobalLedger, TransactionDetailsPage } from './pages/admin';



// Landing Page Component
const LandingPage: React.FC = () => {
    const [tickerVisible, setTickerVisible] = React.useState(false);

    React.useEffect(() => {
        const handleInteraction = () => {
            setTickerVisible(true);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
        };

        window.addEventListener('scroll', handleInteraction);
        window.addEventListener('click', handleInteraction);
        window.addEventListener('mousemove', handleInteraction);

        return () => {
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('mousemove', handleInteraction);
        };
    }, []);

    return (
        <>
            <Header />
            <InteractiveGrid
                color="#FFFFFF"
                backgroundColor="#0a0a0a"
                opacity={0}
                lineWidth={0.3}
                spacing={80}
                glowRadius={120}
                fadeEffect={true}
            />

            <main style={{
                position: 'relative',
                zIndex: 1,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
            }}>
                {/* Your friend's landing page content goes here */}
            </main>

            <InfiniteTicker
                items={[
                    { symbol: "PEWDS", price: "$0.0094", change: "+0.82", pctChange: "+9.5%" },
                    { symbol: "BEAST", price: "$0.0106", change: "+1.20", pctChange: "+12.8%" },
                    { symbol: "MARK", price: "$0.0072", change: "-0.10", pctChange: "-1.4%" },
                    { symbol: "JACK", price: "$0.0064", change: "+0.45", pctChange: "+7.5%" },
                    { symbol: "VERIT", price: "$0.0047", change: "+0.12", pctChange: "+2.6%" },
                    { symbol: "WEEKND", price: "$0.0080", change: "+2.10", pctChange: "+35.4%" },
                    { symbol: "TSERIES", price: "$0.0102", change: "-0.05", pctChange: "-0.5%" },
                    { symbol: "ASMR", price: "$0.0031", change: "+0.08", pctChange: "+2.6%" },
                ]}
                speed={60}
                visible={tickerVisible}
            />
        </>
    );
};

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Landing Page */}
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
