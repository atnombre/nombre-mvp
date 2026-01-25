import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        const handleAuth = async () => {
            try {
                // Wait for Supabase to process the OAuth callback from URL hash
                const { data: { session }, error: authError } = await supabase.auth.getSession();

                if (authError) {
                    throw new Error(authError.message);
                }

                if (!session) {
                    // No session yet, give Supabase a moment to process the hash
                    const { data, error: retryError } = await supabase.auth.getSession();
                    if (retryError || !data.session) {
                        throw new Error('Authentication failed. Please try again.');
                    }
                }

                const activeSession = session || (await supabase.auth.getSession()).data.session;
                if (!activeSession) {
                    throw new Error('No session found');
                }

                // Register with backend (fire and forget)
                const deviceFingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}`;
                api.authCallback(activeSession.access_token, deviceFingerprint).catch(() => { });

                // Try to get user from backend, fallback to Supabase data
                let userData;
                try {
                    userData = await api.getCurrentUser();
                } catch {
                    // Fallback to Supabase user
                    const u = activeSession.user;
                    userData = {
                        id: u.id,
                        email: u.email || '',
                        display_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
                        avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
                        nmbr_balance: 10000,
                        portfolio_value: 0,
                        total_invested: 0,
                        roi_pct: 0,
                        rank: null,
                        faucet_claimed: false,
                        is_admin: false,
                        holdings: [],
                    };
                }

                setUser(userData);
                navigate('/dashboard', { replace: true });

            } catch (err: any) {
                console.error('Auth callback error:', err);
                setError(err?.message || 'Authentication failed');
            }
        };

        handleAuth();
    }, [navigate, setUser]);

    if (error) {
        return (
            <div className="auth-callback-error">
                <div className="error-icon">⚠️</div>
                <h1>Authentication Failed</h1>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Back to Home</button>
                <style>{`
                    .auth-callback-error {
                        width: 100vw;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: #0a0a0a;
                        color: #fff;
                        text-align: center;
                        padding: 2rem;
                    }
                    .error-icon { font-size: 3rem; margin-bottom: 1rem; }
                    .auth-callback-error h1 { margin: 0 0 1rem; font-size: 1.5rem; }
                    .auth-callback-error p { color: rgba(255,255,255,0.6); margin: 0 0 2rem; max-width: 400px; }
                    .auth-callback-error button {
                        padding: 0.75rem 1.5rem;
                        background: #EA9999;
                        color: #fff;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        cursor: pointer;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="auth-callback-loading">
            <div className="spinner" />
            <p>Signing in...</p>
            <style>{`
                .auth-callback-loading {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a0a;
                }
                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(234,153,153,0.3);
                    border-top-color: #EA9999;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 1.5rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .auth-callback-loading p { color: rgba(255,255,255,0.6); }
            `}</style>
        </div>
    );
};
