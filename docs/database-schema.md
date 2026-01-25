# Database Schema

This document defines all database tables, relationships, and key constraints for the Nombre platform.

**Database**: PostgreSQL (via Supabase)

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  creators   │       │   pools     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │◄──────│ creator_id  │
│ auth_id     │       │ youtube_id  │       │ token_supply│
│ email       │       │ username    │       │ nmbr_reserve│
│ balance     │       │ subscribers │       │ price       │
│ created_at  │       │ cpi_score   │       │ volume_24h  │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │                     │
       │                     │                     │
       │    ┌────────────────┴─────────────────┐   │
       │    │                                  │   │
       ▼    ▼                                  ▼   │
┌─────────────────┐                   ┌─────────────────┐
│  user_holdings  │                   │  transactions   │
├─────────────────┤                   ├─────────────────┤
│ id (PK)         │                   │ id (PK)         │
│ user_id (FK)    │                   │ user_id (FK)    │
│ creator_id (FK) │                   │ pool_id (FK)    │◄─┘
│ token_amount    │                   │ type            │
│ avg_buy_price   │                   │ token_amount    │
└─────────────────┘                   │ nmbr_amount     │
                                      │ price           │
                                      └─────────────────┘
                                               │
                                               │
                                      ┌─────────────────┐
                                      │  price_history  │
                                      ├─────────────────┤
                                      │ id (PK)         │
                                      │ pool_id (FK)    │
                                      │ price           │
                                      │ volume          │
                                      │ timestamp       │
                                      └─────────────────┘
