"""
Users Router

Handles user profile and faucet endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends

from ..database import get_supabase
from ..models.schemas import (
    UserResponse, UserWithHoldings, FaucetRequest, FaucetResponse
)
from ..services.faucet_service import claim_faucet
from ..services.portfolio_service import get_user_holdings, calculate_roi
from .auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserWithHoldings)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile with holdings.
    """
    supabase = get_supabase()
    
    # Get holdings
    holdings = await get_user_holdings(current_user["id"])
    
    # Calculate ROI based on actual cost basis of holdings
    holdings_value = sum(h["current_value"] for h in holdings)
    total_cost_basis = sum(h["cost_basis"] for h in holdings)
    roi_pct = ((holdings_value - total_cost_basis) / total_cost_basis) * 100 if total_cost_basis > 0 else 0
    
    # Get user's rank from leaderboard
    rank = None
    if total_cost_basis > 0:
        try:
            rank_response = supabase.rpc("get_user_rank", {"target_user_id": current_user["id"]}).execute()
            if rank_response.data:
                rank = rank_response.data
        except Exception:
            pass  # Rank is optional, don't fail if function doesn't exist
    
    # Calculate allocation percentages
    for holding in holdings:
        holding["allocation_pct"] = (
            (holding["current_value"] / holdings_value) * 100
            if holdings_value > 0 else 0
        )
    
    return {
        **current_user,
        "portfolio_value": holdings_value,
        "roi_pct": roi_pct,
        "rank": rank,
        "holdings": holdings
    }


@router.post("/faucet", response_model=FaucetResponse)
async def claim_faucet_tokens(
    request: FaucetRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Claim initial $NMBR tokens (once per user).
    """
    success, new_balance, error_code = await claim_faucet(
        current_user["id"],
        request.device_fingerprint
    )
    
    if not success:
        if error_code == "ALREADY_CLAIMED":
            raise HTTPException(
                status_code=400,
                detail="You have already claimed your tokens"
            )
        elif error_code == "DEVICE_BLOCKED":
            raise HTTPException(
                status_code=403,
                detail="This device has already been used to claim tokens"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Faucet claim failed: {error_code}"
            )
    
    from ..config import get_settings
    settings = get_settings()
    
    return FaucetResponse(
        success=True,
        amount_claimed=settings.faucet_amount,
        new_balance=new_balance
    )
