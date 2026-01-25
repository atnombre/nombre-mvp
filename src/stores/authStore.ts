import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api, UserProfile } from '../services/api';

interface AuthState {
    user: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setUser: (user: UserProfile) => void;
    updateBalance: (newBalance: number) => void;
    updateHolding: (creatorId: string, holding: { token_amount: number; avg_buy_price: number; current_price: number; creator_name?: string; token_symbol?: string; avatar_url?: string } | null) => void;
    clearAuth: () => void;
}

// Track initialization to prevent duplicate calls
let isInitializing = false;
let isInitialized = false;

// Simple auth store - no persistence to avoid stale state issues
export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true, // Start true to show loading until initialized
    isAuthenticated: false,
    error: null,

    initialize: async () => {
        // Prevent multiple simultaneous initializations
        if (isInitializing || isInitialized) {
            return;
        }
        isInitializing = true;

        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error || !session) {
                set({ user: null, isAuthenticated: false, isLoading: false });
                return;
            }

            // Session exists - try to get user from backend
            try {
                const user = await api.getCurrentUser();
                set({ user, isAuthenticated: true, isLoading: false });
            } catch {
                // Backend failed, use Supabase user data as fallback
                const u = session.user;
                set({
                    user: {
                        id: u.id,
                        email: u.email || '',
                        display_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
                        avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture || '',
                        nmbr_balance: 10000,
                        portfolio_value: 0,
                        total_invested: 0,
                        roi_pct: 0,
                        rank: null,
                        faucet_claimed: false,
                        is_admin: false,  // Never trust client-side for admin
                        holdings: [],
                    } as UserProfile,
                    isAuthenticated: true,
                    isLoading: false
                });
            }
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
        } finally {
            isInitializing = false;
            isInitialized = true;
        }
    },

    signIn: async () => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
            // Redirect happens automatically, keep loading true
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Sign in failed',
                isLoading: false
            });
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    },

    refreshUser: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        
        try {
            const user = await api.getCurrentUser();
            set({ user });
        } catch (err) {
            console.error('Refresh user failed:', err);
        }
    },

    setUser: (user: UserProfile) => {
        set({ user, isAuthenticated: true, isLoading: false });
    },

    updateBalance: (newBalance: number) => {
        const { user } = get();
        if (user) {
            set({ user: { ...user, nmbr_balance: newBalance } });
        }
    },

    updateHolding: (creatorId: string, holding: { token_amount: number; avg_buy_price: number; current_price: number; creator_name?: string; token_symbol?: string; avatar_url?: string } | null) => {
        const { user } = get();
        if (!user) return;
        
        let newHoldings = [...(user.holdings || [])];
        const existingIndex = newHoldings.findIndex(h => h.creator_id === creatorId);
        
        if (holding === null || holding.token_amount <= 0) {
            // Remove holding if sold all
            if (existingIndex !== -1) {
                newHoldings.splice(existingIndex, 1);
            }
        } else if (existingIndex !== -1) {
            // Update existing holding - recalculate PnL
            const currentValue = holding.token_amount * holding.current_price;
            const costBasis = holding.token_amount * holding.avg_buy_price;
            const pnl = currentValue - costBasis;
            const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
            
            newHoldings[existingIndex] = {
                ...newHoldings[existingIndex],
                token_amount: holding.token_amount,
                avg_buy_price: holding.avg_buy_price,
                current_price: holding.current_price,
                current_value: currentValue,
                cost_basis: costBasis,
                pnl: pnl,
                pnl_pct: pnlPct,
            };
        } else {
            // New holding - calculate PnL properly
            const currentValue = holding.token_amount * holding.current_price;
            const costBasis = holding.token_amount * holding.avg_buy_price;
            const pnl = currentValue - costBasis;
            const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
            
            newHoldings.push({
                creator_id: creatorId,
                creator_name: holding.creator_name || '',
                avatar_url: holding.avatar_url || '',
                token_symbol: holding.token_symbol || '',
                token_amount: holding.token_amount,
                avg_buy_price: holding.avg_buy_price,
                current_price: holding.current_price,
                current_value: currentValue,
                cost_basis: costBasis,
                pnl: pnl,
                pnl_pct: pnlPct,
            });
        }
        
        set({ user: { ...user, holdings: newHoldings } });
    },

    clearAuth: () => {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    },
}));

// Set up auth state listener once
supabase.auth.onAuthStateChange((event) => {
    const store = useAuthStore.getState();
    
    if (event === 'SIGNED_OUT') {
        store.clearAuth();
    } else if (event === 'TOKEN_REFRESHED') {
        // Session refreshed, re-fetch user data
        store.refreshUser();
    }
});