```

---

## Tables

### users

Represents each app user account.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Unique user ID |
| `auth_id` | `uuid` | NOT NULL, UNIQUE, FK → auth.users | Supabase Auth ID |
| `email` | `text` | NOT NULL | Google email address |
| `display_name` | `text` | | User's display name |
| `avatar_url` | `text` | | Google profile picture URL |
| `wallet_address` | `text` | UNIQUE | Ethereum wallet (Phase 2) |
| `nmbr_balance` | `decimal(20,8)` | DEFAULT 0 | $NMBR token balance |
| `total_invested` | `decimal(20,8)` | DEFAULT 0 | Total $NMBR spent on buys |
| `portfolio_value` | `decimal(20,8)` | DEFAULT 0 | Current value of all holdings |
| `faucet_claimed` | `boolean` | DEFAULT false | Has claimed initial tokens |
| `device_fingerprint` | `text` | UNIQUE | Anti-cheat device ID |
| `created_at` | `timestamptz` | DEFAULT now() | Account creation time |
| `updated_at` | `timestamptz` | DEFAULT now() | Last update time |

**Indexes:**
- `auth_id` (unique) - Fast auth lookup
- `wallet_address` (unique) - Future wallet integration
- `email` - Search by email

**Notes:**
- `total_invested` tracks cumulative $NMBR spent (decremented on sell)
- `portfolio_value` is recalculated after each trade
- ROI = `(portfolio_value - total_invested) / total_invested × 100`

---

### creators

Represents each tradable creator (YouTube channel).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Unique creator ID |
| `youtube_channel_id` | `text` | NOT NULL, UNIQUE | YouTube channel ID |
| `username` | `text` | NOT NULL | YouTube handle (e.g., @pewdiepie) |
| `display_name` | `text` | NOT NULL | Channel display name |
| `avatar_url` | `text` | | Channel profile picture |
| `banner_url` | `text` | | Channel banner image |
| `subscriber_count` | `bigint` | DEFAULT 0 | Current subscriber count |
| `view_count_lifetime` | `bigint` | DEFAULT 0 | Total lifetime views |
| `view_count_30d` | `bigint` | DEFAULT 0 | Views in last 30 days |
| `video_count` | `integer` | DEFAULT 0 | Total video count |
| `cpi_score` | `decimal(10,2)` | DEFAULT 0 | Creator Performance Index (0-1000) |
| `token_symbol` | `text` | NOT NULL, UNIQUE | Token symbol (e.g., PEWDS) |
| `token_address` | `text` | UNIQUE | ERC-20 contract address (Phase 2) |
| `is_verified` | `boolean` | DEFAULT false | Creator-verified account |
| `last_stats_update` | `timestamptz` | | Last YouTube data refresh |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

**Indexes:**
- `youtube_channel_id` (unique) - Prevent duplicates
- `token_symbol` (unique) - Fast symbol lookup

**Notes:**
- `view_count_30d` is estimated from recent video stats
- `cpi_score` is calculated from subscriber and view metrics
- `token_symbol` is auto-generated from channel name

---

### pools

Represents each creator's liquidity pool (AMM).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Unique pool ID |
| `creator_id` | `uuid` | NOT NULL, FK → creators.id, UNIQUE | One pool per creator |
| `token_supply` | `decimal(20,8)` | DEFAULT 9000000 | Tokens in pool (90% of 10M) |
| `nmbr_reserve` | `decimal(20,8)` | NOT NULL | $NMBR backing the pool |
| `initial_price` | `decimal(20,8)` | NOT NULL | Launch price (from CPI) |
| `current_price` | `decimal(20,8)` | NOT NULL | Current price per token |
| `price_24h_ago` | `decimal(20,8)` | | Price 24 hours ago |
| `price_change_24h` | `decimal(10,4)` | | Percentage change (24h) |
| `volume_24h` | `decimal(20,8)` | DEFAULT 0 | Trading volume (rolling 24h) |
| `volume_all_time` | `decimal(20,8)` | DEFAULT 0 | Total trading volume |
| `market_cap` | `decimal(20,8)` | | current_price × 10,000,000 |
| `holder_count` | `integer` | DEFAULT 0 | Unique token holders |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

**Indexes:**
- `creator_id` (unique) - One pool per creator
- `volume_24h` - Sort by activity
- `price_change_24h` - Sort by gainers/losers
- `market_cap` - Sort by size

**Notes:**
- `token_supply` decreases when users buy, increases when they sell
- `nmbr_reserve` is the $NMBR locked in the pool
- AMM constant: `k = token_supply × nmbr_reserve`
- `market_cap` uses total supply (10M), not circulating supply

---

### user_holdings

Tracks each user's token holdings per creator.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → users.id | Holder |
| `creator_id` | `uuid` | NOT NULL, FK → creators.id | Creator whose tokens held |
| `token_amount` | `decimal(20,8)` | NOT NULL, DEFAULT 0 | Tokens owned |
| `avg_buy_price` | `decimal(20,8)` | | Weighted average purchase price |
| `total_cost_basis` | `decimal(20,8)` | DEFAULT 0 | Total $NMBR spent |
| `created_at` | `timestamptz` | DEFAULT now() | First purchase time |
| `updated_at` | `timestamptz` | DEFAULT now() | |

**Constraints:**
- UNIQUE (`user_id`, `creator_id`) - One row per user-creator pair

**Notes:**
- `avg_buy_price` is recalculated on each buy using weighted average
- `total_cost_basis` tracks cost for P&L calculation
- Holdings with `token_amount = 0` may be deleted or kept for history

---

### transactions

Records all buy/sell transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Transaction ID |
| `user_id` | `uuid` | NOT NULL, FK → users.id | Trader |
| `pool_id` | `uuid` | NOT NULL, FK → pools.id | Pool traded |
| `type` | `text` | NOT NULL, CHECK (type IN ('buy', 'sell')) | Trade direction |
| `token_amount` | `decimal(20,8)` | NOT NULL | Tokens exchanged |
| `nmbr_amount` | `decimal(20,8)` | NOT NULL | $NMBR exchanged |
| `price_per_token` | `decimal(20,8)` | NOT NULL | Execution price |
| `fee_amount` | `decimal(20,8)` | DEFAULT 0 | Protocol fee paid |
| `slippage_pct` | `decimal(6,4)` | | Actual slippage |
| `created_at` | `timestamptz` | DEFAULT now() | Transaction time |

**Indexes:**
- `user_id` - User's transaction history
- `pool_id` - Pool's transaction history
- `created_at` - Chronological sorting

**Notes:**
- For `buy`: `nmbr_amount` is spent, `token_amount` is received
- For `sell`: `token_amount` is spent, `nmbr_amount` is received
- `fee_amount` is already deducted from output

---

### price_history

Historical price data for charts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `pool_id` | `uuid` | NOT NULL, FK → pools.id | Pool reference |
| `price` | `decimal(20,8)` | NOT NULL | Price at timestamp |
| `volume` | `decimal(20,8)` | DEFAULT 0 | Volume in this period |
| `timestamp` | `timestamptz` | NOT NULL | Data point time |

**Indexes:**
- (`pool_id`, `timestamp`) - Time series queries

**Notes:**
- New record created after each trade
- Daily maintenance script can aggregate for older data
- Used by PriceChart component

---

## Views

### leaderboard (Computed View)

ROI-based ranking of all users.

```sql
CREATE VIEW leaderboard AS
SELECT 
  u.id,
  u.display_name,
  u.avatar_url,
  u.total_invested,
  u.portfolio_value,
  CASE 
    WHEN u.total_invested > 0 
    THEN ((u.portfolio_value - u.total_invested) / u.total_invested) * 100
    ELSE 0
  END as roi_pct,
  RANK() OVER (
    ORDER BY 
      CASE 
        WHEN u.total_invested > 0 
        THEN ((u.portfolio_value - u.total_invested) / u.total_invested) * 100
        ELSE 0
      END DESC
  ) as rank
