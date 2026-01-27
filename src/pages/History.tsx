import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { api, Transaction } from '../services/api';
import { formatCurrency } from '../components/trading';

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

type FilterType = 'all' | 'buy' | 'sell';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const limit = 20;
  const isMobile = useIsMobile();

  const fetchTransactions = useCallback(async (newOffset: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getTradeHistory({ limit, offset: newOffset });
      setTransactions(response.transactions);
      setTotal(response.total);
      setOffset(newOffset);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err?.message || 'Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: isMobile ? '2-digit' : 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTokenAmount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(4);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  // Transaction Card for Mobile
  const TransactionCard: React.FC<{ tx: Transaction }> = ({ tx }) => (
    <div
      onClick={() => tx.creator_id && navigate(`/creator/${tx.creator_id}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        cursor: tx.creator_id ? 'pointer' : 'default',
        minHeight: '72px',
      }}
    >
      {/* Type Icon */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: tx.type === 'buy' ? 'var(--color-positive-bg)' : 'var(--color-negative-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {tx.type === 'buy' ? (
          <ArrowDownLeft size={16} style={{ color: 'var(--color-positive)' }} />
        ) : (
          <ArrowUpRight size={16} style={{ color: 'var(--color-negative)' }} />
        )}
      </div>

      {/* Token Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
        }}>
          <span style={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
          }}>
            {tx.token_symbol || 'Token'}
          </span>
          <span style={{
            fontSize: '0.625rem',
            padding: '2px 5px',
            backgroundColor: tx.type === 'buy' ? 'var(--color-positive-bg)' : 'var(--color-negative-bg)',
            borderRadius: 'var(--radius-sm)',
            color: tx.type === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}>
            {tx.type}
          </span>
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          {formatDate(tx.created_at)} • {formatTime(tx.created_at)}
        </div>
      </div>

      {/* Values */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: tx.type === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)',
          marginBottom: '4px',
        }}>
          {tx.type === 'buy' ? '+' : '-'}{formatTokenAmount(tx.token_amount)}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          {formatCurrency(tx.nmbr_amount)}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'center' : 'flex-start',
        marginBottom: isMobile ? '16px' : '24px',
        gap: '12px',
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            History
          </h1>
          {!isMobile && (
            <p style={{
              margin: '4px 0 0',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
            }}>
              Your complete trading activity
            </p>
          )}
        </div>
        <button
          onClick={() => fetchTransactions(0)}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: isMobile ? '10px' : '10px 14px',
            backgroundColor: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: isMobile ? '10px' : 'var(--radius-md)',
            color: 'var(--text-secondary)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 500,
            opacity: isLoading ? 0.6 : 1,
            minHeight: '44px',
            minWidth: isMobile ? '44px' : undefined,
          }}
        >
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          {!isMobile && 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: isMobile ? '12px' : '20px',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        alignItems: 'center',
      }}>
        {(['all', 'buy', 'sell'] as FilterType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: isMobile ? '10px 14px' : '8px 16px',
              backgroundColor: filter === type ? 'var(--color-accent-bg)' : 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${filter === type ? 'var(--color-accent-border)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: isMobile ? '10px' : 'var(--radius-md)',
              color: filter === type ? 'var(--color-accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              minHeight: '44px',
            }}
          >
            {type === 'all' ? 'All' : type}
          </button>
        ))}
        <div style={{
          marginLeft: 'auto',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Calendar size={12} />
          {total} {isMobile ? '' : `transaction${total !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          padding: '20px',
          backgroundColor: 'var(--color-negative-bg)',
          border: '1px solid var(--color-negative-border)',
          borderRadius: '14px',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--color-negative)', margin: '0 0 12px', fontSize: '0.875rem' }}>
            {error}
          </p>
          <button
            onClick={() => fetchTransactions(0)}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--color-negative)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              minHeight: '44px',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Mobile Transaction Cards */}
      {isMobile ? (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="mobile-card-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <Clock size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No transactions yet
              </p>
              <button
                onClick={() => navigate('/explore')}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#000',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  minHeight: '44px',
                }}
              >
                Explore Creators
              </button>
            </div>
          )}

          {/* Transaction Cards */}
          {!isLoading && !error && filteredTransactions.length > 0 && (
            <div className="mobile-card-grid">
              {filteredTransactions.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Desktop Table View */
        <div style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '50px 1fr 140px 140px 100px',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Type</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Token</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, textAlign: 'right' }}>Amount</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, textAlign: 'right' }}>Value</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, textAlign: 'right' }}>Date</span>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 140px 140px 100px',
                  padding: '14px 16px',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)' }} />
                  <div>
                    <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 4 }} />
                  </div>
                  <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4, marginLeft: 'auto' }} />
                  <div className="skeleton" style={{ width: 70, height: 14, borderRadius: 4, marginLeft: 'auto' }} />
                  <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 4, marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div style={{
              padding: '64px 24px',
              textAlign: 'center',
            }}>
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
                <Clock size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{
                margin: '0 0 8px',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>
                No Transactions Yet
              </h3>
              <p style={{
                margin: '0 0 24px',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
              }}>
                Start trading to see your transaction history here
              </p>
              <button
                onClick={() => navigate('/explore')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#000',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                Explore Creators
              </button>
            </div>
          )}

          {/* Transaction Rows */}
          {!isLoading && !error && filteredTransactions.length > 0 && (
            <div>
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => tx.creator_id && navigate(`/creator/${tx.creator_id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 1fr 140px 140px 100px',
                    padding: '14px 16px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: tx.creator_id ? 'pointer' : 'default',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (tx.creator_id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Type Icon */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: tx.type === 'buy' ? 'var(--color-positive-bg)' : 'var(--color-negative-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {tx.type === 'buy' ? (
                      <ArrowDownLeft size={14} style={{ color: 'var(--color-positive)' }} />
                    ) : (
                      <ArrowUpRight size={14} style={{ color: 'var(--color-negative)' }} />
                    )}
                  </div>

                  {/* Token Info */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '2px',
                    }}>
                      <span style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                      }}>
                        {tx.token_symbol || 'Token'}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem',
                        padding: '2px 6px',
                        backgroundColor: tx.type === 'buy' ? 'var(--color-positive-bg)' : 'var(--color-negative-bg)',
                        borderRadius: 'var(--radius-sm)',
                        color: tx.type === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>
                        {tx.type}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}>
                      @ {formatCurrency(tx.nmbr_amount / tx.token_amount)}/token
                    </div>
                  </div>

                  {/* Token Amount */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: tx.type === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)',
                    }}>
                      {tx.type === 'buy' ? '+' : '-'}{formatTokenAmount(tx.token_amount)}
                    </span>
                  </div>

                  {/* NMBR Value */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                    }}>
                      {formatCurrency(tx.nmbr_amount)}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                    }}>
                      {formatDate(tx.created_at)}
                    </div>
                    <div style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                    }}>
                      {formatTime(tx.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && total > limit && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginTop: '24px',
        }}>
          <button
            disabled={offset === 0}
            onClick={() => fetchTransactions(Math.max(0, offset - limit))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: isMobile ? '10px 14px' : '8px 14px',
              backgroundColor: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: isMobile ? '10px' : 'var(--radius-md)',
              color: offset === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: offset === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              opacity: offset === 0 ? 0.5 : 1,
              minHeight: '44px',
            }}
          >
            <ChevronLeft size={14} />
            {!isMobile && 'Previous'}
          </button>
          <span style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
            {currentPage}/{totalPages}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => fetchTransactions(offset + limit)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: isMobile ? '10px 14px' : '8px 14px',
              backgroundColor: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: isMobile ? '10px' : 'var(--radius-md)',
              color: offset + limit >= total ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: offset + limit >= total ? 'not-allowed' : 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              opacity: offset + limit >= total ? 0.5 : 1,
              minHeight: '44px',
            }}
          >
            {!isMobile && 'Next'}
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
