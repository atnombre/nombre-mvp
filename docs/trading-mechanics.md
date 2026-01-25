# Trading Mechanics

This document explains the core business logic powering Nombre's trading system, including the CPI formula, bonding curve math, and portfolio calculations.

---

## Overview

Nombre uses three key mechanisms:

1. **CPI (Creator Performance Index)** - Scores creators 0-1000 based on YouTube metrics
2. **Initial Valuation** - Converts CPI to initial token price
3. **AMM Bonding Curve** - Determines price changes from trading activity

---

## Token Economics

### Token Distribution

When a creator is onboarded, **10,000,000 (10M)** tokens are minted:

| Allocation | Amount | Percentage | Purpose |
|------------|--------|------------|---------|
| **Liquidity Pool** | 9,000,000 | 90% | Available for trading |
| **Creator Vesting** | 1,000,000 | 10% | Reserved for Phase 2 |

### $NMBR Token (Platform Currency)

| Property | Value |
|----------|-------|
| **Type** | Play money (MVP) |
| **Real Value** | None (cannot withdraw) |
| **Starting Balance** | 0 (claim via faucet) |
| **Faucet Amount** | 10,000 $NMBR |
| **Use** | Trade for creator tokens |

---

## Creator Performance Index (CPI)

The CPI is a **0-1000 score** measuring a creator's "investability."

### Formula

```python
import math

def calculate_cpi(
    subscriber_count: int,
    views_30d: int,
    lifetime_views: int
) -> float:
    """
    Calculate CPI on a 0-1000 scale using logarithmic scaling.
    
    Weight distribution:
    - Subscribers: 30% (stability/legacy)
    - 30-day views: 60% (momentum - most important)
    - Lifetime views: 10% (legacy/credibility)
    """
    
    # Logarithmic scaling for subscribers
    # ln(10M) ≈ 16.1, so divide by 16 to normalize to ~0-1
    sub_normalized = math.log(max(subscriber_count, 1)) / 16.0
    sub_score = min(sub_normalized, 1.0) * 300  # 30% weight, max 300
    
    # 30-day views: normalize to 0-1 (100M is "viral")
    views_30d_normalized = min(views_30d / 100_000_000, 1.0)
    views_30d_score = views_30d_normalized * 600  # 60% weight, max 600
    
    # Lifetime views: normalize (10B is "legendary")
    lifetime_normalized = min(lifetime_views / 10_000_000_000, 1.0)
    lifetime_score = lifetime_normalized * 100  # 10% weight, max 100
    
    # Combine and scale
    raw_score = sub_score + views_30d_score + lifetime_score
    
    # Apply logarithmic compression and scale by 50
    cpi = math.log(max(raw_score, 1) + 1) * 50
    
    return round(min(cpi, 1000), 2)
```

### CPI Tiers

| CPI Range | Tier | Example Characteristics |
|-----------|------|------------------------|
| 0-100 | Micro | < 100k subs, minimal views |
| 100-300 | Rising | 100k-1M subs, growing audience |
| 300-500 | Established | 1M-5M subs, consistent content |
| 500-700 | Major | 5M-20M subs, high engagement |
| 700-900 | Mega | 20M+ subs, massive reach |
| 900-1000 | Legendary | MrBeast, PewDiePie tier |

### CPI Update Frequency

- **On Add**: Calculated when creator is added
- **On Refresh**: Manual refresh via API (rate limited)
- **Future**: Daily automatic updates via cron job

---

## Initial Valuation

Converting CPI to market cap and initial price.

### Formula

```python
TOTAL_TOKEN_SUPPLY = 10_000_000  # 10M total tokens
POOL_TOKEN_SUPPLY = 9_000_000   # 90% in pool

def cpi_to_initial_price(cpi_score: float) -> tuple[float, float]:
    """
    Convert CPI to initial market cap and price.
    
    Market Cap = CPI × 100
    Initial Price = Market Cap / Total Supply
    
    Examples:
    - CPI 850 → $85,000 market cap → $0.0085 per token
    - CPI 350 → $35,000 market cap → $0.0035 per token
    """
    market_cap = cpi_score * 100
    initial_price = market_cap / TOTAL_TOKEN_SUPPLY
    
    return market_cap, initial_price
```

