import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        return headers;
    }

    async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const authHeaders = await this.getAuthHeaders();

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: { ...authHeaders, ...headers },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.detail || errorData.error?.message || 'Request failed',
                errorData.error?.code
            );
        }

        return response.json();
    }

    // ============ Auth & Users ============

    async authCallback(accessToken: string, deviceFingerprint?: string) {
        return this.request('/api/v1/auth/callback', {
            method: 'POST',
            body: { access_token: accessToken, provider: 'google', device_fingerprint: deviceFingerprint }
        });
    }

    async getCurrentUser() {
        return this.request<UserProfile>('/api/v1/users/me');
    }

    async claimFaucet(deviceFingerprint: string) {
        return this.request<FaucetResponse>('/api/v1/users/faucet', {
            method: 'POST',
            body: { device_fingerprint: deviceFingerprint }
        });
    }

    // ============ Creators ============

    async getCreators(params: CreatorListParams = {}) {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.offset) searchParams.set('offset', params.offset.toString());
        if (params.sortBy) searchParams.set('sort_by', params.sortBy);
        if (params.order) searchParams.set('order', params.order);
        if (params.search) searchParams.set('search', params.search);

        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return this.request<CreatorListResponse>(`/api/v1/creators${query}`);
    }

    async getCreator(creatorId: string) {
        return this.request<Creator>(`/api/v1/creators/${creatorId}`);
    }

    async getCreatorPriceHistory(creatorId: string, period: string = '24h') {
        return this.request<PriceHistoryResponse>(
            `/api/v1/creators/${creatorId}/price-history?period=${period}`
        );
    }

    // ============ YouTube Integration ============

    async searchYouTubeChannels(query: string) {
        return this.request<YouTubeSearchResult[]>(`/api/v1/creators/youtube/search?q=${encodeURIComponent(query)}`);
    }

    async addCreatorFromYouTube(channelId: string) {
        return this.request<AddCreatorResponse>('/api/v1/creators/youtube/add', {
            method: 'POST',
            body: { channel_id: channelId }
        });
    }

    async refreshCreatorStats(creatorId: string) {
        return this.request<RefreshStatsResponse>(`/api/v1/creators/${creatorId}/refresh-stats`, {
            method: 'POST'
        });
    }

    // ============ Trading ============

    async getTradeQuote(request: TradeQuoteRequest) {
        return this.request<TradeQuoteResponse>('/api/v1/trade/quote', {
            method: 'POST',
            body: request
        });
    }

    async executeTrade(request: TradeExecuteRequest) {
        return this.request<TradeExecuteResponse>('/api/v1/trade/execute', {
            method: 'POST',
            body: request
        });
    }

    async getTradeHistory(params: { limit?: number; offset?: number; creatorId?: string } = {}) {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.offset) searchParams.set('offset', params.offset.toString());
        if (params.creatorId) searchParams.set('creator_id', params.creatorId);

        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return this.request<TransactionHistoryResponse>(`/api/v1/trade/history${query}`);
    }

    // ============ Portfolio ============

    async getPortfolio() {
        return this.request<PortfolioResponse>('/api/v1/portfolio');
    }

    // ============ Leaderboard ============

    async getLeaderboard(params: { limit?: number; offset?: number } = {}) {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.offset) searchParams.set('offset', params.offset.toString());

        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        return this.request<LeaderboardResponse>(`/api/v1/leaderboard${query}`);
    }
}

// Custom error class
export class ApiError extends Error {
    status: number;
    code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiError';
    }
}

// Types
export interface UserProfile {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string;
    nmbr_balance: number;
    portfolio_value: number;
    total_invested: number;
    roi_pct: number;
    rank: number | null;
    faucet_claimed: boolean;
    is_admin: boolean;  // Admin access flag
    holdings: Holding[];
}

export interface Holding {
    creator_id: string;
    creator_name: string;
    avatar_url: string;
    token_symbol: string;
    token_amount: number;
    avg_buy_price: number;
    current_price: number;
    current_value: number;
    cost_basis: number;
    pnl: number;
    pnl_pct: number;
    allocation_pct?: number;
}

export interface Creator {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    banner_url: string;
    subscriber_count: number;
    view_count_30d: number;
    view_count_lifetime: number;
    video_count: number;
    cpi_score: number;
    token_symbol: string;
    is_verified: boolean;
    pool: Pool | null;
}

export interface CreatorListItem {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    subscriber_count: number;
    token_symbol: string;
    current_price: number;
    price_change_24h: number;
    market_cap: number;
    volume_24h: number;
}

export interface Pool {
    id: string;
    current_price: number;
    price_change_24h: number;
    volume_24h: number;
    market_cap: number;
    holder_count: number;
    token_supply: number;
    nmbr_reserve: number;
}

export interface CreatorListParams {
    limit?: number;
    offset?: number;
    sortBy?: 'price_change_24h' | 'volume_24h' | 'market_cap' | 'cpi_score';
    order?: 'asc' | 'desc';
    search?: string;
}

export interface CreatorListResponse {
    creators: CreatorListItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface TradeQuoteRequest {
    creator_id: string;
    type: 'buy' | 'sell';
    amount: number;
    amount_type: 'nmbr' | 'token';
}

export interface TradeQuoteResponse {
    type: string;
    input_amount: number;
    input_currency: string;
    output_amount: number;
    output_currency: string;
    price_per_token: number;
    price_impact_pct: number;
    fee_amount: number;
    fee_pct: number;
    expires_at: string;
}

export interface TradeExecuteRequest {
    creator_id: string;
    type: 'buy' | 'sell';
    amount: number;
    amount_type: 'nmbr' | 'token';
    max_slippage_pct?: number;
}

export interface TradeExecuteResponse {
    success: boolean;
    transaction: Transaction;
    new_balance: number;
    new_holding: Holding | null;
}

export interface Transaction {
    id: string;
    type: 'buy' | 'sell';
    creator_id?: string;
    token_amount: number;
    nmbr_amount: number;
    price_per_token: number;
    fee_amount: number;
    slippage_pct: number;
    created_at: string;
    creator_name?: string;
    token_symbol?: string;
}

export interface TransactionHistoryResponse {
    transactions: Transaction[];
    total: number;
}

export interface PricePoint {
    timestamp: string;
    price: number;
    volume: number;
}

export interface PriceHistoryResponse {
    prices: PricePoint[];
}

export interface PortfolioResponse {
    total_value: number;
    total_invested: number;
    total_pnl: number;
    roi_pct: number;
    nmbr_balance: number;
    holdings: Holding[];
}

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    display_name: string;
    avatar_url: string;
    roi_pct: number;
    portfolio_value: number;
    total_invested: number;
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
    my_rank: number | null;
    total_users: number;
}

export interface FaucetResponse {
    success: boolean;
    amount_claimed: number;
    new_balance: number;
}

export interface YouTubeSearchResult {
    channel_id: string;
    username: string;
    display_name: string;
    description: string;
    avatar_url: string;
}

export interface AddCreatorResponse {
    success: boolean;
    creator_id: string;
    message: string;
}

export interface RefreshStatsResponse {
    success: boolean;
    subscriber_count: number;
    view_count_30d: number;
    cpi_score: number;
}

// Singleton instance
export const api = new ApiClient(API_URL);
