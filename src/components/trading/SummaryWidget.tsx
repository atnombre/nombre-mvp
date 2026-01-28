import React from 'react';
import { PriceDisplay } from './PriceDisplay';

interface SummaryWidgetProps {
  title: string;
  mainValue: string | number;
  mainValueColor?: 'positive' | 'negative' | 'default';
  mainValueTrend?: number; // percentage
  rows: {
    label: string;
    value: string | number;
    valueColor?: 'positive' | 'negative' | 'default' | 'muted';
  }[];
  footer?: React.ReactNode;
}

export const SummaryWidget: React.FC<SummaryWidgetProps> = ({
  title,
  mainValue,
  mainValueColor = 'default',
  mainValueTrend,
  rows,
  footer,
}) => {
  const getValueColor = (color?: string) => {
    switch (color) {
      case 'positive': return 'var(--color-positive)';
      case 'negative': return 'var(--color-negative)';
      case 'muted': return 'var(--text-muted)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: getValueColor(mainValueColor),
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {mainValue}
          </span>

          {mainValueTrend !== undefined && (
            <PriceDisplay
              value={mainValueTrend}
              format="percent"
              variant="badge"
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Rows */}
      <div style={{ padding: '12px 20px' }}>
        {rows.map((row, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < rows.length - 1 ? '1px solid var(--border-color)' : 'none',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {row.label}
            </span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: getValueColor(row.valueColor),
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

// Compact P&L Widget - Groww style
interface PnLWidgetProps {
  totalPnL: number;
  totalPnLPercent: number;
  currentValue: number;
  investedValue: number;
  dayPnL?: number;
  dayPnLPercent?: number;
}

export const PnLWidget: React.FC<PnLWidgetProps> = ({
  totalPnL,
  totalPnLPercent,
  currentValue,
  investedValue,
  dayPnL,
  // dayPnLPercent, // Available but not used in current design
}) => {
  const isProfit = totalPnL >= 0;

  return (
    <SummaryWidget
      title={`P&L`}
      mainValue={`${isProfit ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
      mainValueColor={isProfit ? 'positive' : 'negative'}
      mainValueTrend={totalPnLPercent}
      rows={[
        { label: 'Current value', value: currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) },
        { label: 'Investment', value: investedValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) },
        ...(dayPnL !== undefined ? [{
          label: "Day's P&L",
          value: `${dayPnL >= 0 ? '+' : ''}${dayPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          valueColor: (dayPnL >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
        }] : []),
      ]}
    />
  );
};