### Initial Pool Setup

```python
def create_pool(cpi_score: float) -> dict:
    """
    Set up initial liquidity pool for a creator.
    """
    market_cap, initial_price = cpi_to_initial_price(cpi_score)
    
    # $NMBR reserve = price × tokens in pool
    nmbr_reserve = initial_price * POOL_TOKEN_SUPPLY
    
    return {
        "token_supply": POOL_TOKEN_SUPPLY,  # 9,000,000
        "nmbr_reserve": nmbr_reserve,
        "initial_price": initial_price,
        "current_price": initial_price,
        "market_cap": market_cap
    }
```

---

## Bonding Curve (AMM)

Nombre uses the **Constant Product Market Maker** formula: `x × y = k`

Where:
- `x` = $NMBR reserve in pool
- `y` = Creator token supply in pool
- `k` = Constant (invariant)

This is the same model used by Uniswap and similar DEXs.

### How It Works

```
Initial State:
  x (NMBR)  × y (tokens) = k
  76,500    × 9,000,000  = 688,500,000,000

After Buy (100 NMBR):
  x (NMBR)  × y (tokens) = k
  76,600    × 8,988,247  = 688,500,000,000
  
  Tokens received: 9,000,000 - 8,988,247 = 11,753
  Price increased: 76,600 / 8,988,247 = 0.00852 (was 0.0085)
```

### Buy Operation

```python
def execute_buy(
    nmbr_amount: float,
    nmbr_reserve: float,
    token_supply: float,
    fee_pct: float = 1.0
) -> dict:
    """
    User spends $NMBR to buy creator tokens.
    
    Args:
        nmbr_amount: $NMBR user is spending
        nmbr_reserve: Current $NMBR in pool
        token_supply: Current tokens in pool
        fee_pct: Protocol fee (default 1%)
    
    Returns:
        tokens_received, fee, new_price, price_impact
    """
    # Deduct fee first
    fee_amount = nmbr_amount * (fee_pct / 100)
    nmbr_after_fee = nmbr_amount - fee_amount
    
    # Constant product: k = x × y
    k = nmbr_reserve * token_supply
    
    # New reserves after adding $NMBR
    new_nmbr_reserve = nmbr_reserve + nmbr_after_fee
    
    # Calculate new token supply to maintain k
    new_token_supply = k / new_nmbr_reserve
    
    # Tokens user receives
    tokens_received = token_supply - new_token_supply
    
    # New price (after trade)
    new_price = new_nmbr_reserve / new_token_supply
    
    # Price impact
    old_price = nmbr_reserve / token_supply
    price_impact = ((new_price - old_price) / old_price) * 100
    
    return {
        "tokens_received": tokens_received,
        "fee_amount": fee_amount,
        "new_price": new_price,
        "price_impact_pct": price_impact,
        "new_nmbr_reserve": new_nmbr_reserve,
        "new_token_supply": new_token_supply
    }
```

### Sell Operation

```python
def execute_sell(
    token_amount: float,
    nmbr_reserve: float,
    token_supply: float,
    fee_pct: float = 1.0
) -> dict:
    """
    User sells creator tokens for $NMBR.
    
    Args:
        token_amount: Tokens user is selling
        nmbr_reserve: Current $NMBR in pool
        token_supply: Current tokens in pool
        fee_pct: Protocol fee (default 1%)
    
    Returns:
        nmbr_received, fee, new_price, price_impact
    """
    # Constant product: k = x × y
    k = nmbr_reserve * token_supply
    
    # New token supply after adding tokens back
    new_token_supply = token_supply + token_amount
    
    # Calculate new $NMBR reserve
    new_nmbr_reserve = k / new_token_supply
    
    # $NMBR user receives (before fee)
    nmbr_gross = nmbr_reserve - new_nmbr_reserve
    
    # Deduct fee
    fee_amount = nmbr_gross * (fee_pct / 100)
    nmbr_received = nmbr_gross - fee_amount
    
    # New price (after trade)
    new_price = new_nmbr_reserve / new_token_supply
    
    # Price impact (negative for sells)
    old_price = nmbr_reserve / token_supply
    price_impact = ((old_price - new_price) / old_price) * 100
    
    return {
        "nmbr_received": nmbr_received,
        "fee_amount": fee_amount,
        "new_price": new_price,
        "price_impact_pct": price_impact,
        "new_nmbr_reserve": new_nmbr_reserve,
        "new_token_supply": new_token_supply
    }
```

