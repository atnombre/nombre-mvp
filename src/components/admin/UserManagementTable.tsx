import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    MoreVertical,
    Eye,
    Ban,
    UserX,
    Check,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminUser {
    id: string;
    email: string;
    display_name: string;
    username: string | null;
    avatar_url: string | null;
    nmbr_balance: number;
    portfolio_value: number;
    created_at: string;
    is_banned: boolean;
    faucet_claimed: boolean;
}

interface UserManagementTableProps {
    onInspectPortfolio: (userId: string) => void;
}

/**
 * UserManagementTable - High-density searchable user registry.
 * 
 * Features:
 * - Search by email/name/username
 * - Actions: Ban/Unban, Reset Username, Inspect Portfolio
 * - Pagination
 */
export const UserManagementTable: React.FC<UserManagementTableProps> = ({
    onInspectPortfolio
}) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const limit = 15;

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.getAllUsers({
                limit,
                offset: page * limit,
                search: search || undefined,
            });
            setUsers(data.users);
            setTotal(data.total);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPage(0);
            fetchUsers();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleBan = async (userId: string, isBanned: boolean) => {
        setActionLoading(userId);
        try {
            if (isBanned) {
                await api.unbanUser(userId);
            } else {
                await api.banUser(userId);
            }
            await fetchUsers();
        } catch (err) {
            console.error('Ban action failed:', err);
        } finally {
            setActionLoading(null);
            setActiveDropdown(null);
        }
    };

    const handleResetUsername = async (userId: string) => {
        setActionLoading(userId);
        try {
            await api.resetUsername(userId);
            await fetchUsers();
        } catch (err) {
            console.error('Reset username failed:', err);
        } finally {
            setActionLoading(null);
            setActiveDropdown(null);
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            {/* Search Bar */}
            <div style={{ padding: '16px 24px' }}>
                <div style={{
                    position: 'relative',
                    maxWidth: '320px',
                }}>
                    <Search
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by email, name, or username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.8125rem',
                            outline: 'none',
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.8125rem',
                }}>
                    <thead>
                        <tr style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Balance</th>
                            <th style={thStyle}>Portfolio</th>
                            <th style={thStyle}>Joined</th>
                            <th style={thStyle}>Status</th>
                            <th style={{ ...thStyle, width: '60px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                    Loading users...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
                                    {error}
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr
                                    key={user.id}
                                    style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                        transition: 'background-color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    {/* User */}
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img
                                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.display_name}&background=333&color=fff`}
                                                alt={user.display_name}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <div>
                                                <div style={{
                                                    fontWeight: 500,
                                                    color: '#fff',
                                                    marginBottom: '2px',
                                                }}>
                                                    {user.display_name}
                                                </div>
                                                {user.username && (
                                                    <div style={{
                                                        fontSize: '0.6875rem',
                                                        color: 'rgba(255,255,255,0.4)'
                                                    }}>
                                                        @{user.username}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td style={tdStyle}>
                                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                            {user.email}
                                        </span>
                                    </td>

                                    {/* Balance */}
                                    <td style={tdStyle}>
                                        <span style={{
                                            fontWeight: 500,
                                            color: '#fff',
                                            fontFeatureSettings: '"tnum"',
                                        }}>
                                            {formatNumber(user.nmbr_balance)}
                                        </span>
                                        <span style={{
                                            color: 'rgba(255,255,255,0.4)',
                                            marginLeft: '4px',
                                            fontSize: '0.6875rem',
                                        }}>
                                            NMBR
                                        </span>
                                    </td>

                                    {/* Portfolio */}
                                    <td style={tdStyle}>
                                        <span style={{
                                            fontWeight: 500,
                                            color: '#fff',
                                            fontFeatureSettings: '"tnum"',
                                        }}>
                                            {formatNumber(user.portfolio_value)}
                                        </span>
                                    </td>

                                    {/* Joined */}
                                    <td style={tdStyle}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {formatDate(user.created_at)}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td style={tdStyle}>
                                        {user.is_banned ? (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 8px',
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '4px',
                                                color: '#EF4444',
                                                fontSize: '0.6875rem',
                                                fontWeight: 500,
                                            }}>
                                                <X size={12} />
                                                Banned
                                            </span>
                                        ) : (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 8px',
                                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                borderRadius: '4px',
                                                color: '#22C55E',
                                                fontSize: '0.6875rem',
                                                fontWeight: 500,
                                            }}>
                                                <Check size={12} />
                                                Active
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td style={{ ...tdStyle, position: 'relative' }}>
                                        <button
                                            onClick={() => setActiveDropdown(
                                                activeDropdown === user.id ? null : user.id
                                            )}
                                            style={{
                                                padding: '6px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                color: 'rgba(255,255,255,0.5)',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeDropdown === user.id && (
                                            <>
                                                {/* Backdrop */}
                                                <div
                                                    style={{
                                                        position: 'fixed',
                                                        inset: 0,
                                                        zIndex: 99,
                                                    }}
                                                    onClick={() => setActiveDropdown(null)}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    right: '0',
                                                    top: '100%',
                                                    marginTop: '4px',
                                                    backgroundColor: 'rgba(30, 30, 30, 0.98)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '8px',
                                                    padding: '4px',
                                                    minWidth: '160px',
                                                    zIndex: 100,
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                }}>
                                                    <button
                                                        onClick={() => {
                                                            onInspectPortfolio(user.id);
                                                            setActiveDropdown(null);
                                                        }}
                                                        style={dropdownItemStyle}
                                                    >
                                                        <Eye size={14} />
                                                        Inspect Portfolio
                                                    </button>
                                                    <button
                                                        onClick={() => handleBan(user.id, user.is_banned)}
                                                        disabled={actionLoading === user.id}
                                                        style={dropdownItemStyle}
                                                    >
                                                        <Ban size={14} />
                                                        {user.is_banned ? 'Unban User' : 'Ban User'}
                                                    </button>
                                                    {user.username && (
                                                        <button
                                                            onClick={() => handleResetUsername(user.id)}
                                                            disabled={actionLoading === user.id}
                                                            style={dropdownItemStyle}
                                                        >
                                                            <UserX size={14} />
                                                            Reset Username
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
                <span style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                }}>
                    Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total} users
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: page === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                            cursor: page === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                        }}
                    >
                        <ChevronLeft size={14} />
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: page >= totalPages - 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                            cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                        }}
                    >
                        Next
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Styles
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
    padding: '12px 16px',
    verticalAlign: 'middle',
};

const dropdownItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
};
