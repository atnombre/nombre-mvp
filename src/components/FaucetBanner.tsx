import React, { useState } from 'react';
import { Gift, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface FaucetBannerProps {
    onClose?: () => void;
}

// Generate a simple device fingerprint
const getDeviceFingerprint = (): string => {
    const nav = window.navigator;
    const screen = window.screen;

    const fingerprint = [
        nav.userAgent,
        nav.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        nav.hardwareConcurrency || 'unknown',
    ].join('|');

    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
};

export const FaucetBanner: React.FC<FaucetBannerProps> = ({ onClose }) => {
    const { user, refreshUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Don't show if user has already claimed
    if (!user || user.faucet_claimed) {
        return null;
    }

    const handleClaim = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const fingerprint = getDeviceFingerprint();
            await api.claimFaucet(fingerprint);
            setSuccess(true);

            // Refresh user data to update balance
            await refreshUser();

            // Auto-close after success
            setTimeout(() => {
                onClose?.();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to claim tokens');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                background: 'rgba(0, 200, 83, 0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 200, 83, 0.25)',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 200, 83, 0.1)',
            }}>
                <CheckCircle size={20} color="#00C853" />
                <span style={{ color: '#00C853', fontWeight: 500 }}>
                    10,000 NMBR tokens claimed successfully!
                </span>
            </div>
        );
    }

    return (
        <div style={{
            // Glass banner
            background: 'rgba(234, 153, 153, 0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(234, 153, 153, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 20px rgba(234, 153, 153, 0.08)',
        }}>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        display: 'flex',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                    }}
                >
                    <X size={16} />
                </button>
            )}

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
            }}>
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(234, 153, 153, 0.35)',
                }}>
                    <Gift size={26} color="#000" />
                </div>

                <div style={{ flex: 1 }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 1)',
                        marginBottom: '0.35rem',
                    }}>
                        Welcome to Nombre! 🎉
                    </h3>
                    <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                    }}>
                        Claim your free 10,000 NMBR tokens to start trading creator tokens.
                    </p>
                </div>

                <Button
                    onClick={handleClaim}
                    disabled={isLoading}
                    isLoading={isLoading}
                    glow
                    style={{
                        whiteSpace: 'nowrap',
                    }}
                >
                    {isLoading ? 'Claiming...' : 'Claim 10K NMBR'}
                </Button>
            </div>

            {error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '1rem',
                    padding: '0.65rem 1rem',
                    background: 'rgba(255, 82, 82, 0.1)',
                    border: '1px solid rgba(255, 82, 82, 0.2)',
                    borderRadius: '10px',
                    color: '#FF5252',
                    fontSize: '0.8rem',
                }}>
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
        </div>
    );
};
