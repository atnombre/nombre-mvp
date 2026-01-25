import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PriceDisplay, formatPrice } from './PriceDisplay';
import { Avatar } from '../ui';

// Compact number formatter for dashboard view
const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toFixed(2);
};

interface HoldingRowProps {
  creatorId: string;
  name: string;
  symbol: string;
  avatarUrl?: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange?: number;
  compact?: boolean;
}

export const HoldingRow: React.FC<HoldingRowProps> = ({
  creatorId,
  name,
  symbol,
  avatarUrl,
  quantity,
  avgCost,
  currentPrice,
  investedValue,
  currentValue,
  pnl,
  pnlPercent,
  compact = false,
}) => {
  const navigate = useNavigate();
  const isProfit = pnl >= 0;

  return (
    <div
      onClick={() => navigate(`/creator/${creatorId}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: compact ? '12px 16px' : '14px 20px',
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Creator info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 auto', minWidth: '180px' }}>
        <Avatar
          src={avatarUrl}
          alt={name}
          fallback={name}
          size={compact ? 'sm' : 'md'}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontSize: compact ? '0.8125rem' : '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {symbol}
          </div>
          <div style={{
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {name}
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div style={{ flex: '0 0 80px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: compact ? '0.75rem' : '0.8125rem' }}>
          {compact ? formatCompactNumber(quantity) : quantity.toLocaleString()}
        </div>
      </div>

      {/* Avg Cost */}
      <div style={{ flex: '0 0 90px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: compact ? '0.75rem' : '0.8125rem' }}>
          {formatPrice(avgCost)}
        </div>
      </div>

      {/* Current Price (LTP) */}
      <div style={{ flex: '0 0 90px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: compact ? '0.75rem' : '0.8125rem' }}>
          {formatPrice(currentPrice)}
        </div>
      </div>

      {/* Invested */}
      <div style={{ flex: '0 0 100px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: compact ? '0.75rem' : '0.8125rem' }}>
          {compact ? formatCompactNumber(investedValue) : investedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Current Value */}
      <div style={{ flex: '0 0 100px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: compact ? '0.75rem' : '0.8125rem' }}>
          {compact ? formatCompactNumber(currentValue) : currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* P&L */}
      <div style={{ flex: '0 0 110px', textAlign: 'right', paddingLeft: '8px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: isProfit ? 'var(--color-positive)' : 'var(--color-negative)',
            fontSize: compact ? '0.75rem' : '0.8125rem',
            whiteSpace: 'nowrap',
          }}
        >
          {isProfit ? '+' : ''}{compact ? formatCompactNumber(Math.abs(pnl)) : pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* P&L % */}
      <div style={{ flex: '0 0 110px', textAlign: 'right', paddingLeft: '8px' }}>
        <PriceDisplay value={pnlPercent} format="percent" variant="badge" size="sm" />
      </div>
    </div>
  );
};

// Holdings Table Header
interface HoldingsTableHeaderProps {
  showDayChange?: boolean;
}

export const HoldingsTableHeader: React.FC<HoldingsTableHeaderProps> = () => {
  const headerStyle: React.CSSProperties = {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ ...headerStyle, flex: '1 1 auto', minWidth: '180px', textAlign: 'left' }}>Instrument</div>
      <div style={{ ...headerStyle, flex: '0 0 80px', textAlign: 'right' }}>Qty</div>
      <div style={{ ...headerStyle, flex: '0 0 90px', textAlign: 'right' }}>Avg Cost</div>
      <div style={{ ...headerStyle, flex: '0 0 90px', textAlign: 'right' }}>LTP</div>
      <div style={{ ...headerStyle, flex: '0 0 100px', textAlign: 'right' }}>Invested</div>
      <div style={{ ...headerStyle, flex: '0 0 100px', textAlign: 'right' }}>Cur. Val</div>
      <div style={{ ...headerStyle, flex: '0 0 110px', textAlign: 'right', paddingLeft: '8px' }}>P&L</div>
      <div style={{ ...headerStyle, flex: '0 0 110px', textAlign: 'right', paddingLeft: '8px' }}>Net Chg</div>
    </div>
  );
};

// Holdings Summary Row
interface HoldingsSummaryRowProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange?: number;
}

export const HoldingsSummaryRow: React.FC<HoldingsSummaryRowProps> = ({
  totalInvested,
  totalCurrentValue,
  totalPnL,
  totalPnLPercent,
}) => {
  const isProfit = totalPnL >= 0;
  const cellStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '14px 20px',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '2px solid var(--border-color)',
    }}>
      <div style={{ ...cellStyle, flex: '1 1 auto', minWidth: '180px', textAlign: 'left', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
        Total
      </div>
      <div style={{ ...cellStyle, flex: '0 0 80px', textAlign: 'right' }} />
      <div style={{ ...cellStyle, flex: '0 0 90px', textAlign: 'right' }} />
      <div style={{ ...cellStyle, flex: '0 0 90px', textAlign: 'right' }} />
      <div style={{ ...cellStyle, flex: '0 0 100px', textAlign: 'right', color: 'var(--text-primary)' }}>
        {formatCompactNumber(totalInvested)}
      </div>
      <div style={{ ...cellStyle, flex: '0 0 100px', textAlign: 'right', color: 'var(--text-primary)' }}>
        {formatCompactNumber(totalCurrentValue)}
      </div>
      <div style={{
        ...cellStyle,
        flex: '0 0 110px',
        textAlign: 'right',
        paddingLeft: '8px',
        color: isProfit ? 'var(--color-positive)' : 'var(--color-negative)',
      }}>
        {isProfit ? '+' : ''}{formatCompactNumber(Math.abs(totalPnL))}
      </div>
      <div style={{ ...cellStyle, flex: '0 0 110px', textAlign: 'right', paddingLeft: '8px' }}>
        <PriceDisplay value={totalPnLPercent} format="percent" variant="badge" size="sm" />
      </div>
    </div>
  );
};
