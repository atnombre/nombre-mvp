import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type RealtimeCallback = (payload: RealtimePostgresChangesPayload<any>) => void;

interface SubscriptionConfig {
    table: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    schema?: string;
}

/**
 * Hook for subscribing to real-time updates from Supabase
 */
export function useRealtimeSubscription(
    config: SubscriptionConfig,
    callback: RealtimeCallback,
    enabled: boolean = true
) {
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const { table, event = '*', filter, schema = 'public' } = config;
        
        const channelName = `realtime:${table}:${filter || 'all'}`;
        
        // Build filter config
        const filterConfig: any = {
            event,
            schema,
            table,
        };
        
        if (filter) {
            filterConfig.filter = filter;
        }
        
        // Create subscription
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes' as any,
                filterConfig,
                (payload: RealtimePostgresChangesPayload<any>) => {
                    console.log('Real-time update:', table, payload);
                    callback(payload);
                }
            )
            .subscribe((status) => {
                console.log(`Subscription to ${table}:`, status);
            });

        channelRef.current = channel;

        // Cleanup on unmount or config change
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [config.table, config.event, config.filter, enabled, callback]);

    return channelRef.current;
}

/**
 * Hook for subscribing to pool price updates for a specific creator
 */
export function usePoolPriceSubscription(
    poolId: string | undefined,
    onPriceUpdate: (newPrice: number, priceChange24h: number) => void
) {
    const handleUpdate = useCallback((payload: any) => {
        if (payload.new) {
            const { current_price, price_change_24h } = payload.new;
            onPriceUpdate(current_price, price_change_24h);
        }
    }, [onPriceUpdate]);

    useRealtimeSubscription(
        {
            table: 'pools',
            event: 'UPDATE',
            filter: poolId ? `id=eq.${poolId}` : undefined,
        },
        handleUpdate,
        !!poolId
    );
}

/**
 * Hook for subscribing to all pool updates (for lists)
 */
export function useAllPoolsSubscription(
    onPoolUpdate: (poolId: string, updates: Partial<PoolUpdate>) => void
) {
    const handleUpdate = useCallback((payload: any) => {
        if (payload.new) {
            const { id, current_price, price_change_24h, volume_24h, market_cap, holder_count } = payload.new;
            onPoolUpdate(id, {
                current_price,
                price_change_24h,
                volume_24h,
                market_cap,
                holder_count,
            });
        }
    }, [onPoolUpdate]);

    useRealtimeSubscription(
        {
            table: 'pools',
            event: 'UPDATE',
        },
        handleUpdate,
        true
    );
}

/**
 * Hook for subscribing to trade events (for activity feeds)
 */
export function useTradeSubscription(
    creatorId: string | undefined,
    onNewTrade: (trade: any) => void
) {
    const handleInsert = useCallback((payload: any) => {
        if (payload.new) {
            onNewTrade(payload.new);
        }
    }, [onNewTrade]);

    useRealtimeSubscription(
        {
            table: 'transactions',
            event: 'INSERT',
            filter: creatorId ? `creator_id=eq.${creatorId}` : undefined,
        },
        handleInsert,
        true
    );
}

interface PoolUpdate {
    current_price: number;
    price_change_24h: number;
    volume_24h: number;
    market_cap: number;
    holder_count: number;
}
