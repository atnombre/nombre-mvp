import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAuthStore } from '../stores/authStore';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Search,
} from 'lucide-react';
import {
  StatCard,
  formatNumber,
  HoldingsList,
  PortfolioChart,
  PortfolioAllocation,
} from '../components/trading';

// Custom hook for responsive breakpoint
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const { portfolio, isLoading, error } = usePortfolio();
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div>
        {/* Header Skeleton */}
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 200, height: 16, borderRadius: 4 }} />
        </div>

        {/* Stats Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '16px',
          marginBottom: '24px',
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              padding: isMobile ? '14px' : '16px 20px',
              border: '1px solid var(--border-color)',
            }}>
              <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 4, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '70%', height: 28, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '64px 24px',
        color: 'var(--text-muted)',
      }}>
        <p>Error loading portfolio: {error}</p>
      </div>
    );
  }

  const holdingsCount = portfolio?.holdings?.length || 0;
  const totalPnL = portfolio?.total_pnl || 0;
  const isProfit = totalPnL >= 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <h1 style={{
          margin: 0,
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Portfolio
        </h1>
        {!isMobile && (
          <p style={{
            margin: '4px 0 0',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
          }}>
            Track your investments and performance
          </p>
        )}
      </div>

      {/* Mobile Layout - Vertical Stack */}
      {isMobile ? (
        <div>
          {/* Stats Grid - 2x2 on mobile */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <StatCard
              label="Invested"
              value={formatNumber(portfolio?.total_invested || 0)}
              subValue="NMBR"
              icon={<BarChart3 size={14} />}
              size="sm"
            />
            <StatCard
              label="Value"
              value={formatNumber(portfolio?.total_value || 0)}
              subValue="NMBR"
              icon={<Wallet size={14} />}
              size="sm"
            />
            <StatCard
              label="P&L"
              value={isProfit ? `+${formatNumber(totalPnL)}` : formatNumber(totalPnL)}
              trend={portfolio?.roi_pct}
              icon={isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              variant={isProfit ? 'positive' : 'negative'}
              size="sm"
            />
            <StatCard
              label="Available"
              value={formatNumber(user?.nmbr_balance || 0)}
              subValue="NMBR"
              icon={<Wallet size={14} />}
              size="sm"
            />
          </div>

          {/* Chart - Full Width on Mobile */}
          <div style={{
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '14px',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
            }}>
              <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                Performance
              </span>
            </div>
            <PortfolioChart
              data={[]}
              height={140}
              showTimeControls={true}
              currentValue={portfolio?.total_value || 0}
            />
          </div>

          {/* Allocation Bar */}
          {holdingsCount > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <PortfolioAllocation
                holdings={portfolio?.holdings.map(h => ({
                  name: h.creator_name,
                  symbol: h.token_symbol,
                  value: h.current_value,
                })) || []}
                totalValue={portfolio?.total_value || 0}
                maxItems={4}
              />
            </div>
          )}

          {/* Holdings Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                Holdings ({holdingsCount})
              </span>
            </div>

            {holdingsCount === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <PieChart size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{
                  margin: '0 0 8px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                }}>
                  No holdings yet
                </h3>
                <p style={{
                  margin: '0 0 20px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem',
                }}>
                  Start investing in creators
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    minHeight: '44px',
                  }}
                >
                  Explore Creators
                </button>
              </div>
            ) : (
              <HoldingsList
                holdings={portfolio?.holdings || []}
                totalInvested={portfolio?.total_invested || 0}
                totalCurrentValue={portfolio?.total_value || 0}
                totalPnL={totalPnL}
                totalPnLPercent={portfolio?.roi_pct || 0}
                isMobile={true}
              />
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout - Original Grid */
        <>
          {/* Top Section: Chart Left + Stats Right */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '20px',
            marginBottom: '24px',
          }}>
            {/* Left: Portfolio Performance Chart */}
            <div style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  Portfolio Performance
                </span>
              </div>
              <PortfolioChart
                data={[]}
                height={180}
                showTimeControls={true}
                currentValue={portfolio?.total_value || 0}
              />
            </div>

            {/* Right: 2x2 Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: '12px',
            }}>
              <StatCard
                label="Total Investment"
                value={formatNumber(portfolio?.total_invested || 0)}
                subValue="NMBR"
                icon={<BarChart3 size={14} />}
                size="sm"
              />
              <StatCard
                label="Current Value"
                value={formatNumber(portfolio?.total_value || 0)}
                subValue="NMBR"
                icon={<Wallet size={14} />}
                size="sm"
              />
              <StatCard
                label="Total P&L"
                value={isProfit ? `+${formatNumber(totalPnL)}` : formatNumber(totalPnL)}
                trend={portfolio?.roi_pct}
                icon={isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                variant={isProfit ? 'positive' : 'negative'}
                size="sm"
              />
              <StatCard
                label="Available"
                value={formatNumber(user?.nmbr_balance || 0)}
                subValue="NMBR"
                icon={<Wallet size={14} />}
                size="sm"
              />
            </div>
          </div>

          {/* Allocation Bar - Full Width */}
          {holdingsCount > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <PortfolioAllocation
                holdings={portfolio?.holdings.map(h => ({
                  name: h.creator_name,
                  symbol: h.token_symbol,
                  value: h.current_value,
                })) || []}
                totalValue={portfolio?.total_value || 0}
                maxItems={6}
              />
            </div>
          )}

          {/* Full Width Holdings Table */}
          <div style={{
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  Holdings ({holdingsCount})
                </span>
              </div>

              {/* Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <Search size={14} />
                  Search
                </button>
              </div>
            </div>

            {/* Holdings Content */}
            {holdingsCount === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 24px',
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  margin: '0 auto 20px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <PieChart size={32} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 style={{
                  margin: '0 0 8px',
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}>
                  No holdings yet
                </h3>
                <p style={{
                  margin: '0 0 24px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem',
                }}>
                  Start investing in creators to build your portfolio
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    transition: 'var(--transition-normal)',
                  }}
                >
                  Explore Creators
                </button>
              </div>
            ) : (
              <HoldingsList
                holdings={portfolio?.holdings || []}
                totalInvested={portfolio?.total_invested || 0}
                totalCurrentValue={portfolio?.total_value || 0}
                totalPnL={totalPnL}
                totalPnLPercent={portfolio?.roi_pct || 0}
                isMobile={false}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
