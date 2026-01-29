import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Activity,
    Coins,
    DollarSign
} from 'lucide-react';
import { api, AdminTransactionItem } from '../../services/api';

/**
 * TransactionDetailsPage - Detailed inspector for a single transaction.
 * Fetches data by ID from URL params.
 */
export const TransactionDetailsPage: React.FC = () => {
    const { txId } = useParams<{ txId: string }>();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState<AdminTransactionItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            if (!txId) return;
            try {
                setIsLoading(true);
                const data = await api.getAdminTransaction(txId);
                setTransaction(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load transaction');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransaction();
    }, [txId]);

    const formatNumber = (num: number, decimals = 2) => {
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'medium'
        });
    };

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                Loading transaction details...
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ color: '#EF4444', marginBottom: '16px' }}>{error || 'Transaction not found'}</div>
                <button
                    onClick={() => navigate('/admin/transactions')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    Back to Ledger
                </button>
            </div>
        );
    }

    const isBuy = transaction.type === 'buy';
    const accentColor = isBuy ? '#22C55E' : '#EF4444';
    const accentBg = isBuy ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    const accentBorder = isBuy ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';

    return (
        <div>
            {/* Header / Nav */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate('/admin/transactions')}
                    style={{
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                    Transaction Details
                </h1>
            </div>

            {/* Main Card */}
            <div style={{
                backgroundColor: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                maxWidth: '800px',
                margin: '0 auto',
            }}>
                {/* Status Bar */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            padding: '6px 12px',
                            backgroundColor: accentBg,
                            border: `1px solid ${accentBorder}`,
                            borderRadius: '6px',
                            color: accentColor,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            {transaction.type}
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                            {formatDate(transaction.created_at)}
                        </span>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: transaction.status === 'success' ? '#22C55E' : '#EF4444',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                    }}>
                        {transaction.status.toUpperCase()}
                    </div>
                </div>

                <div style={{ padding: '32px' }}>
                    {/* Flow Visualization */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '40px',
                        padding: '32px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}>
                        {/* Initiator (User) */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                            }}>
                                <img
                                    src={transaction.user_avatar_url || `https://ui-avatars.com/api/?name=${transaction.user_display_name}&background=333&color=fff`}
                                    alt={transaction.user_display_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                                {transaction.user_display_name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                @{transaction.user_username || 'user'}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '0 32px',
                            color: 'rgba(255, 255, 255, 0.3)',
                        }}>
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                                marginBottom: '8px',
                                fontWeight: 600,
                            }}>
                                {formatNumber(transaction.nmbr_amount)} NMBR
                            </div>
                            <div style={{
                                width: '100%',
                                height: '3px',
                                backgroundColor: isBuy ? '#22C55E' : '#EF4444',
                                position: 'relative',
                                minWidth: '120px',
                                borderRadius: '2px',
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    right: '-6px',
                                    top: '-5px',
                                    width: '0',
                                    height: '0',
                                    borderTop: '6px solid transparent',
                                    borderBottom: '6px solid transparent',
                                    borderLeft: `8px solid ${isBuy ? '#22C55E' : '#EF4444'}`,
                                }} />
                            </div>
                        </div>

                        {/* Destination (Pool) */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#fff',
                            }}>
                                {transaction.token_symbol}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                                {transaction.token_symbol} Protocol
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                {transaction.creator_name}
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', // Responsive grid
                        gap: '20px',
                        marginBottom: '32px',
                    }}>
                        <DetailItem
                            label="Transaction Value"
                            value={`${formatNumber(transaction.nmbr_amount)} NMBR`}
                            icon={Coins}
                        />
                        <DetailItem
                            label="Tokens Exchanged"
                            value={`${formatNumber(transaction.token_amount, 4)} ${transaction.token_symbol}`}
                            icon={DollarSign}
                        />
                        <DetailItem
                            label="Execution Price"
                            value={`${formatNumber(transaction.price_per_token, 6)} NMBR`}
                            icon={Activity}
                        />
                        <DetailItem
                            label="Price Impact"
                            value={`${transaction.price_impact_pct.toFixed(3)}%`}
                            subValue="Market Curve Impact"
                            icon={Activity}
                        />
                        <DetailItem
                            label="Slippage"
                            value={`${transaction.slippage_pct.toFixed(3)}%`}
                            subValue="Execution Vs. Expected"
                            icon={Activity}
                        />
                        <DetailItem
                            label="Protocol Fee"
                            value={`${formatNumber(transaction.fee_amount, 4)} NMBR`}
                            icon={Coins}
                        />
                    </div>

                    {/* Metadata Footer */}
                    <div style={{
                        marginTop: '24px',
                        padding: '24px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Transaction ID</span>
                            <span style={{ fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.7)' }}>
                                {transaction.id}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Timestamp</span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {formatDate(transaction.created_at)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>User ID</span>
                            <span style={{ fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.7)' }}>
                                {transaction.user_id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Subcomponent
const DetailItem: React.FC<{
    label: string,
    value: string,
    subValue?: string,
    icon: any,
    valueColor?: string
}> = ({ label, value, subValue, icon: Icon, valueColor = '#fff' }) => (
    <div style={{
        padding: '16px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Icon size={16} color="rgba(255, 255, 255, 0.4)" />
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.5)' }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: valueColor, fontFeatureSettings: '"tnum"' }}>
            {value}
        </div>
        {subValue && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.3)', marginTop: '4px' }}>
                {subValue}
            </div>
        )}
    </div>
);
