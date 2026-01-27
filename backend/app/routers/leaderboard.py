"""
Leaderboard Router

Handles portfolio value-based competition leaderboard.
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
    Get portfolio value-based leaderboard.
    
    Users are ranked by total holdings value (portfolio_value).
    """
    supabase = get_supabase()
    
    # Get all users who have holdings
    response = supabase.table("users").select(
        "id, display_name, avatar_url",
        count="exact"
    ).execute()
    
    # Calculate ROI for each user based on their actual holdings
    users_with_roi = []
    
    for user in response.data:
        # Get holdings for this user to calculate accurate ROI
        holdings = await get_user_holdings(user["id"])
        
        if not holdings:
            continue  # Skip users with no holdings
            
        holdings_value = sum(h["current_value"] for h in holdings)
        total_cost_basis = sum(h["cost_basis"] for h in holdings)
        
        if total_cost_basis <= 0:
            continue
        
        # ROI = (current value - cost basis) / cost basis * 100
        roi_pct = ((holdings_value - total_cost_basis) / total_cost_basis) * 100
        
        users_with_roi.append({
            **user,
            "portfolio_value": holdings_value,
            "total_invested": total_cost_basis,
            "roi_pct": roi_pct
        })
    
    # Sort by portfolio value descending, then by ROI for ties
    users_with_roi.sort(
        key=lambda x: (x["portfolio_value"], x["roi_pct"]),
        reverse=True
    )
    
    # Assign ranks
    leaderboard = []
    my_rank = None
    
    for i, user in enumerate(users_with_roi):
        rank = i + 1
        
        # Check if this is the current user
        if current_user and user["id"] == current_user["id"]:
            my_rank = rank
        
        # Only include users in the requested range
        if offset <= i < offset + limit:
            leaderboard.append(LeaderboardEntry(
                rank=rank,
                user_id=user["id"],
                display_name=user.get("display_name", "Anonymous"),
                avatar_url=user.get("avatar_url"),
                roi_pct=user["roi_pct"],
                portfolio_value=float(user.get("portfolio_value", 0)),  # Holdings value only
                total_invested=float(user.get("total_invested", 0))
            ))
    
    return LeaderboardResponse(
        leaderboard=leaderboard,
        my_rank=my_rank,
        total_users=len(users_with_roi)
    )