### Price Calculations

```python
def get_current_price(nmbr_reserve: float, token_supply: float) -> float:
    """Current spot price = $NMBR reserve / Token supply"""
    return nmbr_reserve / token_supply

def get_tokens_for_nmbr(
    nmbr_amount: float,
    nmbr_reserve: float,
    token_supply: float
) -> float:
    """How many tokens for X $NMBR? (before fees)"""
    k = nmbr_reserve * token_supply
    new_nmbr_reserve = nmbr_reserve + nmbr_amount
    new_token_supply = k / new_nmbr_reserve
    return token_supply - new_token_supply

def get_nmbr_for_tokens(
    token_amount: float,
    nmbr_reserve: float,
    token_supply: float
) -> float:
    """How much $NMBR for X tokens? (before fees)"""
    k = nmbr_reserve * token_supply
    new_token_supply = token_supply + token_amount
    new_nmbr_reserve = k / new_token_supply
    return nmbr_reserve - new_nmbr_reserve
```

### Slippage Protection

```python
def check_slippage(
    expected_output: float,
    actual_output: float,
    max_slippage_pct: float
) -> tuple[bool, float]:
    """
    Verify trade doesn't exceed user's slippage tolerance.
    
    Returns: (is_ok, actual_slippage_pct)
    """
    if expected_output == 0:
        return False, 100.0
    
    slippage = ((expected_output - actual_output) / expected_output) * 100
    return slippage <= max_slippage_pct, slippage
```

---

## Portfolio Calculations

### Portfolio Value

```python
def calculate_portfolio_value(
    holdings: list[dict],
    current_prices: dict[str, float]
) -> float:
    """
    Sum of all holdings × current prices.
    
    holdings: [{"creator_id": "...", "token_amount": 100.0}, ...]
    current_prices: {"creator_id": price, ...}
    """
    total = 0.0
    for holding in holdings:
        creator_id = holding["creator_id"]
        amount = holding["token_amount"]
        price = current_prices.get(creator_id, 0)
        total += amount * price
    return total
```

### ROI (Return on Investment)

```python
def calculate_roi(portfolio_value: float, total_invested: float) -> float:
    """
    ROI % = ((Current Value - Total Invested) / Total Invested) × 100
    
    This is the primary metric for leaderboard ranking.
    """
    if total_invested == 0:
        return 0.0
    return ((portfolio_value - total_invested) / total_invested) * 100
```

### Average Buy Price

```python
def update_avg_buy_price(
    current_amount: float,
    current_avg_price: float,
    new_amount: float,
    new_price: float
) -> float:
    """
    Weighted average price when buying more tokens.
    """
    total_cost = (current_amount * current_avg_price) + (new_amount * new_price)
    total_amount = current_amount + new_amount
    return total_cost / total_amount if total_amount > 0 else 0
```

### P&L (Profit and Loss)

```python
def calculate_holding_pnl(
    token_amount: float,
    avg_buy_price: float,
    current_price: float
) -> dict:
    """
    Calculate P&L for a single holding.
    """
    cost_basis = token_amount * avg_buy_price
    current_value = token_amount * current_price
    pnl = current_value - cost_basis
    pnl_pct = (pnl / cost_basis) * 100 if cost_basis > 0 else 0
    
    return {
        "cost_basis": cost_basis,
        "current_value": current_value,
        "pnl": pnl,
        "pnl_pct": pnl_pct
    }
```

---

## Leaderboard Logic

