import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: number;
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

  const sizeStyles = {
    sm: { padding: '14px 18px', valueSize: '1.25rem', labelSize: '0.7rem' },
    md: { padding: '18px 22px', valueSize: '1.5rem', labelSize: '0.7rem' },
    lg: { padding: '22px 26px', valueSize: '1.875rem', labelSize: '0.75rem' },
  };

  const variantStyles = {
    default: {
      background: 'rgba(20, 20, 20, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    accent: {
      background: 'linear-gradient(135deg, rgba(234, 153, 153, 0.12) 0%, rgba(20, 20, 20, 0.6) 100%)',
      border: '1px solid rgba(234, 153, 153, 0.25)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(234, 153, 153, 0.1)',
    },
    positive: {
      background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.1) 0%, rgba(20, 20, 20, 0.6) 100%)',
      border: '1px solid rgba(0, 200, 83, 0.25)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 200, 83, 0.1)',
    },
    negative: {
      background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.1) 0%, rgba(20, 20, 20, 0.6) 100%)',
      border: '1px solid rgba(255, 82, 82, 0.25)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 82, 82, 0.1)',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <div
      style={{
        background: currentVariant.background,
        border: currentVariant.border,
        boxShadow: currentVariant.shadow,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '14px',
        padding: currentSize.padding,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = currentVariant.border.split(' ').pop() || '';
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        {icon && (
          <span style={{ color: 'rgba(255, 255, 255, 0.45)', display: 'flex' }}>
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: currentSize.labelSize,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
      </div>

      {/* Value row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span
          style={{
            fontSize: currentSize.valueSize,
            fontWeight: 700,
            color: trend !== undefined
              ? (isPositive ? '#00C853' : '#FF5252')
              : 'rgba(255, 255, 255, 1)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            fontFamily: 'var(--font-mono)',
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
              fontSize: '0.65rem',
              fontWeight: 600,
              color: isPositive ? '#00C853' : '#FF5252',
              padding: '2px 6px',
              background: isPositive ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 82, 82, 0.15)',
              borderRadius: '4px',
            }}
          >
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Sub value */}
      {subValue && (
        <div
          style={{
            marginTop: '6px',
            fontSize: '0.75rem',
            color: variant === 'accent' ? '#EA9999' : 'rgba(255, 255, 255, 0.45)',
            fontWeight: 500,
          }}
        >
          {subValue}
        </div>
      )}
    </div>
  );
};
