"""
Portfolio Router

Handles portfolio overview and detailed breakdown.
"""

from fastapi import APIRouter, Depends

from ..models.schemas import PortfolioResponse
from ..services.portfolio_service import get_user_holdings, calculate_roi
from .auth import get_current_user

router = APIRouter()


@router.get("", response_model=PortfolioResponse)
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    """
    Get detailed portfolio breakdown.
    """
    user_id = current_user["id"]
    nmbr_balance = float(current_user.get("nmbr_balance", 0))
    
    # Get all holdings with current values
    holdings = await get_user_holdings(user_id)
    
    # Calculate totals
    # Portfolio Value = just holdings (NOT including NMBR balance)
    holdings_value = sum(h["current_value"] for h in holdings)
    
    # Total cost basis = what you actually paid for your CURRENT holdings
    total_cost_basis = sum(h["cost_basis"] for h in holdings)
    
    # Total P&L = current holdings value - what you paid for them
    total_pnl = holdings_value - total_cost_basis
    
    # ROI % = (current value - cost basis) / cost basis * 100
    roi_pct = ((holdings_value - total_cost_basis) / total_cost_basis) * 100 if total_cost_basis > 0 else 0
    
    # Calculate allocation percentages
    for holding in holdings:
        holding["allocation_pct"] = (
            (holding["current_value"] / holdings_value) * 100
            if holdings_value > 0 else 0
        )
    
    return PortfolioResponse(
        total_value=holdings_value,  # Portfolio value = holdings only
        total_invested=total_cost_basis,  # What you paid for current holdings
        total_pnl=total_pnl,
        roi_pct=roi_pct,
        nmbr_balance=nmbr_balance,
        holdings=holdings
    )
