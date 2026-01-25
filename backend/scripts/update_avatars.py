#!/usr/bin/env python3
"""
Update Avatars Script

This script fetches and updates avatar URLs for ALL creators from YouTube.
Run this periodically to ensure avatar URLs stay fresh (YouTube may rotate CDN URLs).
"""

import sys
import os
import asyncio

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from app.database import get_supabase
from app.services.youtube_service import youtube_service


async def update_all_avatars():
    """Refresh avatar URLs for ALL creators from YouTube."""
    supabase = get_supabase()
    
    # Get all creators
    response = supabase.table("creators").select(
        "id, username, display_name, youtube_channel_id, avatar_url"
    ).execute()
    
    creators = response.data
    updated = 0
    failed = 0
    skipped = 0
    
    print(f"Found {len(creators)} creators to update\n")
    
    for creator in creators:
        channel_id = creator.get("youtube_channel_id")
        
        if not channel_id:
            print(f"⚠️  {creator['display_name']}: No YouTube channel ID, skipping")
            skipped += 1
            continue
            
        print(f"🔍 Fetching avatar for {creator['display_name']}...", end=" ")
        
        try:
            # Fetch channel data from YouTube
            channel_data = await youtube_service.get_channel_by_id(channel_id)
            
            if channel_data and channel_data.get("avatar_url"):
                new_avatar = channel_data["avatar_url"]
                
                # Update in database
                supabase.table("creators").update({
                    "avatar_url": new_avatar
                }).eq("id", creator["id"]).execute()
                
                print(f"✅ Updated")
                updated += 1
            else:
                print(f"❌ No avatar found")
                failed += 1
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            failed += 1
        
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.2)
    
    print(f"\n{'='*50}")
    print(f"✅ Updated: {updated} creators")
    print(f"❌ Failed: {failed} creators")
    print(f"⚠️  Skipped: {skipped} creators (no channel ID)")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    asyncio.run(update_all_avatars())
