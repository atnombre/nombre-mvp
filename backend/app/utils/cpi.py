"""
CPI (Creator Performance Index) Calculation Utility

IMPROVED VERSION v2:
- Uses logarithmic scaling for all components (fairer distribution)
- Has minimum floor based on subscribers (channels always have value)
- Gracefully handles missing 30-day view data
- Includes engagement ratio as a quality signal
"""

import math


def calculate_cpi(
    subscriber_count: int,
    views_30d: int,
    lifetime_views: int
) -> float:
    """
    Calculate Creator Performance Index using improved logarithmic formula.
    
    Key Improvements:
    1. All components use logarithmic scaling (not just subscribers)
    2. Fallback estimation when 30-day views unavailable
    3. Engagement ratio rewards efficient channels
    4. Minimum floor ensures all channels have tradeable value
    
    Components:
    - Subscribers: 35-55% (base stability, higher weight when views missing)
    - 30-day views: 20-40% (momentum/hype)
    - Lifetime views: 15% (legacy/credibility)
    - Engagement ratio: 10% (views per subscriber efficiency)
    
    Output: CPI score typically 50-1000
    Market Cap = CPI × $100 (so $5,000 to $100,000)
    
    Args:
        subscriber_count: Current subscriber count
        views_30d: Views in the last 30 days (0 if unavailable)
        lifetime_views: Total lifetime views
    
    Returns:
        CPI score (minimum 50, typical range 100-800)
    """
    if subscriber_count == 0:
        return 50.0  # Minimum CPI
    
    # === COMPONENT 1: Subscriber Base ===
    # ln scale: ln(1K)=6.9, ln(10K)=9.2, ln(100K)=11.5, ln(1M)=13.8, ln(10M)=16.1
    subscriber_score = (math.log(max(subscriber_count, 1)) / 20) * 100
    
    # === COMPONENT 2: 30-day Views ===
    if views_30d > 0:
        views_30d_score = (math.log(max(views_30d, 1)) / 25) * 100
        has_recent_data = True
    else:
        # Estimate from lifetime (2% monthly approximation, discounted)
        estimated_30d = max(lifetime_views * 0.02, 1)
        views_30d_score = (math.log(estimated_30d) / 25) * 100 * 0.5
        has_recent_data = False
    
    # === COMPONENT 3: Lifetime Legacy ===
    lifetime_score = (math.log(max(lifetime_views, 1)) / 25) * 100 if lifetime_views > 0 else 0
    
    # === COMPONENT 4: Engagement Ratio ===
    if lifetime_views > 0 and subscriber_count > 0:
        views_per_sub = lifetime_views / subscriber_count
        engagement_score = min((math.log(max(views_per_sub, 1)) / 10) * 100, 100)
    else:
        engagement_score = 50
    
    # === WEIGHTED SUM ===
    if has_recent_data:
        cpi = (
            0.35 * subscriber_score +
            0.40 * views_30d_score +
            0.15 * lifetime_score +
            0.10 * engagement_score
        )
    else:
        cpi = (
            0.55 * subscriber_score +
            0.20 * views_30d_score +
            0.15 * lifetime_score +
            0.10 * engagement_score
        )
    
    # Scale to 100-1000 range
    cpi_scaled = cpi * 12
    
    return round(max(cpi_scaled, 50.0), 1)


def cpi_to_market_cap(cpi_score: float) -> float:
    """
    Convert CPI score to initial market cap in $NMBR.
    
    Simple linear formula: Market Cap = CPI × 100
    
    Examples:
    - CPI 850 → $85,000 market cap
    - CPI 350 → $35,000 market cap
    
    Args:
        cpi_score: CPI score (0-1000)
    
    Returns:
        Initial market cap in $NMBR
    """
    return cpi_score * 100


def cpi_to_initial_price(cpi_score: float, token_supply: float = 9_000_000) -> float:
    """
    Calculate initial token price from CPI.
    
    Price = Market Cap / Token Supply
    
    Args:
        cpi_score: CPI score (0-1000)
        token_supply: Tokens in liquidity pool (default 9M)
    
    Returns:
        Initial price per token
    """
    market_cap = cpi_to_market_cap(cpi_score)
    return market_cap / token_supply if token_supply > 0 else 0


def get_cpi_tier(cpi_score: float) -> str:
    """
    Get human-readable tier for CPI score.
    
    Args:
        cpi_score: CPI score (0-1000)
    
    Returns:
        Tier name (Micro, Rising, Established, Major, Mega, Legendary)
    """
    if cpi_score < 100:
        return "Micro"
    elif cpi_score < 300:
        return "Rising"
    elif cpi_score < 500:
        return "Established"
    elif cpi_score < 700:
        return "Major"
    elif cpi_score < 900:
        return "Mega"
    else:
        return "Legendary"
