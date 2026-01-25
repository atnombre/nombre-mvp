-- Nombre MVP Database Schema
-- Run this migration in Supabase SQL Editor

-- ============ Enable Required Extensions ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ Users Table ============
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID NOT NULL UNIQUE,  -- Supabase Auth user ID
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    wallet_address TEXT UNIQUE,  -- For Phase 2 blockchain
    nmbr_balance DECIMAL(20,8) DEFAULT 0,
    total_invested DECIMAL(20,8) DEFAULT 0,
    portfolio_value DECIMAL(20,8) DEFAULT 0,
    faucet_claimed BOOLEAN DEFAULT FALSE,
    device_fingerprint TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============ Creators Table ============
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    youtube_channel_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,  -- @handle
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    subscriber_count BIGINT DEFAULT 0,
    view_count_lifetime BIGINT DEFAULT 0,
    view_count_30d BIGINT DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    cpi_score DECIMAL(10,2) DEFAULT 0,
    token_symbol TEXT NOT NULL UNIQUE,
    token_address TEXT UNIQUE,  -- For Phase 2
    is_verified BOOLEAN DEFAULT FALSE,
    last_stats_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creators_youtube_id ON creators(youtube_channel_id);
CREATE INDEX IF NOT EXISTS idx_creators_token_symbol ON creators(token_symbol);

-- ============ Pools Table ============
CREATE TABLE IF NOT EXISTS pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL UNIQUE REFERENCES creators(id) ON DELETE CASCADE,
    token_supply DECIMAL(20,8) DEFAULT 9000000,  -- 90% of 10M tokens
    nmbr_reserve DECIMAL(20,8) NOT NULL,
    initial_price DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8) NOT NULL,
    price_24h_ago DECIMAL(20,8),
    price_change_24h DECIMAL(10,4) DEFAULT 0,
    volume_24h DECIMAL(20,8) DEFAULT 0,
    volume_all_time DECIMAL(20,8) DEFAULT 0,
    market_cap DECIMAL(20,8),
    holder_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pools_creator_id ON pools(creator_id);
CREATE INDEX IF NOT EXISTS idx_pools_volume ON pools(volume_24h DESC);

-- ============ User Holdings Table ============
CREATE TABLE IF NOT EXISTS user_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    token_amount DECIMAL(20,8) NOT NULL DEFAULT 0,
    avg_buy_price DECIMAL(20,8),
    total_cost_basis DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_holdings_user ON user_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_creator ON user_holdings(creator_id);

-- ============ Transactions Table ============
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
    token_amount DECIMAL(20,8) NOT NULL,
    nmbr_amount DECIMAL(20,8) NOT NULL,
    price_per_token DECIMAL(20,8) NOT NULL,
    fee_amount DECIMAL(20,8) DEFAULT 0,
    slippage_pct DECIMAL(6,4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_pool ON transactions(pool_id);
CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at DESC);

-- ============ Price History Table ============
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
    price DECIMAL(20,8) NOT NULL,
    volume DECIMAL(20,8) DEFAULT 0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history ON price_history(pool_id, timestamp);

-- ============ Updated At Trigger ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creators_updated_at
    BEFORE UPDATE ON creators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pools_updated_at
    BEFORE UPDATE ON pools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
    BEFORE UPDATE ON user_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============ Row Level Security ============

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Users: Can view/update own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = auth_id);

-- Service role can do everything
CREATE POLICY "Service role has full access to users"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

-- Creators: Public read access
CREATE POLICY "Creators are publicly readable"
    ON creators FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role has full access to creators"
    ON creators FOR ALL
    USING (auth.role() = 'service_role');

-- Pools: Public read access
CREATE POLICY "Pools are publicly readable"
    ON pools FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role has full access to pools"
    ON pools FOR ALL
    USING (auth.role() = 'service_role');

-- Holdings: Users can view own holdings
CREATE POLICY "Users can view own holdings"
    ON user_holdings FOR SELECT
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Service role has full access to holdings"
    ON user_holdings FOR ALL
    USING (auth.role() = 'service_role');

-- Transactions: Users can view own transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Service role has full access to transactions"
    ON transactions FOR ALL
    USING (auth.role() = 'service_role');

-- Price History: Public read access
CREATE POLICY "Price history is publicly readable"
    ON price_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role has full access to price_history"
    ON price_history FOR ALL
    USING (auth.role() = 'service_role');

-- ============ Helper Functions ============

-- Get user's rank on leaderboard
CREATE OR REPLACE FUNCTION get_user_rank(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    WITH ranked_users AS (
        SELECT 
            id,
            RANK() OVER (
                ORDER BY 
                    CASE 
                        WHEN total_invested > 0 
                        THEN ((portfolio_value - total_invested) / total_invested) * 100
                        ELSE 0
                    END DESC
            ) as rank
        FROM users
        WHERE total_invested > 0
    )
    SELECT rank INTO user_rank
    FROM ranked_users
    WHERE id = target_user_id;
    
    RETURN user_rank;
END;
$$ LANGUAGE plpgsql;
