import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { MobileNav } from './MobileNav';
import { ClaimModal } from '../ClaimModal';
import { useAuthStore } from '../../stores/authStore';

// Custom hook for responsive breakpoint
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

export const AppLayout: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();
    const isMobile = useIsMobile();

    // Show loading while checking auth (init happens in main.tsx)
    if (isLoading) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-primary)',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid var(--color-accent-bg)',
                    borderTopColor: 'var(--color-accent)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    // Not authenticated - redirect to landing
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--bg-primary)',
        }}>
            {/* Blocking Claim Modal for new users */}
            <ClaimModal />

            {/* Top Navigation Bar */}
            {!isMobile && <TopNavbar />}

            <main style={{
                paddingTop: isMobile ? '0' : 'var(--nav-height)',
                paddingBottom: isMobile ? '70px' : '24px',
                minHeight: '100vh',
            }}>
                <div style={{
                    maxWidth: 'var(--content-max-width)',
                    margin: '0 auto',
                    padding: isMobile ? '16px' : '24px 32px',
                }}>
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            {isMobile && <MobileNav />}
        </div>
    );
};
