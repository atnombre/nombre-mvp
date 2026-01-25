import { useState, useEffect, useCallback, useRef } from 'react';
import { api, PortfolioResponse } from '../services/api';

import { useAuthStore } from '../stores/authStore';

interface UsePortfolioReturn {
    portfolio: PortfolioResponse | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
    const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuthStore();
    const hasFetched = useRef(false);

    const fetchPortfolio = useCallback(async (showLoading = false) => {
        if (!isAuthenticated) {
            console.log('Portfolio: Not authenticated, skipping fetch');
            setPortfolio(null);
            setIsLoading(false);
            return;
        }

        try {
            // Only show loading on initial fetch or explicit refresh
            if (!hasFetched.current || showLoading) {
                setIsLoading(true);
            }
            setError(null);
            console.log('Fetching portfolio...');
            const data = await api.getPortfolio();
            console.log('Portfolio fetched:', data);
            setPortfolio(data);
            hasFetched.current = true;
        } catch (err) {
            console.error('Failed to fetch portfolio:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    return {
        portfolio,
        isLoading,
        error,
        refresh: () => fetchPortfolio(true),
    };
}
