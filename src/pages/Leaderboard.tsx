import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Sparkles, Medal, Award, Users, ChevronRight } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuthStore } from '../stores/authStore';
import { Avatar } from '../components/ui';
import { PriceDisplay, formatCurrency } from '../components/trading';

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

export const Leaderboard: React.FC = () => {
  const { user } = useAuthStore();
  const { leaderboard, myRank, totalUsers, isLoading, error } = useLeaderboard();
  const isMobile = useIsMobile();

  const myEntry = leaderboard.find(entry => entry.user_id === user?.id);

  const getRankBadge = (rank: number, size: 'sm' | 'md' = 'md') => {
    const baseSize = size === 'sm' ? 24 : 32;
    const iconSize = size === 'sm' ? 12 : 16;
    const fontSize = size === 'sm' ? '0.65rem' : '0.8125rem';

    const baseStyle: React.CSSProperties = {
      width: baseSize,
      height: baseSize,
      borderRadius: 'var(--radius-full)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize,
      fontFamily: 'var(--font-mono)',
      flexShrink: 0,
    };

    switch (rank) {
      case 1:
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#000',
            boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
          }}>
            <Crown size={iconSize} />
          </div>
        );
      case 2:
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
            color: '#333',
          }}>
            <Medal size={iconSize - 2} />
          </div>
        );
      case 3:
        return (
          <div style={{
            ...baseStyle,
            background: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
            color: '#fff',
          }}>
            <Award size={iconSize - 2} />
          </div>
        );
      default:
        return (
          <div style={{
            ...baseStyle,
            background: 'var(--bg-hover)',
            color: 'var(--text-muted)',
          }}>
            {rank}
          </div>
        );
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Leaderboard
          </h1>
        </div>

        {/* Stats Chips */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <Users size={12} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {totalUsers} traders
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-positive)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Live
            </span>
          </div>
        </div>

        {/* Your Rank Card - Compact */}
        {myRank && (
          <div style={{
            marginBottom: '16px',
            padding: '16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--color-accent-bg) 0%, rgba(20, 20, 20, 0.8) 100%)',
            border: '1px solid var(--color-accent-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <Avatar src={user?.avatar_url} alt={user?.display_name} fallback={user?.display_name} size="md" />
                {myRank <= 10 && (
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 18,
                    height: 18,
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-primary)',
                  }}>
                    <Sparkles size={8} color="#000" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '2px',
                }}>
                  Your Rank
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1,
                }}>
                  #{myRank}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '2px',
                }}>
                  Value
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--color-accent)',
                }}>
                  {formatCurrency(myEntry?.total_valuation || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Cards */}
        {isLoading ? (
          <div className="mobile-card-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
            ))}
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <Trophy size={32} style={{ color: 'var(--color-negative)', marginBottom: '12px' }} />
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Error loading leaderboard
            </p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <Trophy size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No traders yet
            </p>
          </div>
        ) : (
          <div className="mobile-card-grid">
            {leaderboard.map((entry) => {
              const isCurrentUser = user?.id === entry.user_id;

              return (
                <div
                  key={entry.user_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: isCurrentUser
                      ? 'linear-gradient(135deg, var(--color-accent-bg) 0%, rgba(20, 20, 20, 0.6) 100%)'
                      : 'rgba(20, 20, 20, 0.6)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '14px',
                    border: `1px solid ${isCurrentUser ? 'var(--color-accent-border)' : 'rgba(255, 255, 255, 0.08)'}`,
                    minHeight: '72px',
                  }}
                >
                  {getRankBadge(entry.rank, 'sm')}
                  <Avatar src={entry.avatar_url} alt={entry.display_name} fallback={entry.display_name} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '2px',
                    }}>
                      <span style={{
                        fontWeight: 600,
                        color: isCurrentUser ? 'var(--color-accent)' : 'var(--text-primary)',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {entry.display_name.split(' ')[0]}
                      </span>
                      {isCurrentUser && (
                        <span style={{
                          fontSize: '0.5rem',
                          padding: '2px 5px',
                          backgroundColor: 'var(--color-accent)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#000',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>
                          You
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}>
                      {formatCurrency(entry.total_valuation)}
                    </span>
                  </div>
                  <PriceDisplay value={entry.roi_pct} format="percent" variant="badge" size="sm" />
                </div>
              );
            })}
          </div>
        )}

        {/* Pulse animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // Desktop Layout - Original
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Leaderboard
        </h1>
        <p style={{
          margin: '4px 0 0',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
        }}>
          Top traders ranked by total valuation
        </p>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}>
          <Users size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {totalUsers} traders
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-positive)',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Live
          </span>
        </div>
      </div>

      {/* Your Rank Card */}
      {myRank && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--color-accent-bg) 0%, var(--bg-tertiary) 100%)',
          border: '1px solid var(--color-accent-border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Avatar src={user?.avatar_url} alt={user?.display_name} fallback={user?.display_name} size="lg" />
                {myRank <= 10 && (
                  <div style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 22,
                    height: 22,
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-primary)',
                  }}>
                    <Sparkles size={10} color="#000" />
                  </div>
                )}
              </div>
              <div>
                <div style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                  marginBottom: '4px',
                }}>
                  Your Rank
                </div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1,
                }}>
                  #{myRank}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 500,
                marginBottom: '4px',
              }}>
                Total Valuation
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'var(--color-accent)',
              }}>
                {formatCurrency(myEntry?.total_valuation || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '56px 1fr 140px 120px',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
        }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Rank</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Trader</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, textAlign: 'right' }}>Total Valuation</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, textAlign: 'right' }}>ROI</span>
        </div>

        {isLoading ? (
          <div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 140px 120px',
                padding: '14px 16px',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }} />
                  <div>
                    <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 4, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 4 }} />
                  </div>
                </div>
                <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4, marginLeft: 'auto' }} />
                <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 4, marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-negative-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trophy size={28} style={{ color: 'var(--color-negative)' }} />
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              Error loading leaderboard
            </p>
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              {error}
            </p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trophy size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              No traders yet
            </p>
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Start trading to claim your spot on the leaderboard!
            </p>
          </div>
        ) : (
          <div>
            {leaderboard.map((entry) => {
              const isCurrentUser = user?.id === entry.user_id;
              const isTopThree = entry.rank <= 3;

              return (
                <div
                  key={entry.user_id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr 140px 120px',
                    padding: '14px 16px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: isCurrentUser ? 'var(--color-accent-bg)' : 'transparent',
                    transition: 'var(--transition-fast)',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentUser) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentUser) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Rank */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {getRankBadge(entry.rank)}
                  </div>

                  {/* User Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <Avatar src={entry.avatar_url} alt={entry.display_name} fallback={entry.display_name} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span style={{
                          fontWeight: 600,
                          color: isCurrentUser ? 'var(--color-accent)' : 'var(--text-primary)',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {entry.display_name}
                        </span>
                        {isCurrentUser && (
                          <span style={{
                            fontSize: '0.5625rem',
                            padding: '2px 6px',
                            backgroundColor: 'var(--color-accent)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#000',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}>
                            You
                          </span>
                        )}
                      </div>
                      {isTopThree && (
                        <div style={{
                          fontSize: '0.6875rem',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}>
                          Top {entry.rank === 1 ? 'Trader' : `#${entry.rank}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Portfolio Value */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}>
                      {formatCurrency(entry.total_valuation)}
                    </span>
                  </div>

                  {/* ROI */}
                  <div style={{ textAlign: 'right' }}>
                    <PriceDisplay value={entry.roi_pct} format="percent" variant="badge" size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
