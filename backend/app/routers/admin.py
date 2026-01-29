"""
Admin Router

Provides administrative endpoints for user management, platform stats,
and portfolio inspection. All endpoints require admin privileges.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query

from ..database import get_supabase
from ..models.schemas import PortfolioResponse
from ..services.portfolio_service import get_user_holdings
from .auth import require_admin

router = APIRouter()


# ============ Response Schemas ============

from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    """Platform health metrics"""
    total_users: int
    new_users_24h: int
    total_nmbr_circulating: float
    volume_24h: float
    system_status: str  # "healthy", "degraded", "down"


class AdminUserListItem(BaseModel):
    """User item for admin registry"""
    id: str
    email: str
    display_name: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    nmbr_balance: float
    portfolio_value: float
    created_at: datetime
    is_banned: bool = False
    faucet_claimed: bool = False


class AdminUserListResponse(BaseModel):
    """Paginated user list"""
    users: List[AdminUserListItem]
    total: int
    limit: int
    offset: int


# ============ Platform Stats ============

@router.get("/stats", response_model=AdminStatsResponse)
async def get_platform_stats(admin_user: dict = Depends(require_admin)):
    """
    Get platform health statistics.
    Admin only.
    """
    supabase = get_supabase()
    
    try:
        # Total users count
        users_response = supabase.table("users").select("id", count="exact").execute()
        total_users = users_response.count or 0
        
        # New users in last 24h
        yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
        new_users_response = supabase.table("users").select("id", count="exact").gte(
            "created_at", yesterday.isoformat()
        ).execute()
        new_users_24h = new_users_response.count or 0
        
        # Total NMBR circulating (sum of all user balances)
        balances_response = supabase.table("users").select("nmbr_balance").execute()
        total_nmbr = sum(u.get("nmbr_balance", 0) for u in (balances_response.data or []))
        
        # 24h volume from transactions
        volume_response = supabase.table("transactions").select("nmbr_amount").gte(
            "created_at", yesterday.isoformat()
        ).execute()
        volume_24h = sum(abs(t.get("nmbr_amount", 0)) for t in (volume_response.data or []))
        
        return AdminStatsResponse(
            total_users=total_users,
            new_users_24h=new_users_24h,
            total_nmbr_circulating=total_nmbr,
            volume_24h=volume_24h,
            system_status="healthy"  # Can expand with actual health checks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


# ============ User Management ============

@router.get("/users", response_model=AdminUserListResponse)
async def list_all_users(
    admin_user: dict = Depends(require_admin),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None
):
    """
    Get paginated list of all users.
    Admin only.
    """
    supabase = get_supabase()
    
    try:
        # Base query - note: is_banned may not exist in all databases
        query = supabase.table("users").select(
            "id, email, display_name, username, avatar_url, nmbr_balance, "
            "portfolio_value, created_at, faucet_claimed",
            count="exact"
        )
        
        # Apply search filter
        if search:
            query = query.or_(
                f"email.ilike.%{search}%,"
                f"display_name.ilike.%{search}%,"
                f"username.ilike.%{search}%"
            )
        
        # Order and paginate
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        response = query.execute()
        
        users = [
            AdminUserListItem(
                id=u["id"],
                email=u.get("email", ""),
                display_name=u.get("display_name", ""),
                username=u.get("username"),
                avatar_url=u.get("avatar_url"),
                nmbr_balance=float(u.get("nmbr_balance", 0)),
                portfolio_value=float(u.get("portfolio_value", 0)),
                created_at=u.get("created_at", datetime.now(timezone.utc)),
                is_banned=u.get("is_banned", False),  # Default to False if column doesn't exist
                faucet_claimed=u.get("faucet_claimed", False)
            )
            for u in (response.data or [])
        ]
        
        return AdminUserListResponse(
            users=users,
            total=response.count or 0,
            limit=limit,
            offset=offset
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


@router.get("/users/{user_id}/portfolio", response_model=PortfolioResponse)
async def get_user_portfolio(
    user_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Get any user's portfolio (admin inspection mode).
    Admin only.
    """
    supabase = get_supabase()
    
    try:
        # Get target user
        user_response = supabase.table("users").select("*").eq("id", user_id).single().execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        target_user = user_response.data
        nmbr_balance = float(target_user.get("nmbr_balance", 0))
        
        # Get holdings
        holdings = await get_user_holdings(user_id)
        
        # Calculate totals
        holdings_value = sum(h["current_value"] for h in holdings)
        total_cost_basis = sum(h["cost_basis"] for h in holdings)
        total_pnl = holdings_value - total_cost_basis
        roi_pct = ((holdings_value - total_cost_basis) / total_cost_basis) * 100 if total_cost_basis > 0 else 0
        
        # Calculate allocation percentages
        for holding in holdings:
            holding["allocation_pct"] = (
                (holding["current_value"] / holdings_value) * 100
                if holdings_value > 0 else 0
            )
        
        return PortfolioResponse(
            total_value=holdings_value,
            total_invested=total_cost_basis,
            total_pnl=total_pnl,
            roi_pct=roi_pct,
            nmbr_balance=nmbr_balance,
            holdings=holdings
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio: {str(e)}")


@router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Soft ban a user. User can't login but data is preserved.
    Admin only.
    """
    supabase = get_supabase()
    
    # Prevent admin from banning themselves
    if user_id == admin_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")
    
    try:
        # Check if user exists
        user_response = supabase.table("users").select("id, is_admin").eq("id", user_id).single().execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prevent banning other admins
        if user_response.data.get("is_admin", False):
            raise HTTPException(status_code=400, detail="Cannot ban an admin user")
        
        # Set is_banned flag
        supabase.table("users").update({"is_banned": True}).eq("id", user_id).execute()
        
        return {"success": True, "message": "User has been banned"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ban user: {str(e)}")


@router.post("/users/{user_id}/unban")
async def unban_user(
    user_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Remove ban from a user.
    Admin only.
    """
    supabase = get_supabase()
    
    try:
        # Check if user exists
        user_response = supabase.table("users").select("id").eq("id", user_id).single().execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove is_banned flag
        supabase.table("users").update({"is_banned": False}).eq("id", user_id).execute()
        
        return {"success": True, "message": "User has been unbanned"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unban user: {str(e)}")


@router.post("/users/{user_id}/reset-username")
async def reset_username(
    user_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Reset user's username to null.
    Admin only.
    """
    supabase = get_supabase()
    
    try:
        # Check if user exists
        user_response = supabase.table("users").select("id").eq("id", user_id).single().execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Reset username
        supabase.table("users").update({"username": None}).eq("id", user_id).execute()
        
        return {"success": True, "message": "Username has been reset"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset username: {str(e)}")


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Get detailed user information.
    Admin only.
    """
    supabase = get_supabase()
    
    try:
        user_response = supabase.table("users").select("*").eq("id", user_id).single().execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user_response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")


# ============ Global Ledger (Transactions) ============

class AdminTransactionItem(BaseModel):
    id: str
    created_at: datetime
    type: str  # buy/sell
    status: str = "success"  # Placeholder for future failed txs
    
    # Financials
    nmbr_amount: float
    token_amount: float
    price_per_token: float
    fee_amount: float
    fee_amount: float
    slippage_pct: float
    price_impact_pct: float = 0.0
    
    # Initiator (User)
    user_id: str
    user_display_name: str
    user_username: Optional[str] = None
    user_avatar_url: Optional[str] = None
    
    # Asset (Pool/Creator)
    pool_id: str
    token_symbol: str
    creator_name: str


class AdminTransactionListResponse(BaseModel):
    transactions: List[AdminTransactionItem]
    total: int
    limit: int
    offset: int


@router.get("/transactions", response_model=AdminTransactionListResponse)
async def list_transactions(
    admin_user: dict = Depends(require_admin),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    user_id: Optional[str] = None,
    pool_id: Optional[str] = None,
    time_range: Optional[str] = Query("all", enum=["24h", "7d", "30d", "all"]),
    type: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None
):
    """
    Global Ledger: Get paginated list of all transactions.
    Supports filtering by user, pool, search string, time range, type, and amount.
    """
    supabase = get_supabase()
    
    try:
        # Base query with joins
        query = supabase.table("transactions").select(
            "*, users(id, display_name, username, avatar_url), pools(creators(display_name, token_symbol))",
            count="exact"
        )
        
        # Apply Filters
        if user_id:
            query = query.eq("user_id", user_id)
            
        if pool_id:
            query = query.eq("pool_id", pool_id)

        if type:
            query = query.eq("type", type)

        if min_amount is not None:
            query = query.gte("nmbr_amount", min_amount)

        if max_amount is not None:
            query = query.lte("nmbr_amount", max_amount)

        if time_range != "all":
            now = datetime.now(timezone.utc)
            if time_range == "24h":
                start_time = now - timedelta(hours=24)
            elif time_range == "7d":
                start_time = now - timedelta(days=7)
            elif time_range == "30d":
                start_time = now - timedelta(days=30)
            
            query = query.gte("created_at", start_time.isoformat())
            
        # Enhanced Search Logic
        if search:
            # 1. Search Users
            users = supabase.table("users").select("id").or_(f"username.ilike.%{search}%,display_name.ilike.%{search}%").execute()
            user_ids = [u["id"] for u in (users.data or [])]
            
            # 2. Search Creators/Tokens -> Pools
            # We need to find pools where the creator matches
            # 'pool_ids' will come from 'pools' table, so we need to find pools where creator matches
            # Since join filtering is complex, we search creators first then pools
            creators = supabase.table("creators").select("id").or_(f"token_symbol.ilike.%{search}%,display_name.ilike.%{search}%").execute()
            creator_ids = [c["id"] for c in (creators.data or [])]
            
            pool_ids = []
            if creator_ids:
                pools_resp = supabase.table("pools").select("id").in_("creator_id", creator_ids).execute()
                pool_ids = [p["id"] for p in (pools_resp.data or [])]
            
            # 3. Construct OR condition for transactions
            or_conditions = []
            
            # ID match (if valid UUID ish)
            if len(search) > 20: 
                or_conditions.append(f"id.eq.{search}")
            
            if user_ids:
                or_conditions.append(f"user_id.in.({','.join(user_ids)})")
            
            if pool_ids:
                or_conditions.append(f"pool_id.in.({','.join(pool_ids)})")
                
            if or_conditions:
                query = query.or_(",".join(or_conditions))
            else:
                # No matches found for users/creators, and search string is likely not an ID
                # Force no results
                query = query.eq("id", "00000000-0000-0000-0000-000000000000")

        # Order and paginate
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        response = query.execute()
        
        txs = []
        for row in (response.data or []):
            user_data = row.get("users") or {}
            pool_data = row.get("pools") or {}
            creator_data = pool_data.get("creators") or {}
            
            txs.append(AdminTransactionItem(
                id=row["id"],
                created_at=row["created_at"],
                type=row["type"],
                status="success", # Default for now
                
                nmbr_amount=float(row.get("nmbr_amount", 0)),
                token_amount=float(row.get("token_amount", 0)),
                price_per_token=float(row.get("price_per_token", 0)),
                fee_amount=float(row.get("fee_amount", 0)),
                slippage_pct=float(row.get("slippage_pct", 0)),
                price_impact_pct=float(row.get("price_impact_pct", 0)),
                
                user_id=row["user_id"],
                user_display_name=user_data.get("display_name", "Unknown"),
                user_username=user_data.get("username"),
                user_avatar_url=user_data.get("avatar_url"),
                
                pool_id=row["pool_id"],
                token_symbol=creator_data.get("token_symbol", "???"),
                creator_name=creator_data.get("display_name", "Unknown")
            ))
            
        return AdminTransactionListResponse(
            transactions=txs,
            total=response.count or 0,
            limit=limit,
            offset=offset
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transactions: {str(e)}")


@router.get("/transactions/{tx_id}", response_model=AdminTransactionItem)
async def get_transaction_details(
    tx_id: str,
    admin_user: dict = Depends(require_admin)
):
    """
    Global Ledger: Get details of a single transaction.
    """
    supabase = get_supabase()
    
    try:
        # Join users for initiator info
        # Join pools -> creators for asset info
        response = supabase.table("transactions").select(
            "*, users(id, display_name, username, avatar_url), pools(creators(display_name, token_symbol))"
        ).eq("id", tx_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        row = response.data
        user_data = row.get("users") or {}
        pool_data = row.get("pools") or {}
        creator_data = pool_data.get("creators") or {}
        
        return AdminTransactionItem(
            id=row["id"],
            created_at=row["created_at"],
            type=row["type"],
            status="success", # Default for now
            
            nmbr_amount=float(row.get("nmbr_amount", 0)),
            token_amount=float(row.get("token_amount", 0)),
            price_per_token=float(row.get("price_per_token", 0)),
            fee_amount=float(row.get("fee_amount", 0)),
            slippage_pct=float(row.get("slippage_pct", 0)),
            price_impact_pct=float(row.get("price_impact_pct", 0)),
            
            user_id=row["user_id"],
            user_display_name=user_data.get("display_name", "Unknown"),
            user_username=user_data.get("username"),
            user_avatar_url=user_data.get("avatar_url"),
            
            pool_id=row["pool_id"],
            token_symbol=creator_data.get("token_symbol", "???"),
            creator_name=creator_data.get("display_name", "Unknown")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transaction: {str(e)}")
