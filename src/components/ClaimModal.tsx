import React, { useState } from 'react';
import { Gift, Sparkles, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from './ui';
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
    const { user, refreshUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
            setSuccess(true);

            // Refresh user data to update faucet_claimed status
            await refreshUser();
        } catch (err: any) {
            setError(err.message || 'Failed to claim tokens');
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Blocking Backdrop - No click handler to dismiss */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}
            >
                {/* Celebratory Modal Card */}
                <div
                    style={{
                        position: 'relative',
                        maxWidth: '420px',
                        width: '100%',
                        padding: '40px 32px',
                        background: 'rgba(30, 30, 30, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(234, 153, 153, 0.3)',
                        boxShadow: `
                            0 0 60px rgba(234, 153, 153, 0.2),
                            0 0 120px rgba(234, 153, 153, 0.1),
                            0 25px 50px -12px rgba(0, 0, 0, 0.5),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1)
                        `,
                        textAlign: 'center',
                        animation: 'modalGlow 3s ease-in-out infinite',
                    }}
                >
                    {/* Animated Glow Border */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: '-2px',
                            borderRadius: '26px',
                            background: 'linear-gradient(45deg, #EA9999, #d88888, #EA9999, #f0b8b8, #EA9999)',
                            backgroundSize: '400% 400%',
                            animation: 'borderGlow 4s ease infinite',
                            zIndex: -1,
                            opacity: 0.6,
                        }}
                    />

                    {/* Icon with Sparkle */}
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 24px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(234, 153, 153, 0.4)',
                            position: 'relative',
                        }}
                    >
                        {success ? (
                            <CheckCircle size={40} color="#000" />
                        ) : (
                            <Gift size={40} color="#000" />
                        )}
                        <Sparkles
                            size={20}
                            color="#fff"
                            style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))',
                                animation: 'sparkle 1.5s ease-in-out infinite',
                            }}
                        />
                    </div>

                    {/* Title */}
                    <h2
                        style={{
                            margin: '0 0 12px',
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {success ? 'You\'re All Set! 🎉' : 'Welcome to Nombre! 🎉'}
                    </h2>

                    {/* Subtitle */}
                    <p
                        style={{
                            margin: '0 0 8px',
                            fontSize: '1rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                        }}
                    >
                        {success
                            ? 'Your tokens have been credited to your account.'
                            : 'Claim your free tokens to start trading creator coins.'}
                    </p>

                    {/* Token Amount Highlight */}
                    <div
                        style={{
                            margin: '24px 0',
                            padding: '20px',
                            background: 'rgba(234, 153, 153, 0.1)',
                            borderRadius: '16px',
                            border: '1px solid rgba(234, 153, 153, 0.2)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                color: '#EA9999',
                                fontFamily: 'var(--font-mono)',
                                letterSpacing: '-0.03em',
                            }}
                        >
                            10,000
                        </div>
                        <div
                            style={{
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.5)',
                                marginTop: '4px',
                                fontWeight: 500,
                            }}
                        >
                            NMBR TOKENS
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
                                marginBottom: '16px',
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

                    {/* CTA Button - Only path forward */}
                    {!success && (
                        <Button
                            onClick={handleClaim}
                            disabled={isLoading}
                            glow
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                    Claiming...
                                </>
                            ) : (
                                <>
                                    <Gift size={20} />
                                    Claim 10K NMBR
                                </>
                            )}
                        </Button>
                    )}

                    {/* Note */}
                    <p
                        style={{
                            margin: '20px 0 0',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}
                    >
                        {success
                            ? 'Redirecting you to the dashboard...'
                            : 'This is a one-time bonus for new users.'}
                    </p>
                </div>
            </div>

            {/* Keyframe Animations */}
            <style>{`
                @keyframes modalGlow {
                    0%, 100% {
                        box-shadow: 
                            0 0 60px rgba(234, 153, 153, 0.2),
                            0 0 120px rgba(234, 153, 153, 0.1),
                            0 25px 50px -12px rgba(0, 0, 0, 0.5),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    }
                    50% {
                        box-shadow: 
                            0 0 80px rgba(234, 153, 153, 0.3),
                            0 0 160px rgba(234, 153, 153, 0.15),
                            0 25px 50px -12px rgba(0, 0, 0, 0.5),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    }
                }

                @keyframes borderGlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes sparkle {
                    0%, 100% { 
                        opacity: 1; 
                        transform: scale(1) rotate(0deg); 
                    }
                    50% { 
                        opacity: 0.5; 
                        transform: scale(1.2) rotate(15deg); 
                    }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};
