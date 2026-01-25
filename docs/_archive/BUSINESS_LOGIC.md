# Nombre Business Logic

## Overview

This document details the core business logic, formulas, and rules that govern the Nombre MVP.

---

## Token Economics

### Token Distribution

When a creator is onboarded, 10,000,000 (10M) tokens are minted:

| Allocation | Amount | Destination | Purpose |
|------------|--------|-------------|---------|
| **Liquidity Pool** | 9,000,000 (90%) | Uniswap-style pool | Available for trading |
| **Creator Vesting** | 1,000,000 (10%) | Vesting contract | Unlocks based on milestones (Phase 2) |

### $NMBR Token (Platform Currency)

- **MVP**: Play money for competition
- **No real value**: Cannot be deposited/withdrawn
- **Faucet**: New users receive 10,000 $NMBR
- **Use**: Trade for creator tokens

---

## Creator Performance Index (CPI)

The CPI is a 0-1000 score that measures a creator's "investability".

### Formula

```python
def calculate_cpi(
    subscriber_count: int,
    views_30d: int,
    lifetime_views: int
) -> float:
    """
    Calculate CPI on a 0-1000 scale.
    
    Weight distribution:
    - Subscribers: 30% (stability/legacy)
    - 30-day views: 50% (momentum - most important)
    - Lifetime views: 20% (legacy/credibility)
    """
    
    # Normalize each metric to 0-1 scale with reasonable caps
    # Then apply weights
    
    # Subscribers: Cap at 10M (very few exceed this)
    sub_normalized = min(subscriber_count / 10_000_000, 1.0)
    sub_score = sub_normalized * 300  # 30% weight
    
    # 30-day views: Cap at 100M (viral threshold)
    views_30d_normalized = min(views_30d / 100_000_000, 1.0)
    views_30d_score = views_30d_normalized * 500  # 50% weight
    
    # Lifetime views: Cap at 10B
    lifetime_normalized = min(lifetime_views / 10_000_000_000, 1.0)
    lifetime_score = lifetime_normalized * 200  # 20% weight
    
    cpi = sub_score + views_30d_score + lifetime_score
    
    return round(cpi, 2)
```

### CPI Tiers

| CPI Range | Tier | Example Creators |
|-----------|------|------------------|
| 0-100 | Micro | < 100k subs, low views |
| 100-300 | Rising | 100k-1M subs, growing |
| 300-500 | Established | 1M-5M subs, consistent |
| 500-700 | Major | 5M-20M subs, high views |
| 700-900 | Mega | 20M+ subs, massive reach |
| 900-1000 | Legendary | PewDiePie, MrBeast tier |

### CPI Updates

- CPI should be recalculated **daily** or **weekly**
- Large CPI changes could trigger price movement
- Future: CPI changes could create trading opportunities

---

## Valuation: CPI to Market Cap

The initial market cap determines how much $NMBR is deposited to back the pool.

### Formula

```python
def cpi_to_market_cap(cpi_score: float) -> float:
    """
    Convert CPI to initial market cap.
    
    Simple linear formula:
    Market Cap = CPI × 100
    
    Examples:
    - CPI 850 → $85,000 market cap
    - CPI 350 → $35,000 market cap
    """
    return cpi_score * 100
```

### Future Enhancements

More sophisticated valuation could include:
- Engagement rate (comments, likes per view)
- Content consistency (upload frequency)
- Audience demographics (valuable audiences)
- Social sentiment analysis

---

## Bonding Curve (AMM)

We use the **Constant Product Market Maker** formula: `x × y = k`

Where:
- `x` = $NMBR reserve in pool
- `y` = Creator token supply in pool
- `k` = Constant (invariant)

### Buy Operation

User wants to buy creator tokens with $NMBR.

```python
def execute_buy(
    nmbr_amount: float,
    nmbr_reserve: float,
    token_supply: float,
    fee_pct: float = 1.0
) -> dict:
    """
    Calculate and execute a buy trade.
    
    Args:
        nmbr_amount: $NMBR user is spending
        nmbr_reserve: Current $NMBR in pool
        token_supply: Current tokens in pool
        fee_pct: Protocol fee percentage
    
    Returns:
        tokens_received, fee_amount, new_price, price_impact
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

User wants to sell creator tokens for $NMBR.

```python
def execute_sell(
    token_amount: float,
    nmbr_reserve: float,
    token_supply: float,
    fee_pct: float = 1.0
) -> dict:
    """
    Calculate and execute a sell trade.
    
    Args:
        token_amount: Tokens user is selling
        nmbr_reserve: Current $NMBR in pool
        token_supply: Current tokens in pool
        fee_pct: Protocol fee percentage
    
    Returns:
        nmbr_received, fee_amount, new_price, price_impact
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
    
    # Price impact
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

### Price Calculation

```python
def get_current_price(nmbr_reserve: float, token_supply: float) -> float:
    """
    Current spot price = $NMBR reserve / Token supply
    """
    return nmbr_reserve / token_supply

def get_token_amount_for_nmbr(
    nmbr_amount: float,
    nmbr_reserve: float,
    token_supply: float
) -> float:
    """
    How many tokens will I get for X $NMBR?
    """
    k = nmbr_reserve * token_supply
    new_nmbr_reserve = nmbr_reserve + nmbr_amount
    new_token_supply = k / new_nmbr_reserve
    return token_supply - new_token_supply

def get_nmbr_amount_for_tokens(
    token_amount: float,
    nmbr_reserve: float,
    token_supply: float
) -> float:
    """
    How much $NMBR will I get for X tokens?
    """
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
) -> bool:
    """
    Verify trade doesn't exceed user's slippage tolerance.
    """
    slippage = ((expected_output - actual_output) / expected_output) * 100
    return slippage <= max_slippage_pct
```

---

## Portfolio Calculations

### Portfolio Value

```python
def calculate_portfolio_value(
    holdings: list[dict],
    current_prices: dict
) -> float:
    """
    Sum of all holdings × current prices.
    
    holdings: [{"creator_id": "...", "token_amount": 100.0}, ...]
    current_prices: {"creator_id": current_price, ...}
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

### Why ROI vs Total Value?

ROI-based ranking is **fairer** because:
- Everyone starts with 10,000 $NMBR
- Early users don't have an advantage
- Late joiners can still compete
- Rewards skill, not timing

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
    Check if user can claim faucet tokens.
    
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

### Device Fingerprinting

Use FingerprintJS or similar to generate a unique device ID:
- Browser fingerprint
- Hardware characteristics
- Stored in user record

### Trade Rate Limiting

- Max 10 trades per minute
- Prevents bot manipulation

---

## Fee Structure

### Protocol Fee

- **Rate**: 1% on all trades
- **Applied to**: Output amount (after AMM calculation)
- **Destination**: Treasury wallet (for future use)

```python
def apply_fee(amount: float, fee_pct: float = 1.0) -> tuple[float, float]:
    """
    Returns: (amount_after_fee, fee_amount)
    """
    fee = amount * (fee_pct / 100)
    return amount - fee, fee
```

### Future Fees (Post-MVP)

- Gas sponsorship fees
- Creator withdrawal fees
- Premium features
