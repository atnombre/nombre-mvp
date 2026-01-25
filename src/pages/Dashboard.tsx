import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaucetBanner } from '../components/FaucetBanner';
import { usePortfolio } from '../hooks/usePortfolio';
import { useCreators } from '../hooks/useCreators';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuthStore } from '../stores/authStore';
import { 
  Trophy, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight,
  BarChart3,
  PieChart,
  ChevronRight,
} from 'lucide-react';
import {
  StatCard,
  PriceDisplay,
  formatNumber,
  formatPrice,
  PnLWidget,
  PortfolioAllocation,
  HoldingRow,
  HoldingsTableHeader,
  HoldingsSummaryRow,
} from '../components/trading';
import { Avatar } from '../components/ui';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const { portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { creators, isLoading: creatorsLoading } = useCreators({ limit: 5, sortBy: 'volume_24h' });
  const { leaderboard, myRank, isLoading: leaderboardLoading } = useLeaderboard(5);

  // Refresh user data on mount to ensure latest balance/holdings
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Greeting helper - can be used in header if needed
  // const greeting = () => {
  //   const hour = new Date().getHours();
  //   if (hour < 12) return 'Good morning';
  //   if (hour < 18) return 'Good afternoon';
  //   return 'Good evening';
  // };

  const holdingsCount = portfolio?.holdings?.length || 0;
  const totalPnL = portfolio?.total_pnl || 0;
  // const isProfit = totalPnL >= 0;

  return (
    <div>
      {/* Faucet Banner for New Users */}
      <FaucetBanner />

      {/* Welcome Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Hi, {user?.display_name?.split(' ')[0] || 'Trader'}
        </h1>
      </div>

      {/* Summary Stats Row - All 4 boxes in one row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px',
        marginBottom: '20px',
      }}>
        <StatCard
          label="Total Investment"
          value={formatNumber(portfolio?.total_invested || 0)}
          subValue="NMBR"
          icon={<BarChart3 size={14} />}
          size="md"
        />
        <StatCard
          label="Current Value"
          value={formatNumber(portfolio?.total_value || 0)}
          subValue="NMBR"
          icon={<TrendingUp size={14} />}
          size="md"
        />
        <StatCard
          label="Available to Trade"
          value={formatNumber(user?.nmbr_balance || 0)}
          subValue="NMBR"
          variant="accent"
          size="md"
        />
        <StatCard
          label="Leaderboard Rank"
          value={myRank ? `#${myRank}` : '—'}
          subValue={myRank ? (myRank <= 10 ? '🔥 Top 10!' : 'Keep trading') : 'Start trading'}
          icon={<Trophy size={14} />}
          variant={myRank && myRank <= 10 ? 'positive' : 'default'}
          size="md"
        />
      </div>

      {/* Main Two-Column Layout like Groww */}
      <div className="holdings-grid">
        {/* Left Column - Holdings Table */}
        <div>
          {/* Holdings Section */}
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}>
            {/* Portfolio Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Portfolio
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-hover)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  {holdingsCount}
                </span>
              </div>
              <button
                onClick={() => navigate('/portfolio')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                View All <ChevronRight size={16} />
              </button>
            </div>

            {/* Holdings Table */}
            {portfolioLoading ? (
              <div style={{ padding: '20px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-color)',
                  }}>
                    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 4, marginBottom: 6 }} />
                      <div className="skeleton" style={{ width: 100, height: 10, borderRadius: 4 }} />
                    </div>
                    <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            ) : holdingsCount === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto 16px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-accent-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Wallet size={28} style={{ color: 'var(--color-accent)' }} />
                </div>
                <p style={{ 
                  margin: '0 0 8px', 
                  color: 'var(--text-secondary)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                }}>
                  No holdings yet
                </p>
                <p style={{ 
                  margin: '0 0 20px', 
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem',
                }}>
                  Start investing in your favorite creators
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  style={{
                    padding: '10px 20px',
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
              <div style={{ overflowX: 'auto' }}>
                <HoldingsTableHeader />
                {portfolio?.holdings.slice(0, 5).map((holding) => (
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
                    compact
                  />
                ))}
                {holdingsCount > 0 && (
                  <HoldingsSummaryRow
                    totalInvested={portfolio?.total_invested || 0}
                    totalCurrentValue={portfolio?.total_value || 0}
                    totalPnL={totalPnL}
                    totalPnLPercent={portfolio?.roi_pct || 0}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - P&L Widget + Allocation + Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* P&L Widget */}
          <PnLWidget
            totalPnL={totalPnL}
            totalPnLPercent={portfolio?.roi_pct || 0}
            currentValue={portfolio?.total_value || 0}
            investedValue={portfolio?.total_invested || 0}
          />

          {/* Portfolio Allocation */}
          {holdingsCount > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '16px 20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '16px',
              }}>
                <PieChart size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 500, 
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Allocation
                </span>
              </div>
              
              {/* Allocation Bar */}
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
              
              {/* Total Value */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Value</span>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                }}>
                  ₹{formatNumber(portfolio?.total_value || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trending Creators Section */}
      <div style={{
        marginTop: '24px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '0.9375rem', 
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              Trending Creators
            </h3>
            <p style={{ 
              margin: '4px 0 0', 
              fontSize: '0.75rem', 
              color: 'var(--text-muted)',
            }}>
              Most traded in the last 24h
            </p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-accent)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Explore All <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
        }}>
          {creatorsLoading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{
                padding: '16px',
                backgroundColor: 'var(--bg-hover)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }} />
                  <div>
                    <div className="skeleton" style={{ width: 50, height: 12, borderRadius: 4, marginBottom: 4 }} />
                    <div className="skeleton" style={{ width: 70, height: 10, borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ width: 50, height: 14, borderRadius: 4 }} />
                  <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 4 }} />
                </div>
              </div>
            ))
          ) : (
            creators.map((creator) => (
              <div
                key={creator.id}
                onClick={() => navigate(`/creator/${creator.id}`)}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-hover)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-active)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Avatar src={creator.avatar_url} alt={creator.display_name} fallback={creator.display_name} size="sm" />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}>
                      {creator.token_symbol}
                    </div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {creator.username}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontWeight: 600, 
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                  }}>
                    {formatPrice(creator.current_price)}
                  </span>
                  <PriceDisplay 
                    value={creator.price_change_24h} 
                    format="percent" 
                    variant="badge" 
                    size="xs" 
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Traders Section */}
      <div style={{
        marginTop: '24px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '0.9375rem', 
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            Top Traders
          </h3>
          <button
            onClick={() => navigate('/leaderboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-accent)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {leaderboardLoading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
              }}>
                <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ flex: 1, height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 4 }} />
              </div>
            ))
          ) : (
            leaderboard.slice(0, 5).map((entry) => (
              <div
                key={entry.user_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Rank Badge */}
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: entry.rank === 1 
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                    : entry.rank === 2 
                      ? 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)'
                      : entry.rank === 3
                        ? 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)'
                        : 'var(--bg-active)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: entry.rank <= 3 ? '#000' : 'var(--text-muted)',
                }}>
                  {entry.rank}
                </div>
                
                {/* Avatar */}
                <Avatar src={entry.avatar_url} alt={entry.display_name} fallback={entry.display_name} size="xs" />
                
                {/* Name */}
                <div style={{ 
                  flex: 1, 
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {entry.display_name}
                </div>
                
                {/* ROI */}
                <PriceDisplay 
                  value={entry.roi_pct} 
                  format="percent" 
                  variant="badge" 
                  size="sm" 
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
