import { useState, useEffect, useCallback } from 'react';
import { api, Holding, PriceHistoryResponse } from '../services/api';

interface PortfolioPnLPoint {
    time: number; // ms timestamp
    pnl: number;  // Total P&L at this point
}

interface UsePortfolioPnLHistoryReturn {
    pnlHistory: PortfolioPnLPoint[];
    isLoading: boolean;
    error: string | null;
    refresh: (period?: string) => Promise<void>;
}

/**
 * Fetches price history for all holdings and computes cumulative portfolio P&L over time.
 * 
 * For each holding, we calculate P&L at each time point as:
 *   (price_at_time - avg_buy_price) * token_amount
 * 
 * Then aggregate all holdings' P&L at each timestamp.
 */
export function usePortfolioPnLHistory(holdings: Holding[] | undefined): UsePortfolioPnLHistoryReturn {
    const [pnlHistory, setPnlHistory] = useState<PortfolioPnLPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPnLHistory = useCallback(async (period: string = '7d') => {
        if (!holdings || holdings.length === 0) {
            setPnlHistory([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch price history for each holding in parallel
            const historyPromises = holdings.map(async (holding) => {
                try {
                    const priceHistory = await api.getCreatorPriceHistory(holding.creator_id, period);
                    return {
                        holding,
                        priceHistory: priceHistory.prices || [],
                    };
                } catch (err) {
                    console.warn(`Failed to fetch history for ${holding.token_symbol}:`, err);
                    return {
                        holding,
                        priceHistory: [],
                    };
                }
            });

            const allHistories = await Promise.all(historyPromises);

            // Create a map of timestamp -> { holdingId -> pnl }
            const pnlByTime = new Map<number, Map<string, number>>();

            for (const { holding, priceHistory } of allHistories) {
                for (const point of priceHistory) {
                    const timestamp = new Date(point.timestamp).getTime();

                    // Calculate P&L at this point: (price - avgBuyPrice) * tokenAmount
                    const pnlAtPoint = (point.price - holding.avg_buy_price) * holding.token_amount;

                    if (!pnlByTime.has(timestamp)) {
                        pnlByTime.set(timestamp, new Map());
                    }
                    pnlByTime.get(timestamp)!.set(holding.creator_id, pnlAtPoint);
                }
            }

            // Convert to array and sort by time
            const sortedTimestamps = Array.from(pnlByTime.keys()).sort((a, b) => a - b);

            // For each timestamp, calculate total P&L across all holdings
            // We need to carry forward the last known P&L for each holding if it's missing at a timestamp
            const lastKnownPnL = new Map<string, number>();
            holdings.forEach(h => lastKnownPnL.set(h.creator_id, 0));

            const result: PortfolioPnLPoint[] = sortedTimestamps.map(timestamp => {
                const pnlMap = pnlByTime.get(timestamp)!;

                // Update last known P&L for holdings that have data at this timestamp
                pnlMap.forEach((pnl, creatorId) => {
                    lastKnownPnL.set(creatorId, pnl);
                });

                // Sum all known P&Ls
                let totalPnL = 0;
                lastKnownPnL.forEach(pnl => {
                    totalPnL += pnl;
                });

                return {
                    time: timestamp,
                    pnl: totalPnL,
                };
            });

            setPnlHistory(result);
        } catch (err) {
            console.error('Failed to fetch portfolio P&L history:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch P&L history');
        } finally {
            setIsLoading(false);
        }
    }, [holdings]);

    useEffect(() => {
        fetchPnLHistory('7d');
    }, [fetchPnLHistory]);

    return {
        pnlHistory,
        isLoading,
        error,
        refresh: fetchPnLHistory,
    };
}