FROM users u
WHERE u.total_invested > 0
ORDER BY roi_pct DESC;
```

**Notes:**
- Only includes users who have invested (total_invested > 0)
- Ranking by ROI ensures fair competition (skill over timing)

---

## Row Level Security (RLS)

All tables have RLS enabled for security.

### users

```sql
-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);
```

### creators

```sql
-- Creators are publicly viewable
CREATE POLICY "Creators are viewable by everyone"
  ON creators FOR SELECT
  TO authenticated
  USING (true);
```

### pools

```sql
-- Pools are publicly viewable
CREATE POLICY "Pools are viewable by everyone"
  ON pools FOR SELECT
  TO authenticated
  USING (true);
```

### user_holdings

```sql
-- Users can only see their own holdings
CREATE POLICY "Users can view own holdings"
  ON user_holdings FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```

### transactions

```sql
-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```

---

## Triggers

### Update `updated_at` Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creators_updated_at
  BEFORE UPDATE ON creators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ... etc for other tables
```

---

## Functions

### get_user_rank

Get a user's leaderboard rank.

```sql
CREATE OR REPLACE FUNCTION get_user_rank(user_id uuid)
RETURNS integer AS $$
DECLARE
  user_rank integer;
BEGIN
  SELECT rank INTO user_rank
  FROM leaderboard
  WHERE id = user_id;
  
  RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql;
```

---

## Migrations

Migrations are stored in `supabase/migrations/`:

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Creates all tables, indexes, RLS policies |
| `002_seed_data.sql` | Seeds initial creators and pools |

### Running Migrations

1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Paste migration file contents
4. Click "Run" (or Cmd+Enter)

---

## Data Integrity Rules

### Pool Constants

- **Total Token Supply**: 10,000,000 (10M)
- **Initial Pool Supply**: 9,000,000 (90%)
- **Creator Vesting**: 1,000,000 (10%) - reserved for Phase 2

### Trading Rules

- **AMM Invariant**: `token_supply × nmbr_reserve = k` (constant)
- **Minimum Trade**: No enforced minimum
- **Maximum Trade**: Limited by pool liquidity
- **Fee**: 1% on all trades

### Price Calculation

```
current_price = nmbr_reserve / token_supply
market_cap = current_price × 10,000,000
```

---

## Performance Considerations

### Indexes to Add (If Needed)

```sql
-- If sorting by CPI becomes common
CREATE INDEX idx_creators_cpi ON creators(cpi_score DESC);

-- If filtering transactions by type
CREATE INDEX idx_transactions_type ON transactions(type);

-- If time-range queries are slow
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp DESC);
```

### Query Optimization Tips

1. Always filter by indexed columns first
2. Use LIMIT for paginated queries
3. Consider materialized view for leaderboard if slow
4. Archive old price_history periodically
