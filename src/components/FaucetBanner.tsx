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
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.05) 100%)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
            }}>
                <CheckCircle size={20} color="#4ade80" />
                <span style={{ color: '#4ade80', fontWeight: 500 }}>
                    10,000 NMBR tokens claimed successfully!
                </span>
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(234, 153, 153, 0.15) 0%, rgba(234, 153, 153, 0.05) 100%)',
            border: '1px solid rgba(234, 153, 153, 0.3)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            position: 'relative',
        }}>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                    }}
                >
                    <X size={16} />
                </button>
            )}

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Gift size={24} color="#000" />
                </div>

                <div style={{ flex: 1 }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '0.25rem',
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
                    style={{
                        background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
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
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(248, 113, 113, 0.1)',
                    borderRadius: '6px',
                    color: '#f87171',
                    fontSize: '0.8rem',
                }}>
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
        </div>
    );
};
