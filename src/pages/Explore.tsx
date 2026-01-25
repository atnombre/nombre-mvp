import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, BarChart3, DollarSign, Users, Plus, ChevronRight } from 'lucide-react';
import { useCreators } from '../hooks/useCreators';
import { useAllPoolsSubscription } from '../hooks/useRealtime';
import { AddCreatorModal } from '../components/AddCreatorModal';
import { Avatar } from '../components/ui';
import { PriceDisplay, formatNumber, formatPrice, DataTable } from '../components/trading';
import { useAuthStore } from '../stores/authStore';

type SortOption = 'volume_24h' | 'price_change_24h' | 'market_cap' | 'cpi_score';

interface PoolPriceUpdate {
  current_price?: number;
  price_change_24h?: number;
  volume_24h?: number;
  market_cap?: number;
}

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('volume_24h');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Real-time price updates map
  const [realtimeUpdates, setRealtimeUpdates] = useState<Record<string, PoolPriceUpdate>>({});

  const { creators, total, isLoading, setParams, loadMore, refresh } = useCreators({
    sortBy,
    search: searchQuery || undefined,
  });

  // Subscribe to all pool updates
  const handlePoolUpdate = useCallback((poolId: string, updates: PoolPriceUpdate) => {
    setRealtimeUpdates(prev => ({
      ...prev,
      [poolId]: { ...prev[poolId], ...updates }
    }));
  }, []);

  useAllPoolsSubscription(handlePoolUpdate);

  const getCreatorPrice = (creator: any) => {
    const updates = realtimeUpdates[creator.id];
    return updates?.current_price ?? creator.current_price;
  };

  const getCreatorPriceChange = (creator: any) => {
    const updates = realtimeUpdates[creator.id];
    return updates?.price_change_24h ?? creator.price_change_24h;
  };

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'volume_24h', label: 'Volume', icon: <BarChart3 size={14} /> },
    { value: 'price_change_24h', label: 'Gainers', icon: <TrendingUp size={14} /> },
    { value: 'market_cap', label: 'Market Cap', icon: <DollarSign size={14} /> },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setParams({ search: value || undefined });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setParams({ sortBy: sort });
  };

  const handleCreatorAdded = () => {
    refresh();
  };

  // Table columns configuration
  const tableColumns = [
    {
      key: 'name',
      header: 'Creator',
      width: '260px',
      render: (creator: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar src={creator.avatar_url} alt={creator.display_name} fallback={creator.display_name} size="sm" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              {creator.token_symbol}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {creator.display_name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'current_price',
      header: 'Price',
      align: 'right' as const,
      width: '100px',
      render: (creator: any) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {formatPrice(getCreatorPrice(creator))}
        </span>
      ),
    },
    {
      key: 'price_change_24h',
      header: '24h Change',
      align: 'right' as const,
      width: '120px',
      sortable: true,
      render: (creator: any) => (
        <PriceDisplay
          value={getCreatorPriceChange(creator)}
          format="percent"
          variant="badge"
          size="sm"
        />
      ),
    },
    {
      key: 'market_cap',
      header: 'Market Cap',
      align: 'right' as const,
      width: '120px',
      sortable: true,
      render: (creator: any) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {formatNumber(creator.market_cap)}
        </span>
      ),
    },
    {
      key: 'volume_24h',
      header: '24h Volume',
      align: 'right' as const,
      width: '120px',
      sortable: true,
      render: (creator: any) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {formatNumber(creator.volume_24h)}
        </span>
      ),
    },
    {
      key: 'subscriber_count',
      header: 'Subscribers',
      align: 'right' as const,
      width: '110px',
      render: (creator: any) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {formatNumber(creator.subscriber_count)}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      width: '40px',
      align: 'center' as const,
      render: () => (
        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
      ),
    },
  ];

  return (
    <div>
      {/* Add Creator Modal */}
      <AddCreatorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreatorAdded={handleCreatorAdded}
      />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Explore Creators
          </h1>
          <p style={{
            margin: '4px 0 0',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
          }}>
            Discover and invest in your favorite creators
          </p>
        </div>
        {user?.is_admin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={16} />
            Add Creator
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '280px', maxWidth: '400px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            transition: 'var(--transition-fast)',
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={handleSearch}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
              }}
            />
          </div>
        </div>

        {/* Sort Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                backgroundColor: sortBy === option.value ? 'var(--color-accent-bg)' : 'var(--bg-tertiary)',
                border: `1px solid ${sortBy === option.value ? 'var(--color-accent-border)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                color: sortBy === option.value ? 'var(--color-accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500,
                transition: 'var(--transition-fast)',
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div style={{
          marginLeft: 'auto',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}>
          {isLoading ? 'Loading...' : `${total} creator${total !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Creators Table - Glassmorphic Container */}
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ padding: '20px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: 120, height: 10, borderRadius: 4 }} />
                </div>
                <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: 70, height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: 70, height: 14, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : creators.length === 0 ? (
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
              <Users size={32} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{
              margin: '0 0 8px',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              fontWeight: 600,
            }}>
              No creators found
            </h3>
            <p style={{
              margin: '0 0 24px',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
            }}>
              Try adjusting your search or filters
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setParams({ search: undefined });
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-hover)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  transition: 'var(--transition-fast)',
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <DataTable
            columns={tableColumns}
            data={creators}
            keyExtractor={(creator) => creator.id}
            onRowClick={(creator) => navigate(`/creator/${creator.id}`)}
            sortKey={sortBy}
            sortOrder="desc"
            onSort={(key) => handleSortChange(key as SortOption)}
            compact
          />
        )}
      </div>

      {/* Load More */}
      {!isLoading && creators.length < total && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={loadMore}
            style={{
              padding: '12px 32px',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-hover)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              transition: 'var(--transition-normal)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.borderColor = 'var(--color-accent-border)';
              e.currentTarget.style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};
