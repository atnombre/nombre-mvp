"""
YouTube Data API v3 Service for fetching creator statistics.
"""
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import re

from ..config import get_settings

settings = get_settings()

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeService:
    """Service for interacting with YouTube Data API v3."""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.youtube_api_key
        
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to YouTube API."""
        params["key"] = self.api_key
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{YOUTUBE_API_BASE}/{endpoint}",
                params=params,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    
    def extract_channel_id(self, url_or_id: str) -> Optional[str]:
        """
        Extract channel ID from various YouTube URL formats or return as-is if already an ID.
        
        Supported formats:
        - https://www.youtube.com/channel/UCxxxx
        - https://www.youtube.com/@username
        - https://www.youtube.com/c/customname
        - https://www.youtube.com/user/username
        - UCxxxx (direct channel ID)
        """
        url_or_id = url_or_id.strip()
        
        # Already a channel ID (starts with UC and is 24 chars)
        if url_or_id.startswith("UC") and len(url_or_id) == 24:
            return url_or_id
        
        # Channel URL patterns
        patterns = [
            r"youtube\.com/channel/(UC[\w-]{22})",  # /channel/UCxxxx
            r"youtube\.com/@([\w.-]+)",              # /@username (handle)
            r"youtube\.com/c/([\w.-]+)",             # /c/customname
            r"youtube\.com/user/([\w.-]+)",          # /user/username
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url_or_id)
            if match:
                extracted = match.group(1)
                # If it's already a channel ID, return it
                if extracted.startswith("UC"):
                    return extracted
                # Otherwise it's a username/handle, need to resolve it
                return None  # Will need to search by username
        
        return None
    
    async def search_channel(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for YouTube channels by name or handle.
        Returns list of matching channels with basic info.
        """
        data = await self._make_request("search", {
            "part": "snippet",
            "type": "channel",
            "q": query,
            "maxResults": 10
        })
        
        channels = []
        for item in data.get("items", []):
            snippet = item.get("snippet", {})
            channels.append({
                "channel_id": item["id"]["channelId"],
                "username": snippet.get("channelTitle", ""),
                "display_name": snippet.get("channelTitle", ""),
                "description": snippet.get("description", ""),
                "avatar_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
            })
        
        return channels
    
    async def get_channel_by_handle(self, handle: str) -> Optional[Dict[str, Any]]:
        """Get channel info by @ handle."""
        # Remove @ if present
        handle = handle.lstrip("@")
        
        try:
            data = await self._make_request("channels", {
                "part": "snippet,statistics,brandingSettings",
                "forHandle": handle
            })
            
            if data.get("items"):
                return self._parse_channel_data(data["items"][0])
        except Exception:
            pass
        
        return None
    
    async def get_channel_by_id(self, channel_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed channel information by channel ID."""
        try:
            data = await self._make_request("channels", {
                "part": "snippet,statistics,brandingSettings",
                "id": channel_id
            })
            
            if data.get("items"):
                return self._parse_channel_data(data["items"][0])
        except Exception as e:

        
        return None
    
    async def get_channel_stats(self, channel_id: str) -> Optional[Dict[str, Any]]:
        """Get just the statistics for a channel (for updates)."""
        try:
            data = await self._make_request("channels", {
                "part": "statistics",
                "id": channel_id
            })
            
            if data.get("items"):
                stats = data["items"][0].get("statistics", {})
                return {
                    "subscriber_count": int(stats.get("subscriberCount", 0)),
                    "view_count_lifetime": int(stats.get("viewCount", 0)),
                    "video_count": int(stats.get("videoCount", 0)),
                }
        except Exception:
            pass
        
        return None
    
    async def get_recent_videos(self, channel_id: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Get recent videos from a channel."""
        try:
            # First, get the uploads playlist ID
            channel_data = await self._make_request("channels", {
                "part": "contentDetails",
                "id": channel_id
            })
            
            if not channel_data.get("items"):
                return []
            
            uploads_playlist = channel_data["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
            
            # Get videos from uploads playlist
            playlist_data = await self._make_request("playlistItems", {
                "part": "snippet,contentDetails",
                "playlistId": uploads_playlist,
                "maxResults": max_results
            })
            
            video_ids = [item["contentDetails"]["videoId"] for item in playlist_data.get("items", [])]
            
            if not video_ids:
                return []
            
            # Get video statistics
            videos_data = await self._make_request("videos", {
                "part": "statistics,snippet",
                "id": ",".join(video_ids)
            })
            
            videos = []
            for item in videos_data.get("items", []):
                stats = item.get("statistics", {})
                snippet = item.get("snippet", {})
                videos.append({
                    "video_id": item["id"],
                    "title": snippet.get("title", ""),
                    "published_at": snippet.get("publishedAt", ""),
                    "view_count": int(stats.get("viewCount", 0)),
                    "like_count": int(stats.get("likeCount", 0)),
                    "comment_count": int(stats.get("commentCount", 0)),
                })
            
            return videos
        except Exception as e:

            return []
    
    async def calculate_30d_views(self, channel_id: str) -> int:
        """
        Estimate 30-day views by looking at recent videos.
        This is an approximation since YouTube API doesn't provide this directly.
        """
        videos = await self.get_recent_videos(channel_id, max_results=20)
        
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        total_views = 0
        
        for video in videos:
            try:
                published = datetime.fromisoformat(video["published_at"].replace("Z", "+00:00"))
                if published.replace(tzinfo=None) >= thirty_days_ago:
                    total_views += video["view_count"]
            except Exception:
                continue
        
        return total_views
    
    def _parse_channel_data(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Parse YouTube API channel response into our format."""
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})
        branding = item.get("brandingSettings", {}).get("channel", {})
        
        # Get best available thumbnail
        thumbnails = snippet.get("thumbnails", {})
        avatar_url = (
            thumbnails.get("high", {}).get("url") or
            thumbnails.get("medium", {}).get("url") or
            thumbnails.get("default", {}).get("url") or
            ""
        )
        
        # Get banner image if available
        banner_url = item.get("brandingSettings", {}).get("image", {}).get("bannerExternalUrl", "")
        
        return {
            "channel_id": item["id"],
            "username": snippet.get("customUrl", "").lstrip("@") or snippet.get("title", ""),
            "display_name": snippet.get("title", ""),
            "description": snippet.get("description", ""),
            "avatar_url": avatar_url,
            "banner_url": banner_url,
            "subscriber_count": int(stats.get("subscriberCount", 0)),
            "view_count_lifetime": int(stats.get("viewCount", 0)),
            "video_count": int(stats.get("videoCount", 0)),
            "country": snippet.get("country", ""),
            "published_at": snippet.get("publishedAt", ""),
        }
    
    def calculate_cpi_score(
        self,
        subscriber_count: int,
        view_count_30d: int = 0,  # Not used in new formula
        view_count_lifetime: int = 0
    ) -> float:
        """
        Calculate Creator Performance Index (CPI) score.
        
        SIMPLE FORMULA v3 (Deep Liquidity):
        CPI = BASE + (subs / SUB_WEIGHT) + (lifetime_views / VIEW_WEIGHT)
        
        This ensures all pools have enough depth that a 10K NMBR buy
        causes less than 10% price impact.
        
        CPI directly equals Market Cap in NMBR.
        """
        # Constants for deep liquidity
        BASE_LIQUIDITY = 100_000      # Minimum pool depth for all creators
        SUB_WEIGHT = 100              # 1 NMBR per 100 subscribers
        VIEW_WEIGHT = 100_000         # 1 NMBR per 100K lifetime views
        
        # Simple formula
        cpi = (
            BASE_LIQUIDITY +
            (subscriber_count / SUB_WEIGHT) +
            (view_count_lifetime / VIEW_WEIGHT)
        )
        
        return round(cpi, 1)
    
    def calculate_initial_market_cap(self, cpi_score: float) -> float:
        """
        Calculate initial market cap from CPI score.
        With new formula, CPI directly equals Market Cap (in NMBR).
        """
        return cpi_score  # CPI = Market Cap with new formula
    
    def calculate_initial_price(self, cpi_score: float, token_supply: int = 100_000_000) -> float:
        """
        Calculate initial token price from CPI score.
        Price = Market_Cap / Token_Supply
        Now using 100M token supply for deep liquidity.
        """
        market_cap = self.calculate_initial_market_cap(cpi_score)
        return market_cap / token_supply


# Singleton instance
youtube_service = YouTubeService()
