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
            print(f"Error fetching channel {channel_id}: {e}")
        
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
            print(f"Error fetching videos for {channel_id}: {e}")
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
        view_count_30d: int,
        view_count_lifetime: int = 0
    ) -> float:
        """
        Calculate Creator Performance Index (CPI) score.
        
        IMPROVED FORMULA v2:
        - Uses logarithmic scaling for all components for fairness
        - Has a minimum floor based on subscribers (channels always have value)
        - More balanced weights when 30-day views unavailable
        
        Components:
        - Subscribers: Base value floor (logarithmic)
        - 30-day views: Engagement/momentum indicator
        - Lifetime views: Legacy/credibility
        - Engagement ratio: Views per subscriber (efficiency)
        
        Output is used for: Initial_Market_Cap = CPI × $100
        """
        import math
        
        if subscriber_count == 0:
            return 10.0  # Minimum CPI for any channel
        
        # === COMPONENT 1: Subscriber Base (40% weight when views available, 70% as fallback) ===
        # Logarithmic scale: ln(1K)=6.9, ln(10K)=9.2, ln(100K)=11.5, ln(1M)=13.8, ln(10M)=16.1, ln(100M)=18.4
        # Scale to 0-100 range: divide by 20 (max ~18.4 for 100M subs) then multiply by 100
        subscriber_score = (math.log(max(subscriber_count, 1)) / 20) * 100
        
        # === COMPONENT 2: 30-day Views Momentum ===
        # If we have 30-day views, use them; otherwise estimate from lifetime
        if view_count_30d > 0:
            # Logarithmic scale for views too
            # ln(1M)=13.8, ln(10M)=16.1, ln(100M)=18.4, ln(1B)=20.7
            views_30d_score = (math.log(max(view_count_30d, 1)) / 25) * 100
            has_recent_data = True
        else:
            # Fallback: estimate 30-day views as ~2% of lifetime views (rough approximation)
            estimated_30d = max(view_count_lifetime * 0.02, 1)
            views_30d_score = (math.log(estimated_30d) / 25) * 100 * 0.5  # Discount by 50% for estimation
            has_recent_data = False
        
        # === COMPONENT 3: Lifetime Legacy ===
        # ln(1B)=20.7, ln(10B)=23, ln(50B)=24.6
        lifetime_score = (math.log(max(view_count_lifetime, 1)) / 25) * 100 if view_count_lifetime > 0 else 0
        
        # === COMPONENT 4: Engagement Ratio (views per subscriber) ===
        # High ratio = engaged audience, low ratio = inactive subscribers
        if view_count_lifetime > 0 and subscriber_count > 0:
            views_per_sub = view_count_lifetime / subscriber_count
            # Expected range: 100-5000 views per sub
            # ln(100)=4.6, ln(1000)=6.9, ln(5000)=8.5
            engagement_score = min((math.log(max(views_per_sub, 1)) / 10) * 100, 100)
        else:
            engagement_score = 50  # Neutral default
        
        # === FINAL CPI CALCULATION ===
        if has_recent_data:
            # Full formula with recent data
            cpi = (
                0.35 * subscriber_score +    # 35% - Base stability
                0.40 * views_30d_score +     # 40% - Recent momentum (key driver)
                0.15 * lifetime_score +       # 15% - Legacy
                0.10 * engagement_score       # 10% - Efficiency bonus
            )
        else:
            # Fallback formula when 30-day data unavailable
            cpi = (
                0.55 * subscriber_score +    # 55% - Rely more on subs
                0.20 * views_30d_score +     # 20% - Estimated views (discounted)
                0.15 * lifetime_score +       # 15% - Legacy
                0.10 * engagement_score       # 10% - Efficiency bonus
            )
        
        # Scale to target range: ~100-1000 for typical creators
        # Raw CPI is typically 20-80, multiply by 12 to get 240-960 range
        cpi_scaled = cpi * 12
        
        # Minimum floor of 50 CPI (ensures $5,000 minimum market cap)
        return round(max(cpi_scaled, 50.0), 1)
    
    def calculate_initial_market_cap(self, cpi_score: float) -> float:
        """
        Calculate initial market cap from CPI score.
        Formula: Initial_Market_Cap = CPI × $100
        """
        return cpi_score * 100
    
    def calculate_initial_price(self, cpi_score: float, token_supply: int = 9_000_000) -> float:
        """
        Calculate initial token price from CPI score.
        Price = Market_Cap / Token_Supply
        """
        market_cap = self.calculate_initial_market_cap(cpi_score)
        return market_cap / token_supply


# Singleton instance
youtube_service = YouTubeService()
