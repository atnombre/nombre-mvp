"""
Auth Router

Handles authentication callbacks from Supabase.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional

from ..database import get_supabase
from ..models.schemas import UserResponse
from ..services.faucet_service import claim_faucet

router = APIRouter()


class AuthCallbackRequest(BaseModel):
    access_token: str
    provider: str = "google"
    device_fingerprint: Optional[str] = None


async def get_current_user(authorization: str = Header(...)) -> dict:
    """
    Validate JWT and get current user from Supabase.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase()
    
    try:
        # Verify token and get user
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        auth_user = user_response.user
        
        # Get user from our users table
        db_user = supabase.table("users").select("*").eq(
            "auth_id", auth_user.id
        ).single().execute()
        
        if not db_user.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return db_user.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that requires the user to have admin privileges.
    Admin status is stored in database and verified server-side.
    NEVER trust client-side admin claims.
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=403, 
            detail="Admin access required. This action is restricted."
        )
    return current_user


@router.post("/callback")
async def auth_callback(request: AuthCallbackRequest):
    """
    Handle OAuth callback - create or update user profile.
    
    This is called after successful Google OAuth login.
    """
    supabase = get_supabase()
    
    try:
        # Verify token and get user info
        user_response = supabase.auth.get_user(request.access_token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid access token")
        
        auth_user = user_response.user
        user_metadata = auth_user.user_metadata or {}
        
        # Check if user exists
        existing = supabase.table("users").select("*").eq(
            "auth_id", auth_user.id
        ).execute()
        
        is_new_user = len(existing.data) == 0
        
        if is_new_user:
            # Create new user
            user_data = {
                "auth_id": auth_user.id,
                "email": auth_user.email,
                "display_name": user_metadata.get("full_name", user_metadata.get("name", "")),
                "avatar_url": user_metadata.get("avatar_url", user_metadata.get("picture", "")),
                "nmbr_balance": 0.0,
                "portfolio_value": 0.0,
                "total_invested": 0.0,
                "faucet_claimed": False,
            }
            
            result = supabase.table("users").insert(user_data).execute()
            user = result.data[0]
            
            # Auto-claim faucet for new users if fingerprint provided
            if request.device_fingerprint:
                success, new_balance, _ = await claim_faucet(user["id"], request.device_fingerprint)
                if success:
                    user["nmbr_balance"] = new_balance
                    user["faucet_claimed"] = True
        else:
            # Update existing user (refresh metadata)
            user = existing.data[0]
            supabase.table("users").update({
                "display_name": user_metadata.get("full_name", user.get("display_name", "")),
                "avatar_url": user_metadata.get("avatar_url", user.get("avatar_url", "")),
            }).eq("id", user["id"]).execute()
        
        return {
            "user": user,
            "is_new_user": is_new_user
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auth callback failed: {str(e)}")
