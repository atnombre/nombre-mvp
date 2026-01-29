import React from 'react';
import { TransactionExplorer } from '../../components/admin/TransactionExplorer';

/**
 * GlobalLedger - Page for monitoring platform transactions.
 */
export const GlobalLedger: React.FC = () => {
    return (
        <div>
            <div style={{
                marginBottom: '24px'
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                }}>
                    Global Ledger
                </h1>
                <p style={{
                    margin: '4px 0 0',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.8125rem',
                }}>
                    Real-time transaction explorer
                </p>
            </div>

            <div style={{
                background: 'rgba(20, 20, 20, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
            }}>
                <TransactionExplorer />
            </div>
        </div>
    );
};
