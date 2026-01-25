"""
Creators Router

Handles creator listing, details, price history, and YouTube integration.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid

from ..database import get_supabase
from ..models.schemas import (
    CreatorListItem, CreatorWithPool, PriceHistoryResponse, PricePoint
)
from ..services.youtube_service import youtube_service
from .auth import require_admin

router = APIRouter()


class YouTubeSearchResult(BaseModel):
    channel_id: str
    username: str
    display_name: str
    description: str
    avatar_url: str


class AddCreatorRequest(BaseModel):
    channel_id: str


class AddCreatorResponse(BaseModel):
    success: bool
    creator_id: str
    message: str

router = APIRouter()


@router.get("", response_model=dict)
async def list_creators(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    sort_by: str = Query(default="volume_24h", regex="^(price_change_24h|volume_24h|market_cap|cpi_score)$"),
    order: str = Query(default="desc", regex="^(asc|desc)$"),
    search: Optional[str] = None
):
    """
    List all creators with pagination and sorting.
    """
    supabase = get_supabase()
    
    # Build query
    query = supabase.table("creators").select(
        "id, username, display_name, avatar_url, subscriber_count, token_symbol, "
        "pools(current_price, price_change_24h, market_cap, volume_24h)",
        count="exact"
    )
    
    # Apply search filter
    if search:
        query = query.or_(f"display_name.ilike.%{search}%,username.ilike.%{search}%,token_symbol.ilike.%{search}%")
    
    # Execute query
    response = query.range(offset, offset + limit - 1).execute()
    
    # Transform results
    creators = []
    for row in response.data:
        pool = row.get("pools") or {}
        if isinstance(pool, list):
            pool = pool[0] if pool else {}
        
        creators.append(CreatorListItem(
            id=row["id"],
            username=row["username"],
            display_name=row["display_name"],
            avatar_url=row.get("avatar_url"),
            subscriber_count=row.get("subscriber_count", 0),
            token_symbol=row["token_symbol"],
            current_price=float(pool.get("current_price", 0)),
            price_change_24h=float(pool.get("price_change_24h", 0)),
            market_cap=float(pool.get("market_cap", 0)),
            volume_24h=float(pool.get("volume_24h", 0))
        ))
    
    # Sort by pool fields
    sort_key = {
        "price_change_24h": lambda x: x.price_change_24h,
        "volume_24h": lambda x: x.volume_24h,
        "market_cap": lambda x: x.market_cap,
        "cpi_score": lambda x: x.subscriber_count  # Fallback to subscribers
    }[sort_by]
    
    creators.sort(key=sort_key, reverse=(order == "desc"))
    
    return {
        "creators": creators,
        "total": response.count or len(creators),
        "limit": limit,
        "offset": offset
    }


@router.get("/{creator_id}", response_model=CreatorWithPool)
async def get_creator(creator_id: str):
    """
    Get detailed creator profile with pool info.
    """
    supabase = get_supabase()
    
    response = supabase.table("creators").select(
        "*, pools(*)"
    ).eq("id", creator_id).single().execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    creator = response.data
    pool_data = creator.get("pools")
    if isinstance(pool_data, list):
        pool_data = pool_data[0] if pool_data else None
    
    return {
        **creator,
        "pool": pool_data
    }


@router.get("/{creator_id}/price-history", response_model=PriceHistoryResponse)
async def get_price_history(
    creator_id: str,
    period: str = Query(default="24h", regex="^(1h|24h|7d|30d|all)$")
):
    """
    Get historical price data for charts.
    """
    supabase = get_supabase()
    
    # Calculate time range
    now = datetime.utcnow()
    time_ranges = {
        "1h": timedelta(hours=1),
        "24h": timedelta(hours=24),
        "7d": timedelta(days=7),
        "30d": timedelta(days=30),
        "all": timedelta(days=365 * 10)  # Effectively all
    }
    
    start_time = now - time_ranges[period]
    
    # Get pool ID for creator
    pool_response = supabase.table("pools").select("id").eq(
        "creator_id", creator_id
    ).single().execute()
    
    if not pool_response.data:
        raise HTTPException(status_code=404, detail="Pool not found for creator")
    
    pool_id = pool_response.data["id"]
    
    # Get price history
    history_response = supabase.table("price_history").select(
        "timestamp, price, volume"
    ).eq("pool_id", pool_id).gte(
        "timestamp", start_time.isoformat()
    ).order("timestamp", desc=False).execute()
    
    prices = [
        PricePoint(
            timestamp=row["timestamp"],
            price=float(row["price"]),
            volume=float(row.get("volume", 0))
        )
        for row in history_response.data
    ]
    
    return PriceHistoryResponse(prices=prices)


@router.get("/youtube/search", response_model=List[YouTubeSearchResult])
async def search_youtube_channels(
    q: str = Query(..., min_length=1, description="Search query (channel name or @handle)")
):
    """
    Search YouTube for channels by name or handle.
    Returns up to 10 matching channels.
    """
    try:
        # Check if it's a handle search
        if q.startswith("@"):
            channel = await youtube_service.get_channel_by_handle(q)
            if channel:
                return [YouTubeSearchResult(
                    channel_id=channel["channel_id"],
                    username=channel["username"],
                    display_name=channel["display_name"],
                    description=channel.get("description", "")[:200],
                    avatar_url=channel["avatar_url"]
                )]
            return []
        
        # Regular search
        channels = await youtube_service.search_channel(q)
        return [
            YouTubeSearchResult(
                channel_id=c["channel_id"],
                username=c["username"],
                display_name=c["display_name"],
                description=c.get("description", "")[:200],
                avatar_url=c["avatar_url"]
            )
            for c in channels
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube API error: {str(e)}")


@router.post("/youtube/add", response_model=AddCreatorResponse)
async def add_creator_from_youtube(
    request: AddCreatorRequest,
    admin_user: dict = Depends(require_admin)  # Requires admin access
):
    """
    Add a new creator from YouTube channel ID.
    Fetches channel data and creates creator + pool records.
    
    ADMIN ONLY - requires is_admin=true in users table.
    """
    supabase = get_supabase()
    
    # Check if creator already exists
    existing = supabase.table("creators").select("id").eq(
        "youtube_channel_id", request.channel_id
    ).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=400, 
            detail="Creator already exists"
        )
    
    # Fetch channel data from YouTube
    channel_data = await youtube_service.get_channel_by_id(request.channel_id)
    
    if not channel_data:
        raise HTTPException(status_code=404, detail="YouTube channel not found")
    
    # Calculate 30-day views (this costs extra API quota)
    try:
        view_count_30d = await youtube_service.calculate_30d_views(request.channel_id)
    except Exception:
        view_count_30d = 0
    
    # Calculate CPI score using new formula
    cpi_score = youtube_service.calculate_cpi_score(
        channel_data["subscriber_count"],
        view_count_30d,
        channel_data["view_count_lifetime"]
    )
    
    # Calculate initial price based on CPI
    # Formula: Market_Cap = CPI × $100, Price = Market_Cap / Supply
    token_supply = 9_000_000
    initial_market_cap = youtube_service.calculate_initial_market_cap(cpi_score)
    initial_price = youtube_service.calculate_initial_price(cpi_score, token_supply)
    
    # Generate token symbol from username (NO $ prefix - stored clean)
    username = channel_data["username"].upper().replace(" ", "")[:6]
    token_symbol = username  # Clean symbol without $
    
    # Create creator record
    creator_id = str(uuid.uuid4())
    
    creator_data = {
        "id": creator_id,
        "youtube_channel_id": request.channel_id,
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
        "is_verified": channel_data["subscriber_count"] >= 100000,  # Verified if 100k+ subs
    }
    
    try:
        # Insert creator
        supabase.table("creators").insert(creator_data).execute()
        
        # Create pool with CPI-based initial pricing
        pool_data = {
            "id": str(uuid.uuid4()),
            "creator_id": creator_id,
            "token_supply": token_supply,
            "nmbr_reserve": initial_market_cap,  # Reserve = Market Cap
            "initial_price": initial_price,
            "current_price": initial_price,
            "price_change_24h": 0,
            "volume_24h": 0,
            "market_cap": initial_market_cap,
            "holder_count": 0,
        }
        
        supabase.table("pools").insert(pool_data).execute()
        
        return AddCreatorResponse(
            success=True,
            creator_id=creator_id,
            message=f"Successfully added {channel_data['display_name']} with token {token_symbol}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create creator: {str(e)}")


@router.post("/{creator_id}/refresh-stats")
async def refresh_creator_stats(creator_id: str):
    """
    Refresh a creator's stats from YouTube.
    Updates subscriber count, view counts, and CPI score.
    """
    supabase = get_supabase()
    
    # Get creator's YouTube channel ID
    creator = supabase.table("creators").select(
        "youtube_channel_id, subscriber_count, view_count_30d, video_count"
    ).eq("id", creator_id).single().execute()
    
    if not creator.data:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    channel_id = creator.data.get("youtube_channel_id")
    if not channel_id:
        raise HTTPException(status_code=400, detail="Creator has no linked YouTube channel")
    
    # Fetch fresh stats
    stats = await youtube_service.get_channel_stats(channel_id)
    
    if not stats:
        raise HTTPException(status_code=500, detail="Failed to fetch YouTube stats")
    
    # Calculate 30-day views
    try:
        view_count_30d = await youtube_service.calculate_30d_views(channel_id)
    except Exception:
        view_count_30d = creator.data.get("view_count_30d", 0)
    
    # Recalculate CPI with new formula
    cpi_score = youtube_service.calculate_cpi_score(
        stats["subscriber_count"],
        view_count_30d,
        stats["view_count_lifetime"]
    )
    
    # Update creator
    supabase.table("creators").update({
        "subscriber_count": stats["subscriber_count"],
        "view_count_30d": view_count_30d,
        "view_count_lifetime": stats["view_count_lifetime"],
        "video_count": stats["video_count"],
        "cpi_score": cpi_score,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", creator_id).execute()
    
    return {
        "success": True,
        "subscriber_count": stats["subscriber_count"],
        "view_count_30d": view_count_30d,
        "cpi_score": cpi_score
    }

