import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Avatar } from '../ui';
import { PriceDisplay } from './PriceDisplay';

// Compact number formatter
const formatCompactNumber = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(2);
};

interface HoldingCardProps {
    creatorId: string;
    name: string;
    symbol: string;
    avatarUrl?: string;
    quantity: number;
    currentPrice: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
}

export const HoldingCard: React.FC<HoldingCardProps> = ({
    creatorId,
    name,
    symbol,
    avatarUrl,
    quantity,
    currentPrice,
    currentValue,
    pnl,
    pnlPercent,
}) => {
    const navigate = useNavigate();
    const isProfit = pnl >= 0;

    return (
        <div
            onClick={() => navigate(`/creator/${creatorId}`)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
            }}
        >
            {/* Creator Avatar */}
            <Avatar
                src={avatarUrl}
                alt={name}
                fallback={name}
                size="md"
            />

            {/* Creator Info - Symbol & Name stacked */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: '#fff',
                    marginBottom: '2px',
                }}>
                    {symbol}
                </div>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {name}
                </div>
            </div>

            {/* Value + P&L - Right Aligned */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: '#fff',
                    marginBottom: '4px',
                }}>
                    {formatCompactNumber(currentValue)}
                </div>
                <PriceDisplay value={pnlPercent} format="percent" variant="badge" size="sm" />
            </div>

            {/* Chevron */}
            <ChevronRight size={18} style={{ color: 'rgba(255, 255, 255, 0.3)', flexShrink: 0 }} />
        </div>
    );
};
