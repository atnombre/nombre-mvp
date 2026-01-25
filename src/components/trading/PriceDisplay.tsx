import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceDisplayProps {
  value: number;
  format?: 'percent' | 'currency' | 'number';
  showSign?: boolean;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'badge' | 'inline';
  decimals?: number;
  currency?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  value,
  format = 'percent',
  showSign = true,
  showIcon = true,
  size = 'md',
  variant = 'default',
  decimals = 2,
  currency = 'NMBR',
}) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;
  
  const color = isPositive 
    ? 'var(--color-positive)' 
    : isNegative 
      ? 'var(--color-negative)' 
      : 'var(--text-muted)';
      
  const bgColor = isPositive 
    ? 'var(--color-positive-bg)' 
    : isNegative 
      ? 'var(--color-negative-bg)' 
      : 'rgba(255, 255, 255, 0.05)';
  
  const sizeConfig = {
    xs: { fontSize: '0.7rem', iconSize: 10, padding: '2px 6px', gap: '2px' },
    sm: { fontSize: '0.75rem', iconSize: 12, padding: '3px 8px', gap: '3px' },
    md: { fontSize: '0.8125rem', iconSize: 14, padding: '4px 10px', gap: '4px' },
    lg: { fontSize: '0.9375rem', iconSize: 16, padding: '6px 12px', gap: '5px' },
  };
  
  const config = sizeConfig[size];
  
  const formatValue = () => {
    const absValue = Math.abs(value);
    let formatted = '';
    
    switch (format) {
      case 'percent':
        formatted = `${absValue.toFixed(decimals)}%`;
        break;
      case 'currency':
        formatted = `${formatNumber(absValue)} ${currency}`;
        break;
      case 'number':
        formatted = formatNumber(absValue);
        break;
    }
    
    if (showSign && !isNeutral) {
      formatted = (isPositive ? '+' : '-') + formatted;
    } else if (isNegative) {
      formatted = '-' + formatted;
    }
    
    return formatted;
  };
  
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  
  if (variant === 'inline') {
    return (
      <span
        style={{
          color,
          fontSize: config.fontSize,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: config.gap,
        }}
      >
        {showIcon && <Icon size={config.iconSize} />}
        {formatValue()}
      </span>
    );
  }
  
  if (variant === 'badge') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: config.gap,
          backgroundColor: bgColor,
          color,
          fontSize: config.fontSize,
          fontWeight: 600,
          padding: config.padding,
          borderRadius: 'var(--radius-md)',
        }}
      >
        {showIcon && <Icon size={config.iconSize} />}
        {formatValue()}
      </span>
    );
  }
  
  // Default variant
  return (
    <span
      style={{
        color,
        fontSize: config.fontSize,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.02em',
      }}
    >
      {formatValue()}
    </span>
  );
};

// Utility function for number formatting
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
  if (num < 0.01 && num > 0) {
    return num.toFixed(6);
  }
  return num.toFixed(decimals);
};

// Format as currency with symbol
export const formatCurrency = (value: number, symbol: string = 'NMBR'): string => {
  return `${formatNumber(value)} ${symbol}`;
};

// Format price with proper decimals for small numbers
export const formatPrice = (price: number): string => {
  if (price < 0.0001) return price.toFixed(8);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
};
