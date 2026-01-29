import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    Clock
} from 'lucide-react';
import { api, AdminTransactionItem } from '../../services/api';

/**
 * TransactionExplorer - High-density ledger for admin monitoring.
 */
export const TransactionExplorer: React.FC = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<AdminTransactionItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(0);
    const limit = 50;

    // Filters
    const [search, setSearch] = useState('');
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
    const [poolId] = useState<string | undefined>(undefined);
    const [userId] = useState<string | undefined>(undefined);
    const [txType, setTxType] = useState<'buy' | 'sell' | undefined>(undefined);
    const [minAmount, setMinAmount] = useState<string>('');
    const [maxAmount, setMaxAmount] = useState<string>('');

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.getAdminTransactions({
                limit,
                offset: page * limit,
                search: search || undefined,
                time_range: timeRange,
                pool_id: poolId,
                user_id: userId,
                type: txType,
                min_amount: minAmount ? parseFloat(minAmount) : undefined,
                max_amount: maxAmount ? parseFloat(maxAmount) : undefined
            });
            setTransactions(data.transactions);
            setTotal(data.total);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load transactions');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, timeRange, poolId, userId, txType, minAmount, maxAmount]);

    // Initial load
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Debounced search (simplistic for now)
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (page !== 0) setPage(0);
            else fetchTransactions();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleInspect = (tx: AdminTransactionItem) => {
        navigate(`/admin/transactions/${tx.id}`);
    };

    const formatNumber = (num: number, decimals = 2) => {
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            {/* Filter Bar */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                {/* Search */}
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                    <input
                        type="text"
                        placeholder="Search ID, User, Token..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.8125rem',
                            outline: 'none',
                        }}
                    />
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                        value={timeRange}
                        onChange={(e) => {
                            setTimeRange(e.target.value as any);
                            setPage(0);
                        }}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.8125rem',
                            outline: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="all">All Time</option>
                        <option value="24h">Last 24h</option>
                        <option value="7d">Last 7d</option>
                        <option value="30d">Last 30d</option>
                    </select>

                    <select
                        value={txType || 'all'}
                        onChange={(e) => {
                            setTxType(e.target.value === 'all' ? undefined : e.target.value as 'buy' | 'sell');
                            setPage(0);
                        }}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.8125rem',
                            outline: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="buy">Buys</option>
                        <option value="sell">Sells</option>
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                            type="number"
                            placeholder="Min NMBR"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            style={{
                                width: '80px',
                                padding: '8px 12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.8125rem',
                                outline: 'none',
                            }}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>-</span>
                        <input
                            type="number"
                            placeholder="Max NMBR"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            style={{
                                width: '80px',
                                padding: '8px 12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.8125rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <button
                        onClick={fetchTransactions}
                        style={{
                            padding: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                        title="Refresh"
                    >
                        <Clock size={16} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.75rem',
                    fontFamily: '"SF Mono", "Roboto Mono", monospace',
                }}>
                    <thead>
                        <tr style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        }}>
                            <th style={thStyle}>Time</th>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Initiator</th>
                            <th style={thStyle}>Asset</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Value (NMBR)</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Tokens</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading transactions...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>{error}</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No transactions found</td></tr>
                        ) : (
                            transactions.map(tx => (
                                <tr
                                    key={tx.id}
                                    onClick={() => handleInspect(tx)}
                                    style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#fff' }}>{formatTime(tx.created_at)}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6875rem' }}>{formatDate(tx.created_at)}</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.6875rem',
                                            fontWeight: 600,
                                            backgroundColor: tx.type === 'buy' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: tx.type === 'buy' ? '#22C55E' : '#EF4444',
                                            border: `1px solid ${tx.type === 'buy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                        }}>
                                            {tx.type === 'buy' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                                            {tx.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img
                                                src={tx.user_avatar_url || `https://ui-avatars.com/api/?name=${tx.user_display_name}&background=333&color=fff`}
                                                alt=""
                                                style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                                            />
                                            <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                                                {tx.user_username ? `@${tx.user_username}` : tx.user_display_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ color: '#fff', fontWeight: 600 }}>${tx.token_symbol}</span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right', color: '#fff' }}>
                                        {formatNumber(tx.nmbr_amount)}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                                        {formatNumber(tx.token_amount, 4)}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right', color: 'rgba(255,255,255,0.5)' }}>
                                        {formatNumber(tx.price_per_token, 6)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{
                padding: '12px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={paginationBtnStyle(page === 0)}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        style={paginationBtnStyle(page >= totalPages - 1)}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.6875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
    padding: '10px 16px',
    verticalAlign: 'middle',
    color: 'rgba(255, 255, 255, 0.8)',
};

const paginationBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});
