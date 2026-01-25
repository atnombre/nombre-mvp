import { useState, useCallback } from 'react';
import { api, TradeQuoteRequest, TradeQuoteResponse, TradeExecuteRequest, TradeExecuteResponse } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface UseTradeReturn {
    quote: TradeQuoteResponse | null;
    isLoadingQuote: boolean;
    isExecuting: boolean;
    error: string | null;
    getQuote: (request: TradeQuoteRequest) => Promise<void>;
    executeTrade: (request: TradeExecuteRequest) => Promise<TradeExecuteResponse | null>;
    clearQuote: () => void;
    clearError: () => void;
}

export function useTrade(): UseTradeReturn {
    const [quote, setQuote] = useState<TradeQuoteResponse | null>(null);
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { refreshUser, updateBalance, updateHolding } = useAuthStore();

    const getQuote = useCallback(async (request: TradeQuoteRequest) => {
        try {
            setIsLoadingQuote(true);
            setError(null);
            const data = await api.getTradeQuote(request);
            setQuote(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get quote');
            setQuote(null);
        } finally {
            setIsLoadingQuote(false);
        }
    }, []);

    const executeTrade = useCallback(async (request: TradeExecuteRequest): Promise<TradeExecuteResponse | null> => {
        try {
            setIsExecuting(true);
            setError(null);
            const result = await api.executeTrade(request);

            // Immediately update the balance from trade response (no network delay)
            if (result.new_balance !== undefined) {
                updateBalance(result.new_balance);
            }

            // Immediately update the holding from trade response
            if (result.new_holding) {
                updateHolding(request.creator_id, {
                    token_amount: result.new_holding.token_amount,
                    avg_buy_price: result.new_holding.avg_buy_price,
                    current_price: result.new_holding.current_price,
                    creator_name: result.new_holding.creator_name,
                    token_symbol: result.new_holding.token_symbol,
                    avatar_url: result.new_holding.avatar_url || '',
                });
            } else if (request.type === 'sell') {
                // Sold all tokens - remove holding
                updateHolding(request.creator_id, null);
            }

            // Also do a full refresh to ensure all data is in sync (portfolio value, etc.)
            // This happens in background, UI already updated above
            refreshUser();

            // Clear quote after successful trade
            setQuote(null);

            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Trade failed';
            setError(message);
            return null;
        } finally {
            setIsExecuting(false);
        }
    }, [refreshUser, updateBalance, updateHolding]);

    const clearQuote = useCallback(() => setQuote(null), []);
    const clearError = useCallback(() => setError(null), []);

    return {
        quote,
        isLoadingQuote,
        isExecuting,
        error,
        getQuote,
        executeTrade,
        clearQuote,
        clearError,
    };
}
