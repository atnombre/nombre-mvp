"""
Maintenance Service

Handles daily maintenance tasks:
1. updating price_24h_ago snapshots
2. calculating 24h volume
3. calculating price_change_24h
4. updating market caps
5. updating portfolio values
"""

from datetime import datetime, timedelta
from ..database import get_supabase

async def update_price_snapshots():
    """
    Update price_24h_ago with the current price for all pools.
    This should be run at the same time every day so price_change_24h is accurate.
    """
    supabase = get_supabase()
    
    # Get all pools with their current prices
    pools = supabase.table("pools").select("id, current_price").execute()
    
    updated = 0
    for pool in pools.data:
        # Set price_24h_ago to current_price
        # Tomorrow, price_change_24h = ((current_price - price_24h_ago) / price_24h_ago) * 100
        supabase.table("pools").update({
            "price_24h_ago": pool["current_price"] 
        }).eq("id", pool["id"]).execute()
        updated += 1
    
    return updated


async def calculate_volume_24h():
    """
    Calculate actual 24-hour volume from transactions table.
    Sums up all nmbr_amount from transactions in the last 24 hours.
    """
    supabase = get_supabase()
    
    # Get timestamp for 24 hours ago
    cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
    
    # Get all pools
    pools = supabase.table("pools").select("id").execute()
    
    updated = 0
    for pool in pools.data:
        # Sum all transactions for this pool in the last 24 hours
        tx_response = supabase.table("transactions").select(
            "nmbr_amount"
        ).eq("pool_id", pool["id"]).gte("created_at", cutoff).execute()
        
        # Calculate total volume
        volume_24h = sum(float(tx.get("nmbr_amount", 0)) for tx in tx_response.data)
        
        # Update pool
        supabase.table("pools").update({
            "volume_24h": volume_24h
        }).eq("id", pool["id"]).execute()
        updated += 1
    
    return updated


async def calculate_price_changes():
    """
    Calculate price_change_24h percentage for all pools.
    Formula: ((current_price - price_24h_ago) / price_24h_ago) * 100
    """
    supabase = get_supabase()
    
    # Get all pools
    pools = supabase.table("pools").select(
        "id, current_price, price_24h_ago"
    ).execute()
    
    updated = 0
    for pool in pools.data:
        current = float(pool.get("current_price", 0))
        yesterday = float(pool.get("price_24h_ago") or current)  # Default to current if no snapshot
        
        if yesterday > 0:
            change_pct = ((current - yesterday) / yesterday) * 100
        else:
            change_pct = 0
        
        supabase.table("pools").update({
            "price_change_24h": round(change_pct, 4)
        }).eq("id", pool["id"]).execute()
        updated += 1
    
    return updated


async def update_volume_all_time():
    """
    Calculate total all-time volume from transactions.
    """
    supabase = get_supabase()
    
    # Get all pools
    pools = supabase.table("pools").select("id").execute()
    
    updated = 0
    for pool in pools.data:
        # Sum ALL transactions for this pool
        tx_response = supabase.table("transactions").select(
            "nmbr_amount"
        ).eq("pool_id", pool["id"]).execute()
        
        volume_all_time = sum(float(tx.get("nmbr_amount", 0)) for tx in tx_response.data)
        
        supabase.table("pools").update({
            "volume_all_time": volume_all_time
        }).eq("id", pool["id"]).execute()
        updated += 1
    
    return updated


async def update_market_caps():
    """
    Recalculate market cap for all pools.
    Market Cap = Total Token Supply (10M) * Current Price
    """
    supabase = get_supabase()
    
    # Total token supply is always 10M (9M in pool + 1M creator vesting)
    TOTAL_TOKEN_SUPPLY = 10_000_000
    
    pools = supabase.table("pools").select(
        "id, current_price"
    ).execute()
    
    updated = 0
    for pool in pools.data:
        current_price = float(pool.get("current_price", 0))
        market_cap = TOTAL_TOKEN_SUPPLY * current_price
        
        supabase.table("pools").update({
            "market_cap": market_cap
        }).eq("id", pool["id"]).execute()
        updated += 1
    
    return updated


async def update_portfolio_values():
    """
    Recalculate portfolio values for all users.
    """
    supabase = get_supabase()
    
    # Get all users who have holdings
    users = supabase.table("users").select("id").execute()
    
    updated = 0
    for user in users.data:
        user_id = user["id"]
        
        # Get all holdings for this user with current prices
        holdings = supabase.table("user_holdings").select(
            "token_amount, creators(pools(current_price))"
        ).eq("user_id", user_id).gt("token_amount", 0).execute()
        
        # Calculate total portfolio value
        portfolio_value = 0
        for h in holdings.data:
            amount = float(h.get("token_amount", 0))
            creator = h.get("creators", {})
            pools = creator.get("pools", {})
            if isinstance(pools, list):
                pools = pools[0] if pools else {}
            price = float(pools.get("current_price", 0))
            portfolio_value += amount * price
        
        # Update user
        supabase.table("users").update({
            "portfolio_value": portfolio_value
        }).eq("id", user_id).execute()
        updated += 1
    
    return updated


async def run_all_maintenance():
    """Run all maintenance tasks in correct order."""
    
    # 1. Update calculated stats
    vol_24h = await calculate_volume_24h()
    price_change = await calculate_price_changes()
    
    # 2. Update snapshots for NEXT day (Must come AFTER calculating change)
    snapshots = await update_price_snapshots()
    
    # 3. Update derived stats
    caps = await update_market_caps()
    vol_all = await update_volume_all_time()
    portfolios = await update_portfolio_values()
    
    return {
        "volume_24h_updated": vol_24h,
        "price_changes_updated": price_change,
        "snapshots_updated": snapshots,
        "market_caps_updated": caps,
        "volume_all_time_updated": vol_all,
        "portfolios_updated": portfolios
    }
