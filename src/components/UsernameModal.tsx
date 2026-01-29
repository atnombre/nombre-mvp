import React, { useState } from 'react';
import { AtSign, Sparkles, AlertCircle, Loader } from 'lucide-react';
import { Button } from './ui';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export const UsernameModal: React.FC = () => {
    const { user, refreshUser } = useAuthStore();
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Don't render if user not logged in, no faucet claimed, or already has username
    if (!user || !user.faucet_claimed || (user.username && user.username.trim() !== '')) {
        return null;
    }

    const RESERVED_USERNAMES = [
        'admin', 'administrator', 'mod', 'moderator', 'nombre', 'support', 'help',
        'api', 'root', 'system', 'official', 'staff', 'team', 'null', 'undefined',
        'test', 'testing', 'demo', 'anonymous', 'user', 'users', 'account'
    ];

    const validateUsername = (value: string): string | null => {
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be 20 characters or less';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores allowed';
        if (/^_|_$/.test(value)) return 'Username cannot start or end with underscore';
        if (/__/.test(value)) return 'Username cannot contain consecutive underscores';
        if (/^[0-9]/.test(value)) return 'Username must start with a letter';
        if (RESERVED_USERNAMES.includes(value.toLowerCase())) return 'This username is reserved';
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await api.updateUsername(username);
            // Refresh user data - modal will auto-close when user.username is set
            await refreshUser();
            // No need to setSuccess - refreshUser updates user.username
            // which triggers the null return at line 15
        } catch (err: any) {
            setError(err.message || 'Failed to set username');
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    return (
        <>
            {/* Blocking Backdrop - Same DNA as ClaimModal */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'clamp(16px, 4vw, 24px)',
                }}
            >
                {/* Modal Card - Same DNA as ClaimModal */}
                <div
                    style={{
                        position: 'relative',
                        maxWidth: 'min(420px, calc(100vw - 32px))',
                        width: '100%',
                        padding: 'clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px)',
                        background: 'rgba(30, 30, 30, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: 'clamp(18px, 4vw, 24px)',
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
                            width: 'clamp(64px, 15vw, 80px)',
                            height: 'clamp(64px, 15vw, 80px)',
                            margin: '0 auto clamp(16px, 4vw, 24px)',
                            borderRadius: 'clamp(14px, 3vw, 20px)',
                            background: 'linear-gradient(135deg, #EA9999 0%, #d88888 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(234, 153, 153, 0.4)',
                            position: 'relative',
                        }}
                    >
                        <AtSign size={40} color="#000" />
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
                            fontSize: 'clamp(1.375rem, 5vw, 1.75rem)',
                            fontWeight: 700,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Choose Your Handle
                    </h2>

                    {/* Subtitle */}
                    <p
                        style={{
                            margin: '0 0 8px',
                            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                            color: 'rgba(255, 255, 255, 0.7)',
                        }}
                    >
                        Pick a unique username for the leaderboard.
                    </p>

                    {/* Username Input */}
                    <div
                        style={{
                            margin: 'clamp(16px, 4vw, 24px) 0',
                            padding: 'clamp(14px, 3vw, 20px)',
                            background: 'rgba(234, 153, 153, 0.1)',
                            borderRadius: 'clamp(12px, 3vw, 16px)',
                            border: '1px solid rgba(234, 153, 153, 0.2)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '12px 16px',
                            }}
                        >
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.1rem' }}>@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                    setError(null);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="yourname"
                                autoFocus
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#fff',
                                    fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-mono)',
                                }}
                            />
                        </div>
                        <p
                            style={{
                                margin: '10px 0 0',
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.4)',
                            }}
                        >
                            3-20 characters, letters, numbers, underscores only
                        </p>
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

                    {/* CTA Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || username.length < 3}
                        glow
                        style={{
                            width: '100%',
                            padding: 'clamp(12px, 3vw, 16px) 24px',
                            fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
                            fontWeight: 700,
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                Setting up...
                            </>
                        ) : (
                            <>
                                Claim @{username || 'username'}
                            </>
                        )}
                    </Button>

                    {/* Note */}
                    <p
                        style={{
                            margin: '20px 0 0',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}
                    >
                        You can change this later in settings.
                    </p>
                </div>
            </div>

            {/* Keyframe Animations - Same as ClaimModal */}
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
