# Nombre Database Schema

## Overview

The database is hosted on **Supabase** (PostgreSQL). This document defines all tables, relationships, and key business logic.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  creators   │       │   pools     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │───────│ creator_id  │
│ wallet      │       │ youtube_id  │       │ token_supply│
│ email       │       │ username    │       │ nmbr_reserve│
│ balance     │       │ subscribers │       │ price       │
│ created_at  │       │ cpi_score   │       │ volume_24h  │
└─────────────┘       │ token_addr  │       └─────────────┘
       │              └─────────────┘              │
       │                                           │
       │              ┌─────────────┐              │
       └──────────────│transactions │──────────────┘
                      ├─────────────┤
                      │ id (PK)     │
                      │ user_id     │
                      │ pool_id     │
                      │ type        │
                      │ amount_in   │
                      │ amount_out  │
                      │ price       │
                      │ created_at  │
                      └─────────────┘
```

---

## Tables

### `users`

The "Account" - represents each app user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique user ID |
| `auth_id` | `uuid` | NOT NULL, UNIQUE, FK → auth.users | Supabase Auth ID |
| `email` | `text` | NOT NULL | Google email |
| `display_name` | `text` | | Google display name |
| `avatar_url` | `text` | | Google profile picture |
| `wallet_address` | `text` | UNIQUE | Ethereum wallet (for Phase 2) |
| `nmbr_balance` | `decimal(20,8)` | DEFAULT 0 | $NMBR balance |
| `total_invested` | `decimal(20,8)` | DEFAULT 0 | Total $NMBR spent on buys |
| `portfolio_value` | `decimal(20,8)` | DEFAULT 0 | Current value of holdings |
| `faucet_claimed` | `boolean` | DEFAULT false | Has claimed initial tokens |
| `device_fingerprint` | `text` | UNIQUE | Anti-cheat device ID |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

**Indexes:**
- `auth_id` (unique)
- `wallet_address` (unique)
- `email`

---

### `creators`

The "Asset" - represents each tradable creator.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique creator ID |
| `youtube_channel_id` | `text` | NOT NULL, UNIQUE | YouTube channel ID |
| `username` | `text` | NOT NULL | YouTube handle (e.g., @pewdiepie) |
| `display_name` | `text` | NOT NULL | Channel name |
| `avatar_url` | `text` | | Channel profile picture |
| `banner_url` | `text` | | Channel banner |
| `subscriber_count` | `bigint` | DEFAULT 0 | Current subscriber count |
| `view_count_lifetime` | `bigint` | DEFAULT 0 | Total lifetime views |
| `view_count_30d` | `bigint` | DEFAULT 0 | Views in last 30 days |
| `video_count` | `integer` | DEFAULT 0 | Total videos |
| `cpi_score` | `decimal(10,2)` | DEFAULT 0 | Creator Performance Index (0-1000) |
| `token_symbol` | `text` | NOT NULL, UNIQUE | e.g., "PEWDS" |
| `token_address` | `text` | UNIQUE | ERC-20 contract address (Phase 2) |
| `is_verified` | `boolean` | DEFAULT false | Creator-verified account |
| `last_stats_update` | `timestamptz` | | Last YouTube data sync |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

**Indexes:**
- `youtube_channel_id` (unique)
- `token_symbol` (unique)

---

### `pools`

The "Market" - represents each creator's liquidity pool.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Unique pool ID |
| `creator_id` | `uuid` | NOT NULL, FK → creators.id, UNIQUE | One pool per creator |
| `token_supply` | `decimal(20,8)` | DEFAULT 9000000 | Tokens in pool (90% of 10M) |
| `nmbr_reserve` | `decimal(20,8)` | NOT NULL | $NMBR backing the pool |
| `initial_price` | `decimal(20,8)` | NOT NULL | Launch price |
| `current_price` | `decimal(20,8)` | NOT NULL | Current price per token |
| `price_24h_ago` | `decimal(20,8)` | | Price 24 hours ago |
| `price_change_24h` | `decimal(10,4)` | | % change in 24h |
| `volume_24h` | `decimal(20,8)` | DEFAULT 0 | Trading volume (24h) |
| `volume_all_time` | `decimal(20,8)` | DEFAULT 0 | Total trading volume |
| `market_cap` | `decimal(20,8)` | | current_price × total_supply |
| `holder_count` | `integer` | DEFAULT 0 | Number of unique holders |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

**Indexes:**
- `creator_id` (unique)
- `volume_24h` (for sorting)
- `price_change_24h` (for sorting)

---

### `user_holdings`

Tracks each user's token holdings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → users.id | |
| `creator_id` | `uuid` | NOT NULL, FK → creators.id | |
| `token_amount` | `decimal(20,8)` | NOT NULL, DEFAULT 0 | Amount of creator tokens held |
| `avg_buy_price` | `decimal(20,8)` | | Average price paid |
| `total_cost_basis` | `decimal(20,8)` | DEFAULT 0 | Total $NMBR spent |
| `created_at` | `timestamptz` | DEFAULT now() | |
| `updated_at` | `timestamptz` | DEFAULT now() | |

**Constraints:**
- UNIQUE (`user_id`, `creator_id`) - One row per user-creator pair

---

### `transactions`

The "History" - all buy/sell transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → users.id | |
| `pool_id` | `uuid` | NOT NULL, FK → pools.id | |
| `type` | `text` | NOT NULL, CHECK (type IN ('buy', 'sell')) | |
| `token_amount` | `decimal(20,8)` | NOT NULL | Tokens bought/sold |
| `nmbr_amount` | `decimal(20,8)` | NOT NULL | $NMBR spent/received |
| `price_per_token` | `decimal(20,8)` | NOT NULL | Price at transaction |
| `fee_amount` | `decimal(20,8)` | DEFAULT 0 | 1% protocol fee |
| `slippage_pct` | `decimal(6,4)` | | Actual slippage |
| `created_at` | `timestamptz` | DEFAULT now() | |

**Indexes:**
- `user_id`
- `pool_id`
- `created_at` (for sorting)

---

### `price_history`

Historical price data for charts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `pool_id` | `uuid` | NOT NULL, FK → pools.id | |
| `price` | `decimal(20,8)` | NOT NULL | |
| `volume` | `decimal(20,8)` | DEFAULT 0 | Volume in this period |
| `timestamp` | `timestamptz` | NOT NULL | |

**Indexes:**
- (`pool_id`, `timestamp`)

---

### `leaderboard` (View or Materialized View)

Computed ranking for MVP competition.

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
  RANK() OVER (ORDER BY 
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

---

## Key Business Logic

### CPI (Creator Performance Index) Calculation

```python
def calculate_cpi(subscriber_count: int, views_30d: int, lifetime_views: int) -> float:
    """
    Calculate CPI on a 0-1000 scale.
    
    Weights:
    - Subscriber velocity: 30%
    - 30-day views momentum: 50% (highest weight - shows current relevance)
    - Lifetime views legacy: 20%
    """
    # Normalize to reasonable scales
    sub_score = min(subscriber_count / 10_000_000, 1.0) * 300  # Cap at 10M subs
    views_30d_score = min(views_30d / 100_000_000, 1.0) * 500  # Cap at 100M monthly views
    lifetime_score = min(lifetime_views / 10_000_000_000, 1.0) * 200  # Cap at 10B views
    
    return sub_score + views_30d_score + lifetime_score
