import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

/**
 * AdminRoute - Security wrapper for admin-only routes.
 * 
 * Checks if the current user has admin privileges (is_admin = true).
 * If not an admin, redirects to dashboard immediately.
 * 
 * Usage in App.tsx:
 * <Route element={<AdminRoute />}>
 *   <Route path="/admin" element={<AdminDashboard />} />
 * </Route>
 */
export const AdminRoute: React.FC = () => {
    const { user, isLoading, isAuthenticated } = useAuthStore();
    const location = useLocation();

    // Show loading spinner while checking auth
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

    // Not an admin - redirect to dashboard (silently)
    if (!user?.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    // Admin verified - render children
    return <Outlet />;
};
