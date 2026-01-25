import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Youtube,
  Users,
  ChevronLeft,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Coins,
} from 'lucide-react';
import { Avatar } from '../components/ui';
import { useCreator } from '../hooks/useCreators';
import { useAuthStore } from '../stores/authStore';
import { usePoolPriceSubscription } from '../hooks/useRealtime';
import { BuySellPanel } from '../components/trading/BuySellPanel';
import { PriceChart } from '../components/trading/PriceChart';
import { formatNumber, formatPrice } from '../components/trading';
import { api } from '../services/api';

export const CreatorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const { creator, priceHistory, isLoading, fetchPriceHistory, refresh: refreshCreator } = useCreator(id);
  const [chartPeriod, setChartPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Local state for real-time price updates
  const [realtimePrice, setRealtimePrice] = useState<number | null>(null);
  const [realtimePriceChange, setRealtimePriceChange] = useState<number | null>(null);

  // State for refreshing stats
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Refresh user data on mount to get latest holdings
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Subscribe to real-time pool updates
  const handlePriceUpdate = useCallback((newPrice: number, priceChange24h: number) => {
    setRealtimePrice(newPrice);
    setRealtimePriceChange(priceChange24h);
  }, []);

  usePoolPriceSubscription(creator?.pool?.id, handlePriceUpdate);

  // Find user's holding for this creator
  const userHolding = user?.holdings?.find(h => h.creator_id === id) || null;

  // Callback after trade completes
  const handleTradeComplete = useCallback(() => {
    refreshUser();
    refreshCreator();
    fetchPriceHistory(chartPeriod);
  }, [refreshUser, refreshCreator, fetchPriceHistory, chartPeriod]);

  // Handle refresh stats
  const handleRefreshStats = useCallback(async () => {
    if (!id || isRefreshingStats) return;

    // Rate limit: only allow refresh once per minute
    if (lastRefreshed && Date.now() - lastRefreshed.getTime() < 60000) {
      return;
    }

    setIsRefreshingStats(true);
    try {
      await api.refreshCreatorStats(id);
      await refreshCreator();
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    } finally {
      setIsRefreshingStats(false);
    }
  }, [id, isRefreshingStats, lastRefreshed, refreshCreator]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '3px solid rgba(234, 153, 153, 0.2)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!creator) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{
          width: 72,
          height: 72,
          margin: '0 auto 24px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <Users size={36} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.25rem', fontWeight: 600 }}>
          Creator not found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '28px' }}>
          This creator may have been removed or doesn't exist
        </p>
        <button
          onClick={() => navigate('/explore')}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const pool = creator.pool;
  const currentPrice = realtimePrice ?? pool?.current_price ?? 0;
  const priceChange = realtimePriceChange ?? pool?.price_change_24h ?? 0;
  const marketCap = pool?.market_cap || 0;
  const volume24h = pool?.volume_24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <div>
      {/* Back Button - Minimal */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.4)',
          cursor: 'pointer',
          padding: '0',
          marginBottom: '20px',
          fontSize: '0.8rem',
          fontWeight: 500,
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Main 2-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '28px',
        alignItems: 'start',
      }}>
        {/* Left Column - Market Data Panel */}
        <div>
          {/* Hero Header - Creator + Live Price */}
          <div style={{
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <Avatar src={creator.avatar_url} alt={creator.display_name} fallback={creator.display_name} size="xl" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <h1 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                  }}>
                    {creator.display_name}
                  </h1>
                  <span style={{
                    padding: '5px 12px',
                    background: 'linear-gradient(135deg, rgba(234, 153, 153, 0.15) 0%, rgba(234, 153, 153, 0.05) 100%)',
                    border: '1px solid rgba(234, 153, 153, 0.25)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    ${creator.token_symbol}
                  </span>
                </div>
                <a
                  href={`https://youtube.com/${creator.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                >
                  <Youtube size={14} />
                  {creator.username?.replace(/^@/, '')}
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefreshStats}
                disabled={isRefreshingStats || !!(lastRefreshed && Date.now() - lastRefreshed.getTime() < 60000)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  color: isRefreshingStats ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)',
                  cursor: isRefreshingStats ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isRefreshingStats) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = isRefreshingStats ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)';
                }}
              >
                <RefreshCw size={16} style={{ animation: isRefreshingStats ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>

            {/* Live Price - Large */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
              }}>
                {formatPrice(currentPrice)}
              </span>
              <span style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 500,
              }}>
                NMBR
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                background: isPositive ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                borderRadius: '8px',
                color: isPositive ? '#4ade80' : '#f87171',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* De-boxed Stats Row - Typography Hierarchy */}
          <div style={{
            display: 'flex',
            gap: '32px',
            padding: '20px 0',
            marginBottom: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <StatItem
              icon={<Coins size={14} />}
              label="Market Cap"
              value={formatNumber(marketCap)}
              suffix="NMBR"
            />
            <StatItem
              icon={<BarChart3 size={14} />}
              label="24h Volume"
              value={formatNumber(volume24h)}
              suffix="NMBR"
            />
            <StatItem
              icon={<Users size={14} />}
              label="Holders"
              value={(pool?.holder_count || 0).toString()}
            />
            <StatItem
              icon={<Activity size={14} />}
              label="Total Supply"
              value={formatNumber(pool?.token_supply || 9000000)}
            />
            <StatItem
              icon={<Users size={14} />}
              label="Subscribers"
              value={formatNumber(creator.subscriber_count)}
            />
          </div>

          {/* Chart Panel - Glassy, Tighter */}
          <div style={{
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
          }}>
            {/* Chart Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={14} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Price Chart
                </span>
              </div>

              {/* Period Selector - Pill Style */}
              <div style={{
                display: 'flex',
                gap: '4px',
                padding: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
              }}>
                {(['1h', '24h', '7d', '30d'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setChartPeriod(period);
                      fetchPriceHistory(period);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '7px',
                      border: 'none',
                      background: chartPeriod === period
                        ? 'linear-gradient(135deg, var(--color-accent-bg) 0%, rgba(234, 153, 153, 0.05) 100%)'
                        : 'transparent',
                      color: chartPeriod === period ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.4)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart - Tighter Height */}
            <div style={{ height: '220px' }}>
              <PriceChart
                data={priceHistory?.prices || []}
                period={chartPeriod}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Transaction Panel */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <BuySellPanel
            creator={creator}
            userBalance={user?.nmbr_balance || 0}
            userHolding={userHolding}
            onTradeComplete={handleTradeComplete}
          />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// De-boxed Stat Item Component
const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
}> = ({ icon, label, value, suffix }) => (
  <div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: 'rgba(255, 255, 255, 0.35)',
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '6px',
    }}>
      {icon}
      {label}
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: '4px',
    }}>
      <span style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#fff',
        fontFamily: 'var(--font-mono)',
      }}>
        {value}
      </span>
      {suffix && (
        <span style={{
          fontSize: '0.7rem',
          color: 'rgba(255, 255, 255, 0.35)',
          fontWeight: 500,
        }}>
          {suffix}
        </span>
      )}
    </div>
  </div>
);
