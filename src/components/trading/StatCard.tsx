import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: number; // Percentage change - will show green/red
  variant?: 'default' | 'accent' | 'positive' | 'negative';
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  variant = 'default',
  size = 'md',
}) => {
  const isPositive = trend !== undefined && trend >= 0;
  // const isNegative = trend !== undefined && trend < 0;
  
  const sizeStyles = {
    sm: { padding: '12px 16px', valueSize: '1.25rem', labelSize: '0.7rem' },
    md: { padding: '16px 20px', valueSize: '1.5rem', labelSize: '0.7rem' },
    lg: { padding: '20px 24px', valueSize: '1.875rem', labelSize: '0.75rem' },
  };
  
  const variantStyles = {
    default: {
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border-color)',
    },
    accent: {
      background: 'linear-gradient(135deg, var(--color-accent-bg) 0%, var(--bg-tertiary) 100%)',
      border: '1px solid var(--color-accent-border)',
    },
    positive: {
      background: 'linear-gradient(135deg, var(--color-positive-bg) 0%, var(--bg-tertiary) 100%)',
      border: '1px solid var(--color-positive-border)',
    },
    negative: {
      background: 'linear-gradient(135deg, var(--color-negative-bg) 0%, var(--bg-tertiary) 100%)',
      border: '1px solid var(--color-negative-border)',
    },
  };
  
  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];
  
  return (
    <div
      style={{
        ...currentVariant,
        borderRadius: 'var(--radius-lg)',
        padding: currentSize.padding,
        transition: 'var(--transition-normal)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
        }}
      >
        {icon && (
          <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: currentSize.labelSize,
            fontWeight: 500,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      </div>
      
      {/* Value row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontSize: currentSize.valueSize,
            fontWeight: 700,
            color: trend !== undefined 
              ? (isPositive ? 'var(--color-positive)' : 'var(--color-negative)')
              : 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        
        {trend !== undefined && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isPositive ? 'var(--color-positive)' : 'var(--color-negative)',
            }}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{trend.toFixed(2)}%
          </span>
        )}
      </div>
      
      {/* Sub value */}
      {subValue && (
        <div
          style={{
            marginTop: '4px',
            fontSize: '0.75rem',
            color: variant === 'accent' ? 'var(--color-accent)' : 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {subValue}
        </div>
      )}
    </div>
  );
};
