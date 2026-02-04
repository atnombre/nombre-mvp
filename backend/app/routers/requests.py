"""
Requests Router

Handles user requests for new creators and admin approval workflow.
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

from ..database import get_supabase
from ..services.youtube_service import youtube_service
from .auth import require_admin, require_user

router = APIRouter()

# --- Models ---

class CreateRequest(BaseModel):
    youtube_channel_id: str
    channel_name: str
    username: str

class RequestResponse(BaseModel):
    id: str
    youtube_channel_id: str
    channel_name: str
    username: Optional[str] = None
    requested_by_user_id: Optional[str]
    status: str
    created_at: str

class RequestListResponse(BaseModel):
    requests: List[RequestResponse]
    total: int

# --- Endpoints ---


@router.post("", response_model=dict)
def create_request(
    request: CreateRequest,
    user: dict = Depends(require_user)
):
    """
    Submit a request to list a YouTube channel.
    """
    supabase = get_supabase()
    
    # 1. Check if already listed in Creators
    existing_creator = supabase.table("creators").select("id").eq(
        "youtube_channel_id", request.youtube_channel_id
    ).execute()
    
    if existing_creator.data:
        raise HTTPException(status_code=400, detail="Creator is already listed on the platform.")

    # 2. Check if already requested (Pending or Approved)
    existing_request = supabase.table("creator_requests").select("id, status").eq(
        "youtube_channel_id", request.youtube_channel_id
    ).execute()
    
    if existing_request.data:
        status = existing_request.data[0]["status"]
        if status == "pending":
            raise HTTPException(status_code=400, detail="This creator has already been requested and is pending approval.")
        if status == "approved":
             raise HTTPException(status_code=400, detail="This creator is already approved.")
             
    # 3. Create Request
    new_request = {
        "id": str(uuid.uuid4()),
        "youtube_channel_id": request.youtube_channel_id,
        "username": request.username,
        "channel_name": request.channel_name,
        "requested_by_user_id": user["id"],
        "status": "pending"
    }
    
    try:
        supabase.table("creator_requests").insert(new_request).execute()
        return {"success": True, "message": "Request submitted successfully onto the board."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit request: {str(e)}")


@router.get("", response_model=RequestListResponse)
def list_requests(
    status: str = "pending",
    admin: dict = Depends(require_admin)
):
    """
    List requests (Admin only). Defaults to 'pending'.
    """
    supabase = get_supabase()
    
    response = supabase.table("creator_requests").select("*").eq(
        "status", status
    ).order("created_at", desc=True).execute()
    
    requests = [
        RequestResponse(
            id=item["id"],
            youtube_channel_id=item["youtube_channel_id"],
            channel_name=item["channel_name"],
            username=item.get("username"),
            requested_by_user_id=item.get("requested_by_user_id"),
            status=item["status"],
            created_at=item["created_at"]
        ) for item in response.data
    ]
    
    return {
        "requests": requests,
        "total": len(requests)
    }

@router.post("/{request_id}/approve", response_model=dict)
async def approve_request(
    request_id: str,
    admin: dict = Depends(require_admin)
):
    """
    Approve a request:
    1. Fetch fresh stats from YouTube.
    2. Mint the creator (using shared logic).
    3. Update request status to 'approved'.
    """
    supabase = get_supabase()
    
    # 1. Fetch Request
    req_data = supabase.table("creator_requests").select("*").eq("id", request_id).single().execute()
    if not req_data.data:
        raise HTTPException(status_code=404, detail="Request not found")
        
    request_item = req_data.data
    channel_id = request_item["youtube_channel_id"]
    
    # 2. Check if already exists in creators (double check)
    exists = supabase.table("creators").select("id").eq("youtube_channel_id", channel_id).execute()
    if exists.data:
        # Just update status if already mint 
        supabase.table("creator_requests").update({"status": "approved"}).eq("id", request_id).execute()
        return {"success": True, "message": "Creator already existed, request marked approved."}

    # 3. Minting Logic (Importing from creators service or duplicating for now to avoid circular deps if not ready)
    # Ideally should call a service function. 
    # For now, I'll inline the minting logic from creators.py but keep it clean, 
    # verifying I can import `youtube_service`.
    
    try:
        # Fetch channel data
        channel_data = await youtube_service.get_channel_by_id(channel_id)
        if not channel_data:
            raise HTTPException(status_code=404, detail="YouTube channel not found")
            
        # Calculate 30d views
        try:
            view_count_30d = await youtube_service.calculate_30d_views(channel_id)
        except:
            view_count_30d = 0
            
        # Calc CPI
        cpi_score = youtube_service.calculate_cpi_score(
            channel_data["subscriber_count"],
            view_count_30d,
            channel_data["view_count_lifetime"]
        )
        
        # Pricing
        token_supply = 100_000_000
        initial_market_cap = youtube_service.calculate_initial_market_cap(cpi_score)
        initial_price = youtube_service.calculate_initial_price(cpi_score, token_supply)
        
        # Clean Symbol
        username = channel_data["username"].upper().replace(" ", "")[:6]
        token_symbol = username
        
        creator_id = str(uuid.uuid4())
        
        creator_data = {
            "id": creator_id,
            "youtube_channel_id": channel_id,
            "username": channel_data["username"],
            "display_name": channel_data["display_name"],
            "avatar_url": channel_data["avatar_url"],
            "banner_url": channel_data.get("banner_url", ""),
            "subscriber_count": channel_data["subscriber_count"],
            "view_count_30d": view_count_30d,
            "view_count_lifetime": channel_data["view_count_lifetime"],
            "video_count": channel_data["video_count"],
            "cpi_score": cpi_score,
            "token_symbol": token_symbol,
            "is_verified": channel_data["subscriber_count"] >= 100000,
        }
        
        # Insert Creator
        supabase.table("creators").insert(creator_data).execute()
        
        # Insert Pool
        pool_data = {
            "id": str(uuid.uuid4()),
            "creator_id": creator_id,
            "token_supply": token_supply,
            "nmbr_reserve": initial_market_cap,
            "initial_price": initial_price,
            "current_price": initial_price,
            "price_change_24h": 0,
            "volume_24h": 0,
            "market_cap": initial_market_cap,
            "holder_count": 0,
        }
        supabase.table("pools").insert(pool_data).execute()
        
        # 4. Update Request Status
        supabase.table("creator_requests").update({
            "status": "approved",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", request_id).execute()
        
        return {"success": True, "message": f"Approved and minted {token_symbol}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Minting failed: {str(e)}")

@router.post("/{request_id}/reject", response_model=dict)
def reject_request(
    request_id: str,
    admin: dict = Depends(require_admin)
):
    """
    Reject a request.
    """
    supabase = get_supabase()
    
    try:
        supabase.table("creator_requests").update({
            "status": "rejected",
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", request_id).execute()
        
        return {"success": True, "message": "Request rejected."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rejection failed: {str(e)}")
