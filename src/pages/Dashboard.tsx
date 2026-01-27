import React, { useEffect, useState } from 'react';
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
  HoldingsList,
  HoldingCard,
} from '../components/trading';
import { Avatar } from '../components/ui';

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

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const { portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { creators, isLoading: creatorsLoading } = useCreators({ limit: 5, sortBy: 'volume_24h' });
  const { leaderboard, myRank, isLoading: leaderboardLoading } = useLeaderboard(5);
  const isMobile = useIsMobile();

  // Refresh user data on mount to ensure latest balance/holdings
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const holdingsCount = portfolio?.holdings?.length || 0;
  const totalPnL = portfolio?.total_pnl || 0;

  return (
    <div>
      {/* Faucet Banner for New Users */}
      <FaucetBanner />

      {/* Welcome Header */}
      <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <h1 style={{
          margin: 0,
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Hi, {user?.display_name?.split(' ')[0] || 'Trader'}
        </h1>
      </div>

      {/* Summary Stats Row - 2x2 on mobile, 4 columns on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '16px' : '20px',
      }}>
        <StatCard
          label={isMobile ? 'Invested' : 'Total Investment'}
          value={formatNumber(portfolio?.total_invested || 0)}
          subValue="NMBR"
          icon={<BarChart3 size={14} />}
          size={isMobile ? 'sm' : 'md'}
        />
        <StatCard
          label={isMobile ? 'Value' : 'Current Value'}
          value={formatNumber(portfolio?.total_value || 0)}
          subValue="NMBR"
          icon={<TrendingUp size={14} />}
          size={isMobile ? 'sm' : 'md'}
        />
        <StatCard
          label={isMobile ? 'Balance' : 'Available to Trade'}
          value={formatNumber(user?.nmbr_balance || 0)}
          subValue="NMBR"
          variant="accent"
          size={isMobile ? 'sm' : 'md'}
        />
        <StatCard
          label={isMobile ? 'Rank' : 'Leaderboard Rank'}
          value={myRank ? `#${myRank}` : '—'}
          subValue={myRank ? (myRank <= 10 ? '🔥 Top 10!' : 'Keep trading') : 'Start'}
          icon={<Trophy size={14} />}
          variant={myRank && myRank <= 10 ? 'positive' : 'default'}
          size={isMobile ? 'sm' : 'md'}
        />
      </div>

      {/* Main Layout - Stacked on mobile, 2 columns on desktop */}
      {isMobile ? (
        // Mobile: Stacked Layout
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* P&L Widget */}
          <PnLWidget
            totalPnL={totalPnL}
            totalPnLPercent={portfolio?.roi_pct || 0}
            currentValue={portfolio?.total_value || 0}
            investedValue={portfolio?.total_invested || 0}
          />

          {/* Holdings Section - Card View */}
          <div style={{
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Holdings ({holdingsCount})
              </span>
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
                  minHeight: '44px',
                }}
              >
                View All <ChevronRight size={16} />
              </button>
            </div>

            {portfolioLoading ? (
              <div style={{ padding: '16px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12, marginBottom: 12 }} />
                ))}
              </div>
            ) : holdingsCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                <Wallet size={32} style={{ color: 'var(--color-accent)', marginBottom: '12px' }} />
                <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No holdings yet
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  style={{
                    padding: '12px 20px',
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
              <div style={{ padding: '12px' }} className="mobile-card-grid">
                {portfolio?.holdings.slice(0, 3).map((holding) => (
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
            )}
          </div>

          {/* Trending Creators - Horizontal scroll */}
          <div style={{
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '14px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Trending
              </span>
              <button
                onClick={() => navigate('/explore')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                See All <ArrowUpRight size={12} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '4px',
            }}>
              {creatorsLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ width: 140, height: 100, borderRadius: 12, flexShrink: 0 }} />
                ))
              ) : (
                creators.map((creator) => (
                  <div
                    key={creator.id}
                    onClick={() => navigate(`/creator/${creator.id}`)}
                    style={{
                      flexShrink: 0,
                      width: 140,
                      padding: '14px',
                      backgroundColor: 'rgba(30, 30, 30, 0.6)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Avatar src={creator.avatar_url} alt={creator.display_name} fallback={creator.display_name} size="xs" />
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {creator.token_symbol}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {formatPrice(creator.current_price)}
                      </span>
                      <PriceDisplay value={creator.price_change_24h} format="percent" variant="badge" size="xs" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Traders - Compact List */}
          <div style={{
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '14px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Top Traders
              </span>
              <button
                onClick={() => navigate('/leaderboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                See All <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboardLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: 48, borderRadius: 10 }} />
                ))
              ) : (
                leaderboard.slice(0, 3).map((entry) => (
                  <div
                    key={entry.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(30, 30, 30, 0.5)',
                      minHeight: '44px',
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
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
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: entry.rank <= 3 ? '#000' : 'var(--text-muted)',
                    }}>
                      {entry.rank}
                    </div>
                    <Avatar src={entry.avatar_url} alt={entry.display_name} fallback={entry.display_name} size="xs" />
                    <span style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {entry.display_name.split(' ')[0]}
                    </span>
                    <PriceDisplay value={entry.roi_pct} format="percent" variant="badge" size="xs" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        // Desktop: Original Two-Column Layout
        <>
          <div className="holdings-grid">
            {/* Left Column - Holdings Table */}
            <div>
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
              }}>
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
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
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
                    <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                      No holdings yet
                    </p>
                    <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
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
                      }}
                    >
                      Explore Creators
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <HoldingsList
                      holdings={portfolio?.holdings.slice(0, 5) || []}
                      totalInvested={portfolio?.total_invested || 0}
                      totalCurrentValue={portfolio?.total_value || 0}
                      totalPnL={totalPnL}
                      totalPnLPercent={portfolio?.roi_pct || 0}
                      isMobile={false}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - P&L Widget + Allocation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <PnLWidget
                totalPnL={totalPnL}
                totalPnLPercent={portfolio?.roi_pct || 0}
                currentValue={portfolio?.total_value || 0}
                investedValue={portfolio?.total_invested || 0}
              />

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
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Trending Creators
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
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
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {formatPrice(creator.current_price)}
                      </span>
                      <PriceDisplay value={creator.price_change_24h} format="percent" variant="badge" size="xs" />
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
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
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
                    <Avatar src={entry.avatar_url} alt={entry.display_name} fallback={entry.display_name} size="xs" />
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
                    <PriceDisplay value={entry.roi_pct} format="percent" variant="badge" size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
