import { useState, useEffect, useCallback, useRef } from 'react';
import { api, LeaderboardEntry } from '../services/api';


interface UseLeaderboardReturn {
    leaderboard: LeaderboardEntry[];
    myRank: number | null;
    totalUsers: number;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
}

export function useLeaderboard(limit: number = 100): UseLeaderboardReturn {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [myRank, setMyRank] = useState<number | null>(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const hasFetched = useRef(false);

    const fetchLeaderboard = useCallback(async (append: boolean = false, showLoading = false) => {
        try {
            // Only show loading on initial fetch
            if (!hasFetched.current || showLoading) {
                setIsLoading(true);
            }
            setError(null);
            console.log('Fetching leaderboard...');
            const data = await api.getLeaderboard({ limit, offset: append ? offset : 0 });
            console.log('Leaderboard fetched:', data.leaderboard?.length || 0);

            if (append) {
                setLeaderboard(prev => [...prev, ...data.leaderboard]);
            } else {
                setLeaderboard(data.leaderboard);
            }
            setMyRank(data.my_rank);
            setTotalUsers(data.total_users);
            hasFetched.current = true;
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
        } finally {
            setIsLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchLeaderboard(false);
    }, []);

    const refresh = useCallback(async () => {
        setOffset(0);
        await fetchLeaderboard(false);
    }, [fetchLeaderboard]);

    const loadMore = useCallback(async () => {
        const newOffset = offset + limit;
        setOffset(newOffset);
        await fetchLeaderboard(true);
    }, [offset, limit, fetchLeaderboard]);

    return {
        leaderboard,
        myRank,
        totalUsers,
        isLoading,
        error,
        refresh,
        loadMore,
    };
}
