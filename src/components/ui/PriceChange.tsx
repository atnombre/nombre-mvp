import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceChangeProps {
    value: number;
    showIcon?: boolean;
    showPercent?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const PriceChange: React.FC<PriceChangeProps> = ({
    value,
    showIcon = true,
    showPercent = true,
    size = 'md',
}) => {
    const isPositive = value > 0;
    const isNegative = value < 0;

    const color = isPositive ? '#4ade80' : isNegative ? '#f87171' : 'rgba(255, 255, 255, 0.4)';
    const bgColor = isPositive ? 'rgba(74, 222, 128, 0.1)' : isNegative ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255, 255, 255, 0.05)';

    const fontSizes: Record<string, string> = {
        sm: '0.75rem',
        md: '0.85rem',
        lg: '1rem',
    };

    const iconSizes: Record<string, number> = {
        sm: 12,
        md: 14,
        lg: 16,
    };

    const paddings: Record<string, string> = {
        sm: '0.2rem 0.4rem',
        md: '0.25rem 0.5rem',
        lg: '0.3rem 0.6rem',
    };

    const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    const displayValue = isPositive ? `+${value.toFixed(2)}` : value.toFixed(2);

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color,
            fontSize: fontSizes[size],
            fontWeight: 600,
            backgroundColor: bgColor,
            padding: paddings[size],
            borderRadius: '6px',
        }}>
            {showIcon && <Icon size={iconSizes[size]} />}
            {displayValue}{showPercent && '%'}
        </span>
    );
};

// Format number with commas and abbreviations
export const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1) + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toFixed(decimals);
};

// Format currency
export const formatCurrency = (value: number, currency: string = 'NMBR'): string => {
    if (currency === 'USD' || currency === '$') {
        return `$${formatNumber(value)}`;
    }
    return `${formatNumber(value)} ${currency}`;
};
