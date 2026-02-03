import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

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

    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
};

export const ClaimModal: React.FC = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Don't render if user has already claimed or not logged in
    if (!user || user.faucet_claimed) {
        return null;
    }

    const handleClaim = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const fingerprint = getDeviceFingerprint();
            await api.claimFaucet(fingerprint);
            // Refresh user data - modal will auto-close when user.faucet_claimed becomes true
            await refreshUser();
        } catch (err: any) {
            setError(err.message || 'Failed to claim tokens');
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Animation Styles */}
            <style>{`
                @property --angle {
                    syntax: "<angle>";
                    initial-value: 0deg;
                    inherits: false;
                }

                @keyframes rotate {
                    to {
                        --angle: 360deg;
                    }
                }
            `}</style>

            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(3, 3, 3, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                fontFamily: '"Instrument Sans", sans-serif',
            }}>
                {/* Minimal Spotlight Background Effect */}
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 50%)',
                    zIndex: -1,
                }} />

                {/* Shimmer Border Card */}
                <div style={{
                    position: 'relative',
                    width: '380px',
                    borderRadius: '32px',
                    padding: '48px 32px',

                    // Shimmer Effect Styles
                    border: '2px solid transparent',
                    outline: 'none',
                    background: `
                        linear-gradient(#050505, #050505) padding-box,
                        conic-gradient(from var(--angle), transparent 25%, white 50%, transparent 75%) border-box
                    `,
                    animation: 'rotate 4s linear infinite',

                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5)',
                }}>

                    {/* Back Button (Visible only on error) */}
                    {error && (
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                left: '24px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '50%',
                                color: '#fff',
                                cursor: 'pointer',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                backdropFilter: 'blur(4px)',
                                zIndex: 10,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                            aria-label="Back to Home"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}

                    {/* Spacer */}
                    <div style={{ height: '20px' }} />

                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '8px',
                        letterSpacing: '-0.02em',
                    }}>
                        Welcome Bonus
                    </h1>

                    <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '48px',
                        lineHeight: '1.5',
                    }}>
                        Your journey begins here.
                    </p>

                    {/* Hero Number */}
                    <div style={{
                        marginBottom: '48px',
                        position: 'relative',
                    }}>
                        <div style={{
                            fontSize: '5rem',
                            fontWeight: 400,
                            color: '#fff',
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            fontFamily: 'var(--font-heading)',
                        }}>
                            10k
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            color: '#EA9999',
                            marginTop: '16px',
                            fontWeight: 700,
                        }}>
                            NMBR TokENS
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '24px',
                                padding: '12px 16px',
                                background: 'rgba(248, 113, 113, 0.1)',
                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                borderRadius: '12px',
                                color: '#f87171',
                                fontSize: '0.875rem',
                            }}
                        >
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Minimal Button */}
                    <button
                        onClick={handleClaim}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            height: '56px',
                            borderRadius: '28px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'transparent',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 500,
                            cursor: isLoading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#EA9999';
                            e.currentTarget.style.background = 'rgba(234, 153, 153, 0.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {isLoading ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            <>
                                Claim Bonus
                                {/* ArrowRight wasn't passed in props in original but we can skip icon for minimalism or import if needed. 
                                    I'll keep it simple as text only since icon import might be missing from top */}
                            </>
                        )}
                    </button>

                    <p style={{
                        marginTop: '24px',
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                    }}>
                        Valid for new wallet connections only.
                    </p>
                </div>
            </div>
        </>
    );
};
