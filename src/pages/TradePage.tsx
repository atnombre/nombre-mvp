import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Avatar } from '../components/ui';
import { useCreator } from '../hooks/useCreators';
import { useAuthStore } from '../stores/authStore';
import { BuySellPanel } from '../components/trading/BuySellPanel';
import { formatPrice } from '../components/trading';

export const TradePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, refreshUser } = useAuthStore();
    const { creator, isLoading, refresh: refreshCreator } = useCreator(id);

    // Get initial mode from URL param (?mode=buy or ?mode=sell)
    const initialMode = searchParams.get('mode') as 'buy' | 'sell' || 'buy';

    // Refresh user data on mount
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Find user's holding for this creator
    const userHolding = user?.holdings?.find(h => h.creator_id === id) || null;

    // Callback after trade completes
    const handleTradeComplete = useCallback(() => {
        refreshUser();
        refreshCreator(true);
    }, [refreshUser, refreshCreator]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh'
            }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    border: '3px solid rgba(234, 153, 153, 0.2)',
                    borderTopColor: 'var(--color-accent)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        );
    }

    if (!creator) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Creator not found
                </h2>
                <button
                    onClick={() => navigate('/explore')}
                    style={{
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#000',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    Back to Explore
                </button>
            </div>
        );
    }

    const pool = creator.pool;
    const currentPrice = pool?.current_price ?? 0;
    const priceChange = pool?.price_change_24h ?? 0;
    const isPositive = priceChange >= 0;

    return (
        <div style={{
            maxWidth: '480px',
            margin: '0 auto',
            padding: '0 16px',
        }}>
            {/* Back Button */}
            <button
                onClick={() => navigate(`/creator/${id}`)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    padding: '0',
                    marginBottom: '24px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                }}
            >
                <ChevronLeft size={18} />
                Back to {creator.display_name}
            </button>

            {/* Creator Header - Compact */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
                <Avatar
                    src={creator.avatar_url}
                    alt={creator.display_name}
                    fallback={creator.display_name}
                    size="lg"
                />
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                    }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#fff',
                        }}>
                            {creator.display_name}
                        </h1>
                        <span style={{
                            padding: '3px 8px',
                            background: 'rgba(234, 153, 153, 0.15)',
                            border: '1px solid rgba(234, 153, 153, 0.25)',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--color-accent)',
                        }}>
                            ${creator.token_symbol}
                        </span>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '10px',
                    }}>
                        <span style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#fff',
                            fontFamily: 'var(--font-heading)',
                        }}>
                            {formatPrice(currentPrice)}
                        </span>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            background: isPositive ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 82, 82, 0.1)',
                            borderRadius: '6px',
                            color: isPositive ? '#00C853' : '#FF5252',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        }}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Trading Panel - Full Width */}
            <BuySellPanel
                creator={creator}
                userBalance={user?.nmbr_balance || 0}
                userHolding={userHolding}
                onTradeComplete={handleTradeComplete}
                isAdmin={user?.is_admin}
                initialMode={initialMode}
            />

            {/* Animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