### Ranking Algorithm

```python
def calculate_leaderboard(users: list[dict]) -> list[dict]:
    """
    Rank users by ROI percentage.
    
    Rules:
    1. Only users with total_invested > 0 are ranked
    2. ROI % is the primary sort key
    3. Ties broken by portfolio_value (higher = better)
    """
    # Filter active traders
    active_users = [u for u in users if u["total_invested"] > 0]
    
    # Calculate ROI for each
    for user in active_users:
        user["roi_pct"] = calculate_roi(
            user["portfolio_value"],
            user["total_invested"]
        )
    
    # Sort by ROI descending, then by portfolio value
    sorted_users = sorted(
        active_users,
        key=lambda x: (x["roi_pct"], x["portfolio_value"]),
        reverse=True
    )
    
    # Assign ranks
    for i, user in enumerate(sorted_users):
        user["rank"] = i + 1
    
    return sorted_users
```

### Why ROI Instead of Total Value?

ROI-based ranking is **fairer** because:
- Everyone starts with 10,000 $NMBR
- Early users don't have an inherent advantage
- Late joiners can still compete
- Rewards skill and strategy, not timing

---

## Fee Structure

### Protocol Fee

| Property | Value |
|----------|-------|
| **Rate** | 1% |
| **Applied to** | Output amount (after AMM calculation) |
| **For buys** | Deducted from input $NMBR before calculation |
| **For sells** | Deducted from output $NMBR after calculation |
| **Destination** | Treasury (future use) |

```python
def apply_fee(amount: float, fee_pct: float = 1.0) -> tuple[float, float]:
    """
    Returns: (amount_after_fee, fee_amount)
    """
    fee = amount * (fee_pct / 100)
    return amount - fee, fee
```

---

## Anti-Cheat Mechanisms

### Faucet Protection

```python
def can_claim_faucet(
    user_id: str,
    device_fingerprint: str,
    ip_address: str
) -> tuple[bool, str]:
    """
    Multi-layer faucet abuse prevention.
    
    Returns: (can_claim, reason)
    """
    # Check 1: Has this user already claimed?
    if user_already_claimed(user_id):
        return False, "ALREADY_CLAIMED"
    
    # Check 2: Is this device already used?
    if device_fingerprint_exists(device_fingerprint):
        return False, "DEVICE_BLOCKED"
    
    # Check 3: Rate limit by IP (max 3 claims per IP)
    ip_claims = count_claims_by_ip(ip_address)
    if ip_claims >= 3:
        return False, "IP_RATE_LIMITED"
    
    return True, "OK"
```

### Trade Rate Limiting

- Maximum 10 trades per minute per user
- Prevents bot manipulation
- Enforced at API level

---

## Market Cap Calculation

```python
TOTAL_TOKEN_SUPPLY = 10_000_000  # 10M total (including vested)

def calculate_market_cap(current_price: float) -> float:
    """
    Market Cap = Current Price × Total Supply
    
    Note: Uses total supply (10M), not circulating supply (9M in pool)
    This is consistent with how crypto market caps are calculated.
    """
    return current_price * TOTAL_TOKEN_SUPPLY
```

---

## Price Impact Examples

| Trade Size | Pool Size | Price Impact |
|------------|-----------|--------------|
| 100 NMBR | 76,500 NMBR | ~0.13% |
| 1,000 NMBR | 76,500 NMBR | ~1.3% |
| 10,000 NMBR | 76,500 NMBR | ~13% |

**Key insight**: Larger trades have higher price impact. The AMM naturally provides liquidity but charges more (via slippage) for larger trades.

---

## Summary of Key Constants

| Constant | Value | Location |
|----------|-------|----------|
| Total Token Supply | 10,000,000 | Pool initialization |
| Pool Token Supply | 9,000,000 | Pool initialization |
| Faucet Amount | 10,000 $NMBR | backend/.env |
| Protocol Fee | 1% | backend/.env |
| Max CPI Score | 1,000 | CPI calculation |
| Market Cap Multiplier | 100× CPI | Valuation formula |
