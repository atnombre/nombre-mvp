import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { PriceDisplay, formatNumber, formatPrice } from './PriceDisplay';

// Types
interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  compact?: boolean;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortKey,
  sortOrder,
  onSort,
  isLoading,
  emptyMessage = 'No data available',
  compact = false,
  stickyHeader = false,
}: DataTableProps<T>) {
  const cellPadding = compact ? '10px 12px' : '14px 16px';
  const headerPadding = compact ? '8px 12px' : '10px 16px';

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key);
    }
  };

  const renderSortIcon = (key: string, sortable?: boolean) => {
    if (!sortable) return null;

    if (sortKey === key) {
      return sortOrder === 'asc'
        ? <ChevronUp size={14} />
        : <ChevronDown size={14} />;
    }
    return <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />;
  };

  if (isLoading) {
    return (
      <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: headerPadding,
                    textAlign: col.align || 'left',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border-color)',
                    width: col.width,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: cellPadding }}>
                    <div
                      className="skeleton"
                      style={{
                        height: '16px',
                        borderRadius: '4px',
                        width: col.key === 'name' ? '120px' : '60px',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
              position: stickyHeader ? 'sticky' : undefined,
              top: stickyHeader ? 0 : undefined,
              zIndex: stickyHeader ? 10 : undefined,
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key, col.sortable)}
                style={{
                  padding: headerPadding,
                  textAlign: col.align || 'left',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: sortKey === col.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border-color)',
                  width: col.width,
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {col.header}
                  {renderSortIcon(col.key, col.sortable)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, var(--glass-bg-hover) 0%, transparent 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: cellPadding,
                    textAlign: col.align || 'left',
                    fontSize: compact ? '0.8125rem' : '0.875rem',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-color)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.render
                    ? col.render(item, index)
                    : (item as any)[col.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Pre-built column renderers for common patterns
export const columnRenderers = {
  // Creator/Instrument name with avatar
  creator: (name: string, symbol: string, avatarUrl?: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={name}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            objectFit: 'cover',
          }}
        />
      )}
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{symbol}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{name}</div>
      </div>
    </div>
  ),

  // Quantity with monospace font
  quantity: (value: number) => (
    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
      {value.toLocaleString()}
    </span>
  ),

  // Price value
  price: (value: number) => (
    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
      {formatPrice(value)}
    </span>
  ),

  // Currency value
  currency: (value: number, symbol: string = 'NMBR') => (
    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
      {formatNumber(value)} <span style={{ color: 'var(--text-muted)', fontSize: '0.75em' }}>{symbol}</span>
    </span>
  ),

  // P&L value (colored)
  pnl: (value: number, _symbol: string = 'NMBR') => {
    const isPositive = value >= 0;
    return (
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: isPositive ? 'var(--color-positive)' : 'var(--color-negative)',
        }}
      >
        {isPositive ? '+' : ''}{formatNumber(value)}
      </span>
    );
  },

  // Percentage change (colored with badge)
  percentChange: (value: number) => (
    <PriceDisplay value={value} format="percent" variant="badge" size="sm" />
  ),

  // Percentage inline (no badge)
  percentInline: (value: number) => (
    <PriceDisplay value={value} format="percent" variant="inline" size="sm" showIcon={false} />
  ),
};
