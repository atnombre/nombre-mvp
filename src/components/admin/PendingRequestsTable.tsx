import React, { useEffect, useState } from 'react';
import { api, RequestItem } from '../../services/api';
import { Avatar } from '../ui/Avatar';
import { Check, X, Clock, ExternalLink } from 'lucide-react';

export const PendingRequestsTable: React.FC = () => {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await api.getRequests('pending');
            setRequests(data.requests);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string, channelName: string) => {
        if (!confirm(`Are you sure you want to IPO "${channelName}"? This will mint the token immediately.`)) return;

        setProcessingId(id);
        try {
            await api.approveRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error: any) {
            alert(error.message || 'Failed to approve');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this request?')) return;

        setProcessingId(id);
        try {
            await api.rejectRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error: any) {
            alert(error.message || 'Failed to reject');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</div>;
    }

    if (requests.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No pending requests at the moment.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>Channel</th>
                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>Channel ID</th>
                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>Requested By</th>
                        <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {/* Since we don't store avatar in requests table yet, use placeholder */}
                                    <Avatar src="" alt={req.channel_name} fallback={req.channel_name} size="sm" />
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.channel_name}</div>
                                        {req.username && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{req.username}</div>
                                        )}
                                    </div>
                                    <a
                                        href={`https://youtube.com/channel/${req.youtube_channel_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: 'var(--color-accent)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: 'rgba(234, 153, 153, 0.1)',
                                            fontSize: '0.75rem',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <ExternalLink size={12} /> Channel
                                    </a>
                                </div>
                            </td>
                            <td style={{ padding: '16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {req.youtube_channel_id}
                            </td>
                            <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                {req.requested_by_user_id ?
                                    <span style={{ fontFamily: 'monospace' }}>{req.requested_by_user_id.slice(0, 8)}...</span>
                                    : 'System'}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        disabled={processingId === req.id}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-color)',
                                            background: 'transparent',
                                            color: '#fca5a5',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        <X size={14} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(req.id, req.channel_name)}
                                        disabled={processingId === req.id}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: 'var(--color-positive)',
                                            color: '#000',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        {processingId === req.id ? 'Processing...' : <><Check size={14} /> Approve & Mint</>}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
