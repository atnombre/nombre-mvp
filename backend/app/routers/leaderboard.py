"""
Leaderboard Router

Handles total valuation-based competition leaderboard.
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional

from ..database import get_supabase
from ..models.schemas import LeaderboardResponse, LeaderboardEntry
from ..services.portfolio_service import calculate_roi, get_user_holdings
from .auth import get_current_user

router = APIRouter()


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    current_user: Optional[dict] = Depends(get_current_user),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    """
    Get total valuation-based leaderboard.
    
    Users are ranked by Total Valuation = Portfolio Value + Free Cash (nmbr_balance).
    """
    supabase = get_supabase()
    
    # Get all users with their nmbr_balance
    response = supabase.table("users").select(
        "id, username, display_name, avatar_url, nmbr_balance",
        count="exact"
    ).execute()
    
    # Calculate total valuation for each user
    users_with_valuation = []
    
    for user in response.data:
        # Get holdings for this user
        holdings = await get_user_holdings(user["id"])
        
        nmbr_balance = float(user.get("nmbr_balance", 0))
        holdings_value = sum(h["current_value"] for h in holdings) if holdings else 0
        total_cost_basis = sum(h["cost_basis"] for h in holdings) if holdings else 0
        
        # Calculate total valuation = portfolio + cash
        total_valuation = holdings_value + nmbr_balance
        
        # Skip users with 0 total valuation
        if total_valuation <= 0:
            continue
        
        # Calculate ROI (only if they have invested)
        if total_cost_basis > 0:
            roi_pct = ((holdings_value - total_cost_basis) / total_cost_basis) * 100
        else:
            roi_pct = 0.0
        
        users_with_valuation.append({
            **user,
            "total_valuation": total_valuation,
            "portfolio_value": holdings_value,
            "nmbr_balance": nmbr_balance,
            "total_invested": total_cost_basis,
            "roi_pct": roi_pct
        })
    
    # Sort by total valuation descending
    users_with_valuation.sort(
        key=lambda x: x["total_valuation"],
        reverse=True
    )
    
    # Assign ranks
    leaderboard = []
    my_rank = None
    
    for i, user in enumerate(users_with_valuation):
        rank = i + 1
        
        # Check if this is the current user
        if current_user and user["id"] == current_user["id"]:
            my_rank = rank
        
        # Only include users in the requested range
        if offset <= i < offset + limit:
            leaderboard.append(LeaderboardEntry(
                rank=rank,
                user_id=user["id"],
                username=user.get("username"),
                display_name=user.get("display_name", "Anonymous"),
                avatar_url=user.get("avatar_url"),
                total_valuation=user["total_valuation"],
                portfolio_value=user["portfolio_value"],
                nmbr_balance=user["nmbr_balance"],
                roi_pct=user["roi_pct"],
                total_invested=user["total_invested"]
            ))
    
    return LeaderboardResponse(
        leaderboard=leaderboard,
        my_rank=my_rank,
        total_users=len(users_with_valuation)
    )