```

### Initial Valuation from CPI

```python
def cpi_to_market_cap(cpi_score: float) -> float:
    """
    Convert CPI score to initial market cap in $NMBR.
    
    Example: CPI 850 → $85,000 market cap
    """
    return cpi_score * 100  # Simple 100x multiplier
```

### Bonding Curve (x*y=k)

```python
def calculate_buy_price(token_amount: float, nmbr_reserve: float, token_supply: float) -> float:
    """
    AMM constant product formula.
    User wants to buy `token_amount` tokens.
    Returns: $NMBR required.
    """
    k = nmbr_reserve * token_supply
    new_token_supply = token_supply - token_amount
    new_nmbr_reserve = k / new_token_supply
    nmbr_required = new_nmbr_reserve - nmbr_reserve
    return nmbr_required

def calculate_sell_price(token_amount: float, nmbr_reserve: float, token_supply: float) -> float:
    """
    User wants to sell `token_amount` tokens.
    Returns: $NMBR received (before fees).
    """
    k = nmbr_reserve * token_supply
    new_token_supply = token_supply + token_amount
    new_nmbr_reserve = k / new_token_supply
    nmbr_received = nmbr_reserve - new_nmbr_reserve
    return nmbr_received
```

### ROI Calculation

```python
def calculate_roi(portfolio_value: float, total_invested: float) -> float:
    """
    Calculate Return on Investment as percentage.
    This is used for leaderboard ranking.
    """
    if total_invested == 0:
        return 0
    return ((portfolio_value - total_invested) / total_invested) * 100
```

---

## Row Level Security (RLS) Policies

```sql
-- Users can only read/update their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- Everyone can view creators (public data)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators are viewable by everyone"
  ON creators FOR SELECT
  TO authenticated
  USING (true);

-- Similar policies for pools, transactions, etc.
```

---

## Database Triggers

### Update `updated_at` timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Sync portfolio value on trade

After each transaction, trigger updates:
1. `user_holdings` table (add/remove tokens)
2. `users.portfolio_value` (recalculate from holdings × current prices)
3. `pools` (update reserves, price, volume)
