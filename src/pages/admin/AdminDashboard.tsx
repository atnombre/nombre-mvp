import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Coins,
    TrendingUp,
    Activity,
    RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { UserManagementTable } from '../../components/admin/UserManagementTable';

interface AdminStats {
    total_users: number;
    new_users_24h: number;
    total_nmbr_circulating: number;
    volume_24h: number;
    system_status: string;
}

/**
 * AdminDashboard - Main admin control center.
 * 
 * Features:
 * - 4 Glassmorphic stat cards with platform health metrics
 * - User Management table with search/actions
 */
export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const data = await api.getAdminStats();
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const statCards = [
        {
            label: 'Total Users',
            value: stats ? formatNumber(stats.total_users) : '--',
            subValue: stats ? `+${stats.new_users_24h} new (24h)` : '',
            icon: Users,
            // Indigo gradient (Brand Primary)
            gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
        },
        {
            label: 'NMBR Circulating',
            value: stats ? formatNumber(stats.total_nmbr_circulating) : '--',
            subValue: 'Total supply in wallets',
            icon: Coins,
            // Coral/Rose gradient (Brand Accent)
            gradient: 'linear-gradient(135deg, #EA9999 0%, #E11D48 100%)',
        },
        {
            label: '24h Volume',
            value: stats ? formatNumber(stats.volume_24h) : '--',
            subValue: 'NMBR traded',
            icon: TrendingUp,
            // Emerald gradient (kept for financial context)
            gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        },
        {
            label: 'System Status',
            value: stats?.system_status?.toUpperCase() || '--',
            subValue: 'All systems operational',
            icon: Activity,
            gradient: stats?.system_status === 'healthy'
                ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                    }}>
                        Platform Overview
                    </h1>
                    <p style={{
                        margin: '4px 0 0',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.8125rem',
                    }}>
                        Monitor platform health and manage users
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={isLoading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                    }}
                >
                    <RefreshCw
                        size={16}
                        style={{
                            animation: isLoading ? 'spin 1s linear infinite' : 'none'
                        }}
                    />
                    Refresh
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    color: '#EF4444',
                    marginBottom: '24px',
                    fontSize: '0.875rem',
                }}>
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px',
            }}>
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'rgba(20, 20, 20, 0.6)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '20px',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Gradient accent */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: card.gradient,
                        }} />

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '16px',
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: card.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <card.icon size={18} color="#fff" />
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.5)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}>
                                {card.label}
                            </span>
                        </div>

                        <div style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: '#fff',
                            marginBottom: '4px',
                            fontFeatureSettings: '"tnum"',
                        }}>
                            {card.value}
                        </div>

                        <div style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}>
                            {card.subValue}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Management Section */}
            <div style={{
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#fff',
                        }}>
                            User Registry
                        </h2>
                        <p style={{
                            margin: '4px 0 0',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}>
                            Manage all registered users
                        </p>
                    </div>
                </div>

                <UserManagementTable
                    onInspectPortfolio={(userId: string) => navigate(`/admin/inspect/${userId}`)}
                />
            </div>
        </div>
    );
};
