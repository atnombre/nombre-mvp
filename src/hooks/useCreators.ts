import { useState, useEffect, useCallback, useRef } from 'react';
import { api, CreatorListItem, CreatorListParams, Creator, PriceHistoryResponse } from '../services/api';

interface UseCreatorsReturn {
    creators: CreatorListItem[];
    total: number;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    setParams: (params: Partial<CreatorListParams>) => void;
}

export function useCreators(initialParams: CreatorListParams = {}): UseCreatorsReturn {
    const [creators, setCreators] = useState<CreatorListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [params, setParams] = useState<CreatorListParams>({
        limit: 20,
        offset: 0,
        sortBy: 'volume_24h',
        order: 'desc',
        ...initialParams,
    });
    const hasFetched = useRef(false);

    const fetchCreators = useCallback(async (append: boolean = false, showLoading = false) => {
        try {
            // Only show loading on initial fetch or explicit refresh
            if (!hasFetched.current || showLoading) {
                setIsLoading(true);
            }
            setError(null);
            console.log('Fetching creators with params:', params);
            const data = await api.getCreators(params);
            console.log('Creators fetched:', data.creators?.length || 0);

            if (append) {
                setCreators(prev => [...prev, ...data.creators]);
            } else {
                setCreators(data.creators);
            }
            setTotal(data.total);
            hasFetched.current = true;
        } catch (err) {
            console.error('Failed to fetch creators:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch creators');
        } finally {
            setIsLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchCreators(false);
    }, [params.sortBy, params.order, params.search]);

    const refresh = useCallback(async () => {
        setParams(prev => ({ ...prev, offset: 0 }));
        await fetchCreators(false);
    }, [fetchCreators]);

    const loadMore = useCallback(async () => {
        const newOffset = (params.offset || 0) + (params.limit || 20);
        setParams(prev => ({ ...prev, offset: newOffset }));
        await fetchCreators(true);
    }, [params, fetchCreators]);

    const updateParams = useCallback((newParams: Partial<CreatorListParams>) => {
        setParams(prev => ({ ...prev, ...newParams, offset: 0 }));
    }, []);

    return {
        creators,
        total,
        isLoading,
        error,
        refresh,
        loadMore,
        setParams: updateParams,
    };
}

// Hook for single creator
interface UseCreatorReturn {
    creator: Creator | null;
    priceHistory: PriceHistoryResponse | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    fetchPriceHistory: (period: string) => Promise<void>;
}

export function useCreator(creatorId: string | undefined): UseCreatorReturn {
    const [creator, setCreator] = useState<Creator | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistoryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCreator = useCallback(async () => {
        if (!creatorId) return;

        try {
            setIsLoading(true);
            setError(null);
            const data = await api.getCreator(creatorId);
            setCreator(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch creator');
        } finally {
            setIsLoading(false);
        }
    }, [creatorId]);

    const fetchPriceHistory = useCallback(async (period: string = '24h') => {
        if (!creatorId) return;

        try {
            const data = await api.getCreatorPriceHistory(creatorId, period);
            setPriceHistory(data);
        } catch (err) {
            console.error('Failed to fetch price history:', err);
        }
    }, [creatorId]);

    useEffect(() => {
        fetchCreator();
        fetchPriceHistory('24h');
    }, [fetchCreator, fetchPriceHistory]);

    return {
        creator,
        priceHistory,
        isLoading,
        error,
        refresh: fetchCreator,
        fetchPriceHistory,
    };
}
