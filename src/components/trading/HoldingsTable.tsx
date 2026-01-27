import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PriceDisplay, formatPrice } from './PriceDisplay';
import { Avatar } from '../ui';
import { HoldingCard } from './HoldingCard';

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
        padding: compact ? '14px 18px' : '16px 22px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        backgroundColor: 'transparent',
        borderRadius: '0',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
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
            color: 'rgba(255, 255, 255, 1)',
            fontSize: compact ? '0.8125rem' : '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {symbol}
          </div>
          <div style={{
            fontSize: '0.6875rem',
            color: 'rgba(255, 255, 255, 0.45)',
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
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: compact ? '0.75rem' : '0.8125rem', color: 'rgba(255, 255, 255, 0.9)' }}>
          {compact ? formatCompactNumber(quantity) : quantity.toLocaleString()}
        </div>
      </div>

      {/* Avg Cost */}
      <div style={{ flex: '0 0 90px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255, 255, 255, 0.6)', fontSize: compact ? '0.75rem' : '0.8125rem' }}>
          {formatPrice(avgCost)}
        </div>
      </div>

      {/* Current Price (LTP) */}
      <div style={{ flex: '0 0 90px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: compact ? '0.75rem' : '0.8125rem', color: 'rgba(255, 255, 255, 0.9)' }}>
          {formatPrice(currentPrice)}
        </div>
      </div>

      {/* Invested */}
      <div style={{ flex: '0 0 100px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255, 255, 255, 0.6)', fontSize: compact ? '0.75rem' : '0.8125rem' }}>
          {compact ? formatCompactNumber(investedValue) : investedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Current Value */}
      <div style={{ flex: '0 0 100px', textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: compact ? '0.75rem' : '0.8125rem', color: 'rgba(255, 255, 255, 0.9)' }}>
          {compact ? formatCompactNumber(currentValue) : currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* P&L */}
      <div style={{ flex: '0 0 110px', textAlign: 'right', paddingLeft: '8px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: isProfit ? '#00C853' : '#FF5252',
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

// Holdings Table Header - Glass styling (Desktop only)
interface HoldingsTableHeaderProps {
  showDayChange?: boolean;
}

export const HoldingsTableHeader: React.FC<HoldingsTableHeaderProps> = () => {
  const headerStyle: React.CSSProperties = {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '14px 22px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(15, 15, 15, 0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
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

// Holdings Summary Row - Glass styling (Desktop only)
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
      padding: '16px 22px',
      background: 'rgba(15, 15, 15, 0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{ ...cellStyle, flex: '1 1 auto', minWidth: '180px', textAlign: 'left', color: 'rgba(255, 255, 255, 1)', fontFamily: 'inherit' }}>
        Total
      </div>
      <div style={{ ...cellStyle, flex: '0 0 80px', textAlign: 'right' }} />
      <div style={{ ...cellStyle, flex: '0 0 90px', textAlign: 'right' }} />
      <div style={{ ...cellStyle, flex: '0 0 90px', textAlign: 'right' }} />
      <div style={{ ...cellStyle, flex: '0 0 100px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.9)' }}>
        {formatCompactNumber(totalInvested)}
      </div>
      <div style={{ ...cellStyle, flex: '0 0 100px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.9)' }}>
        {formatCompactNumber(totalCurrentValue)}
      </div>
      <div style={{
        ...cellStyle,
        flex: '0 0 110px',
        textAlign: 'right',
        paddingLeft: '8px',
        color: isProfit ? '#00C853' : '#FF5252',
      }}>
        {isProfit ? '+' : ''}{formatCompactNumber(Math.abs(totalPnL))}
      </div>
      <div style={{ ...cellStyle, flex: '0 0 110px', textAlign: 'right', paddingLeft: '8px' }}>
        <PriceDisplay value={totalPnLPercent} format="percent" variant="badge" size="sm" />
      </div>
    </div>
  );
};

// Mobile Summary Card
interface MobileHoldingsSummaryProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

export const MobileHoldingsSummary: React.FC<MobileHoldingsSummaryProps> = ({
  totalInvested,
  totalCurrentValue,
  totalPnL,
  totalPnLPercent,
}) => {
  const isProfit = totalPnL >= 0;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      background: 'rgba(15, 15, 15, 0.9)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '14px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginTop: '12px',
    }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Total Value
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.125rem', color: 'rgba(255, 255, 255, 1)' }}>
          {formatCompactNumber(totalCurrentValue)}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', marginTop: '2px' }}>
          Invested: {formatCompactNumber(totalInvested)}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Total P&L
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '1.125rem',
          color: isProfit ? '#00C853' : '#FF5252',
        }}>
          {isProfit ? '+' : ''}{formatCompactNumber(Math.abs(totalPnL))}
        </div>
        <div style={{ marginTop: '4px' }}>
          <PriceDisplay value={totalPnLPercent} format="percent" variant="badge" size="sm" />
        </div>
      </div>
    </div>
  );
};

// Responsive Holdings List - switches between table and cards
interface HoldingsListProps {
  holdings: Array<{
    creator_id: string;
    creator_name: string;
    token_symbol: string;
    avatar_url?: string;
    token_amount: number;
    avg_buy_price: number;
    current_price: number;
    current_value: number;
    pnl: number;
    pnl_pct: number;
  }>;
  totalInvested: number;
  totalCurrentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  isMobile?: boolean;
}

export const HoldingsList: React.FC<HoldingsListProps> = ({
  holdings,
  totalInvested,
  totalCurrentValue,
  totalPnL,
  totalPnLPercent,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div>
        <div className="mobile-card-grid">
          {holdings.map((holding) => (
            <HoldingCard
              key={holding.creator_id}
              creatorId={holding.creator_id}
              name={holding.creator_name}
              symbol={holding.token_symbol}
              avatarUrl={holding.avatar_url}
              quantity={holding.token_amount}
              currentPrice={holding.current_price}
              currentValue={holding.current_value}
              pnl={holding.pnl}
              pnlPercent={holding.pnl_pct}
            />
          ))}
        </div>
        <MobileHoldingsSummary
          totalInvested={totalInvested}
          totalCurrentValue={totalCurrentValue}
          totalPnL={totalPnL}
          totalPnLPercent={totalPnLPercent}
        />
      </div>
    );
  }

  // Desktop table view
  return (
    <div>
      <HoldingsTableHeader />
      {holdings.map((holding) => (
        <HoldingRow
          key={holding.creator_id}
          creatorId={holding.creator_id}
          name={holding.creator_name}
          symbol={holding.token_symbol}
          avatarUrl={holding.avatar_url}
          quantity={holding.token_amount}
          avgCost={holding.avg_buy_price}
          currentPrice={holding.current_price}
          investedValue={holding.token_amount * holding.avg_buy_price}
          currentValue={holding.current_value}
          pnl={holding.pnl}
          pnlPercent={holding.pnl_pct}
        />
      ))}
      <HoldingsSummaryRow
        totalInvested={totalInvested}
        totalCurrentValue={totalCurrentValue}
        totalPnL={totalPnL}
        totalPnLPercent={totalPnLPercent}
      />
    </div>
  );
};
