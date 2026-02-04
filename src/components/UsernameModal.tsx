import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export const UsernameModal: React.FC = () => {
    const { user, refreshUser } = useAuthStore();
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Show username modal FIRST - before faucet claim
    // This way we can personalize the welcome bonus message
    if (!user || (user.username && user.username.trim() !== '')) {
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
                background: 'rgba(3, 3, 3, 0.4)',
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
                    background: 'radial-gradient(circle, rgba(234, 153, 153, 0.1) 0%, transparent 50%)',
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
                        conic-gradient(from var(--angle), transparent 25%, #EA9999 50%, transparent 75%) border-box
                    `,
                    animation: 'rotate 4s linear infinite',

                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 20px 50px -10px rgba(234, 153, 153, 0.15)',
                }}>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '8px',
                        letterSpacing: '-0.02em',
                    }}>
                        Choose Your Handle
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '32px',
                        lineHeight: '1.5',
                    }}>
                        Pick a unique username for the leaderboard.
                    </p>

                    {/* Username Input */}
                    <div style={{
                        width: '100%',
                        marginBottom: '32px',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '16px 20px',
                            transition: 'border-color 0.2s',
                        }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1.25rem', fontWeight: 500 }}>@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                    setError(null);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="username"
                                autoFocus
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#fff',
                                    fontSize: '1.25rem',
                                    fontWeight: 500,
                                    fontFamily: 'var(--font-heading)',
                                }}
                            />
                        </div>
                        <p style={{
                            marginTop: '12px',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            textAlign: 'left',
                            paddingLeft: '4px',
                        }}>
                            3-20 characters, letters & numbers only.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
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
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {/* CTA Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || username.length < 3}
                        style={{
                            width: '100%',
                            height: '56px',
                            borderRadius: '28px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'transparent',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 500,
                            cursor: (isLoading || username.length < 3) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            opacity: (isLoading || username.length < 3) ? 0.5 : 1,
                        }}
                        onMouseEnter={e => {
                            if (!isLoading && username.length >= 3) {
                                e.currentTarget.style.borderColor = '#EA9999';
                                e.currentTarget.style.background = 'rgba(234, 153, 153, 0.05)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!isLoading) {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        {isLoading ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            <>
                                Claim @{username || 'username'}
                            </>
                        )}
                    </button>

                    {/* Note */}
                    <p style={{
                        marginTop: '24px',
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                    }}>
                        You can change this later in settings.
                    </p>
                </div>
            </div>
        </>
    );
};
