import React, { useState, useEffect } from 'react';
import { useTrade } from '../../hooks/useTrade';
import { Creator, Holding } from '../../services/api';
import { ArrowDownUp, AlertCircle, CheckCircle, Loader, Wallet, Zap, Coins } from 'lucide-react';
import { formatNumber } from '../ui';

interface BuySellPanelProps {
    creator: Creator;
    userBalance: number;
    userHolding?: Holding | null;
    onTradeComplete?: () => void;
}

export const BuySellPanel: React.FC<BuySellPanelProps> = ({ creator, userBalance, userHolding, onTradeComplete }) => {
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');
    const [amount, setAmount] = useState<string>('');
    const [showSuccess, setShowSuccess] = useState(false);

    const { quote, isLoadingQuote, isExecuting, error, getQuote, executeTrade, clearQuote, clearError } = useTrade();

    // Debounced quote fetching
    useEffect(() => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0 || !creator.id) {
            clearQuote();
            return;
        }

        const timer = setTimeout(() => {
            getQuote({
                creator_id: creator.id,
                type: mode,
                amount: numAmount,
                amount_type: mode === 'buy' ? 'nmbr' : 'token',
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [amount, mode, creator.id, getQuote, clearQuote]);

    // Clear error when changing tabs
    useEffect(() => {
        clearError();
        clearQuote();
        setAmount('');
    }, [mode, clearError, clearQuote]);

    const handleTrade = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) return;

        const result = await executeTrade({
            creator_id: creator.id,
            type: mode,
            amount: numAmount,
            amount_type: mode === 'buy' ? 'nmbr' : 'token',
            max_slippage_pct: 5,
        });

        if (result?.success) {
            setShowSuccess(true);
            setAmount('');
            onTradeComplete?.();
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const handleMaxClick = () => {
        if (mode === 'buy') {
            setAmount(userBalance.toString());
        } else if (userHolding) {
            setAmount(userHolding.token_amount.toString());
        }
    };

    const numAmount = parseFloat(amount) || 0;
    const userTokenBalance = userHolding?.token_amount || 0;
    const isBuyDisabled = mode === 'buy' && numAmount > userBalance;
    const isSellDisabled = mode === 'sell' && numAmount > userTokenBalance;
    const canTrade = numAmount > 0 && !isBuyDisabled && !isSellDisabled && !isLoadingQuote;

    // Dynamic accent colors based on mode
    const accentColor = mode === 'buy' ? '#4ade80' : '#f87171';
    const accentColorRgb = mode === 'buy' ? '74, 222, 128' : '248, 113, 113';
    const accentGradient = mode === 'buy'
        ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
        : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';

    return (
        <div
            style={{
                position: 'relative',
                borderRadius: '20px',
                padding: '24px',
                background: 'rgba(20, 20, 20, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: `
                    0 4px 24px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.03),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05)
                `,
                transition: 'all 0.3s ease',
            }}
        >
            {/* Pill Toggle */}
            <div style={{
                display: 'flex',
                padding: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
                <button
                    onClick={() => setMode('buy')}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: mode === 'buy'
                            ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
                            : 'transparent',
                        color: mode === 'buy' ? '#4ade80' : 'rgba(255, 255, 255, 0.4)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        boxShadow: mode === 'buy'
                            ? '0 0 20px rgba(74, 222, 128, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            : 'none',
                    }}
                >
                    Buy
                </button>
                <button
                    onClick={() => setMode('sell')}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: mode === 'sell'
                            ? 'linear-gradient(135deg, rgba(248, 113, 113, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                            : 'transparent',
                        color: mode === 'sell' ? '#f87171' : 'rgba(255, 255, 255, 0.4)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        boxShadow: mode === 'sell'
                            ? '0 0 20px rgba(248, 113, 113, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            : 'none',
                    }}
                >
                    Sell
                </button>
            </div>

            {/* Balance Display */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
            }}>
                <span style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                }}>
                    <Wallet size={14} />
                    Available
                </span>
                <span style={{
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono)',
                }}>
                    {formatNumber(userBalance)} NMBR
                </span>
            </div>

            {/* User Holdings Display */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '12px 16px',
                backgroundColor: 'rgba(234, 153, 153, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(234, 153, 153, 0.1)',
            }}>
                <span style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                }}>
                    <Coins size={14} />
                    You own
                </span>
                <span style={{
                    color: userTokenBalance > 0 ? '#EA9999' : 'rgba(255, 255, 255, 0.3)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono)',
                }}>
                    {formatNumber(userTokenBalance)} {creator.token_symbol}
                </span>
            </div>

            {/* Big Number Input - Calculator Style */}
            <div style={{
                position: 'relative',
                marginBottom: '24px',
                padding: '32px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
            }}>
                <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '3rem',
                        fontWeight: 700,
                        color: '#fff',
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '-0.02em',
                    }}
                />
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '8px',
                }}>
                    <span style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                    }}>
                        {mode === 'buy' ? 'NMBR' : creator.token_symbol}
                    </span>
                    <button
                        onClick={handleMaxClick}
                        style={{
                            padding: '6px 14px',
                            background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.2) 0%, rgba(${accentColorRgb}, 0.1) 100%)`,
                            border: `1px solid rgba(${accentColorRgb}, 0.3)`,
                            borderRadius: '20px',
                            color: accentColor,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        Max
                    </button>
                </div>

                {/* Validation errors */}
                {(isBuyDisabled || isSellDisabled) && (
                    <p style={{
                        color: '#f87171',
                        fontSize: '0.75rem',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                    }}>
                        <AlertCircle size={12} />
                        {isBuyDisabled ? 'Insufficient balance' : 'Insufficient tokens'}
                    </p>
                )}
            </div>

            {/* Quote Preview */}
            {(isLoadingQuote || quote) && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                }}>
                    {isLoadingQuote ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            color: 'rgba(255, 255, 255, 0.4)',
                            padding: '8px 0',
                        }}>
                            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.85rem' }}>Fetching quote...</span>
                        </div>
                    ) : quote && (
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '12px',
                                color: 'rgba(255, 255, 255, 0.25)',
                            }}>
                                <ArrowDownUp size={14} />
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <div style={{
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '6px',
                                }}>
                                    You will {mode === 'buy' ? 'receive' : 'get'}
                                </div>
                                <div style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    color: accentColor,
                                    fontFamily: 'var(--font-mono)',
                                }}>
                                    {formatNumber(quote.output_amount)}
                                    <span style={{
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        fontSize: '0.9rem',
                                        marginLeft: '8px',
                                        fontWeight: 500,
                                    }}>
                                        {quote.output_currency}
                                    </span>
                                </div>
                            </div>

                            {/* Quote details - cleaner horizontal layout */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                padding: '12px 0',
                                borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                                        {quote.price_per_token.toFixed(6)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Impact</div>
                                    <div style={{
                                        color: quote.price_impact_pct > 5 ? '#f87171' : quote.price_impact_pct > 2 ? '#fbbf24' : '#4ade80',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        fontFamily: 'var(--font-mono)',
                                        marginTop: '4px',
                                    }}>
                                        {quote.price_impact_pct.toFixed(2)}%
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee</div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                                        {quote.fee_amount.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    backgroundColor: 'rgba(248, 113, 113, 0.08)',
                    border: '1px solid rgba(248, 113, 113, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#f87171',
                    fontSize: '0.8rem',
                }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Success */}
            {showSuccess && (
                <div style={{
                    backgroundColor: 'rgba(74, 222, 128, 0.08)',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#4ade80',
                    fontSize: '0.8rem',
                }}>
                    <CheckCircle size={16} />
                    Trade executed successfully!
                </div>
            )}

            {/* Trade Button - Premium Pill Style */}
            <button
                onClick={handleTrade}
                disabled={!canTrade || isExecuting}
                style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: canTrade && !isExecuting ? accentGradient : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '14px',
                    color: canTrade && !isExecuting ? '#000' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: canTrade && !isExecuting ? 'pointer' : 'not-allowed',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: canTrade && !isExecuting
                        ? `0 4px 20px rgba(${accentColorRgb}, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                        : 'none',
                }}
            >
                {isExecuting ? (
                    <>
                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Processing...
                    </>
                ) : (
                    <>
                        <Zap size={18} />
                        {mode === 'buy' ? 'Buy' : 'Sell'} {creator.token_symbol}
                    </>
                )}
            </button>

            {/* Animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};
