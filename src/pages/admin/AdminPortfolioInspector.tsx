import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Shield,
    User,
    ExternalLink
} from 'lucide-react';
import { api, PortfolioResponse } from '../../services/api';
import {
    StatCard,
    formatNumber,
    HoldingsList,
    PortfolioChart,
    PortfolioAllocation,
} from '../../components/trading';

interface UserInfo {
    id: string;
    email: string;
    display_name: string;
    username: string | null;
    avatar_url: string | null;
    nmbr_balance: number;
    is_banned: boolean;
}

/**
 * AdminPortfolioInspector - View any user's portfolio as admin.
 * 
 * Features:
 * - Prominent orange "ADMIN VIEWING AS [USERNAME]" banner
 * - Reuses existing portfolio components
 * - Read-only mode (no trading actions)
 */
export const AdminPortfolioInspector: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);

                // Fetch user info and portfolio in parallel
                const [user, portfolioData] = await Promise.all([
                    api.getAdminUserDetails(userId),
                    api.getAdminUserPortfolio(userId),
                ]);

                setUserInfo(user);
                setPortfolio(portfolioData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                color: 'rgba(255, 255, 255, 0.5)',
            }}>
                Loading user portfolio...
            </div>
        );
    }

    if (error || !userInfo || !portfolio) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '64px 24px',
            }}>
                <p style={{ color: '#EF4444', marginBottom: '16px' }}>
                    {error || 'User not found'}
                </p>
                <button
                    onClick={() => navigate('/admin')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Back to Admin
                </button>
            </div>
        );
    }

    const holdingsCount = portfolio.holdings?.length || 0;
    const totalPnL = portfolio.total_pnl || 0;
    const isProfit = totalPnL >= 0;

    return (
        <div>
            {/* Admin Viewing Banner - Brand Accent (Coral/Rose) */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(234, 153, 153, 0.15) 0%, rgba(225, 29, 72, 0.1) 100%)',
                border: '1px solid rgba(234, 153, 153, 0.3)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #EA9999 0%, #E11D48 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Shield size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#EA9999',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '2px',
                        }}>
                            Admin Viewing As
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <img
                                src={userInfo.avatar_url || `https://ui-avatars.com/api/?name=${userInfo.display_name}&background=333&color=fff`}
                                alt={userInfo.display_name}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                }}
                            />
                            <span style={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#fff',
                            }}>
                                {userInfo.display_name}
                                {userInfo.username && (
                                    <span style={{
                                        color: 'rgba(255,255,255,0.5)',
                                        fontWeight: 400,
                                        marginLeft: '8px',
                                    }}>
                                        @{userInfo.username}
                                    </span>
                                )}
                            </span>
                            {userInfo.is_banned && (
                                <span style={{
                                    padding: '2px 8px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    borderRadius: '4px',
                                    color: '#EF4444',
                                    fontSize: '0.6875rem',
                                    fontWeight: 500,
                                }}>
                                    BANNED
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/admin')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Registry
                </button>
            </div>

            {/* Portfolio Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '24px',
            }}>
                <StatCard
                    label="NMBR Balance"
                    value={formatNumber(userInfo.nmbr_balance)}
                    subValue="Available"
                    icon={<User size={14} />}
                    size="sm"
                />
                <StatCard
                    label="Portfolio Value"
                    value={formatNumber(portfolio.total_value)}
                    subValue="NMBR"
                    icon={<ExternalLink size={14} />}
                    size="sm"
                />
                <StatCard
                    label="Total P&L"
                    value={isProfit ? `+${formatNumber(totalPnL)}` : formatNumber(totalPnL)}
                    trend={portfolio.roi_pct}
                    variant={isProfit ? 'positive' : 'negative'}
                    size="sm"
                />
                <StatCard
                    label="Holdings"
                    value={holdingsCount.toString()}
                    subValue="Positions"
                    size="sm"
                />
            </div>

            {/* Chart + Allocation */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 400px',
                gap: '20px',
                marginBottom: '24px',
            }}>
                {/* Performance Chart */}
                <div style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '20px',
                }}>
                    <h3 style={{
                        margin: '0 0 16px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#fff',
                    }}>
                        Portfolio Performance
                    </h3>
                    <PortfolioChart
                        holdings={portfolio.holdings}
                        totalPnL={totalPnL}
                        valueChangePercent={portfolio.roi_pct}
                        height={200}
                        showTimeControls={false}
                    />
                </div>

                {/* Allocation */}
                <div style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '20px',
                }}>
                    <h3 style={{
                        margin: '0 0 16px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#fff',
                    }}>
                        Allocation
                    </h3>
                    {holdingsCount > 0 ? (
                        <PortfolioAllocation
                            holdings={portfolio.holdings.map(h => ({
                                name: h.creator_name,
                                symbol: h.token_symbol,
                                value: h.current_value,
                            }))}
                            totalValue={portfolio.total_value}
                            maxItems={6}
                        />
                    ) : (
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '0.8125rem',
                            textAlign: 'center',
                            padding: '40px 0',
                        }}>
                            No holdings
                        </div>
                    )}
                </div>
            </div>

            {/* Holdings List */}
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
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: '#fff',
                    }}>
                        Holdings ({holdingsCount})
                    </h3>
                </div>

                {holdingsCount === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '64px 24px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.875rem',
                    }}>
                        This user has no holdings
                    </div>
                ) : (
                    <HoldingsList
                        holdings={portfolio.holdings}
                        totalInvested={portfolio.total_invested}
                        totalCurrentValue={portfolio.total_value}
                        totalPnL={totalPnL}
                        totalPnLPercent={portfolio.roi_pct}
                        isMobile={false}
                    />
                )}
            </div>
        </div>
    );
};
