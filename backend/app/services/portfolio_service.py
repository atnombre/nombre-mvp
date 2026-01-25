"""
Portfolio Service

Handles portfolio calculations and holdings management.
"""

from typing import List, Dict, Optional
from ..database import get_supabase


def calculate_roi(portfolio_value: float, total_invested: float) -> float:
    """
    Calculate Return on Investment as percentage.
    
    ROI % = ((Current Value - Total Invested) / Total Invested) × 100
    """
    if total_invested <= 0:
        return 0.0
    return ((portfolio_value - total_invested) / total_invested) * 100


def calculate_pnl(current_value: float, cost_basis: float) -> tuple[float, float]:
    """
    Calculate Profit and Loss.
    
    Returns:
        (pnl_amount, pnl_percentage)
    """
    pnl = current_value - cost_basis
    pnl_pct = (pnl / cost_basis) * 100 if cost_basis > 0 else 0
    return pnl, pnl_pct


def update_avg_buy_price(
    current_amount: float,
    current_avg_price: float,
    new_amount: float,
    new_price: float
) -> float:
    """
    Calculate weighted average price when buying more tokens.
    """
    total_cost = (current_amount * current_avg_price) + (new_amount * new_price)
    total_amount = current_amount + new_amount
    return total_cost / total_amount if total_amount > 0 else 0


async def get_user_holdings(user_id: str) -> List[Dict]:
    """
    Get all holdings for a user with current values.
    """
    supabase = get_supabase()
    
    # Get holdings with creator and pool info (pool is nested under creator)
    response = supabase.table("user_holdings").select(
        "*, creators(id, display_name, avatar_url, token_symbol, pools(current_price))"
    ).eq("user_id", user_id).gt("token_amount", 0).execute()
    
    holdings = []
    for row in response.data:
        creator = row.get("creators", {})
        # Pool is nested under creator since pools.creator_id -> creators.id
        pool = creator.get("pools", {})
        if isinstance(pool, list):
            pool = pool[0] if pool else {}
        
        token_amount = float(row["token_amount"])
        avg_buy_price = float(row.get("avg_buy_price", 0))
        current_price = float(pool.get("current_price", 0))
        
        cost_basis = token_amount * avg_buy_price
        current_value = token_amount * current_price
        pnl, pnl_pct = calculate_pnl(current_value, cost_basis)
        
        holdings.append({
            "creator_id": row["creator_id"],
            "creator_name": creator.get("display_name", "Unknown"),
            "avatar_url": creator.get("avatar_url"),
            "token_symbol": creator.get("token_symbol", "???"),
            "token_amount": token_amount,
            "avg_buy_price": avg_buy_price,
            "current_price": current_price,
            "current_value": current_value,
            "cost_basis": cost_basis,
            "pnl": pnl,
            "pnl_pct": pnl_pct,
        })
    
    return holdings


async def calculate_portfolio_value(user_id: str) -> float:
    """
    Calculate total portfolio value for a user.
    """
    holdings = await get_user_holdings(user_id)
    return sum(h["current_value"] for h in holdings)


async def update_user_portfolio_stats(user_id: str) -> None:
    """
    Recalculate and update user's portfolio stats in database.
    """
    supabase = get_supabase()
    
    # Get holdings and calculate total value
    holdings = await get_user_holdings(user_id)
    portfolio_value = sum(h["current_value"] for h in holdings)
    
    # Update user record
    supabase.table("users").update({
        "portfolio_value": portfolio_value
    }).eq("id", user_id).execute()
