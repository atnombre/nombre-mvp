"""
Script to recalculate CPI scores and update prices for all creators.
This uses the improved CPI v2 formula that handles missing 30-day view data.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/recalculate_cpi.py
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.youtube_service import YouTubeService
from app.database import get_supabase


async def recalculate_all_creators():
    """Recalculate CPI and prices for all creators."""
    supabase = get_supabase()
    youtube = YouTubeService()
    
    # Get all creators with their pool data
    result = supabase.table("creators").select(
        "id, display_name, subscriber_count, view_count_30d, view_count_lifetime, cpi_score"
    ).execute()
    
    if not result.data:
        print("No creators found")
        return
    
    print(f"Found {len(result.data)} creators to update\n")
    
    updated_count = 0
    for creator in result.data:
        old_cpi = creator.get("cpi_score", 0)
        
        # Calculate new CPI with improved formula
        new_cpi = youtube.calculate_cpi_score(
            subscriber_count=creator.get("subscriber_count", 0),
            view_count_30d=creator.get("view_count_30d", 0),
            view_count_lifetime=creator.get("view_count_lifetime", 0)
        )
        
        # Calculate new market cap and price
        new_market_cap = youtube.calculate_initial_market_cap(new_cpi)
        token_supply = 9_000_000
        new_price = new_market_cap / token_supply
        
        # Update creator CPI
        supabase.table("creators").update({
            "cpi_score": new_cpi
        }).eq("id", creator["id"]).execute()
        
        # Update pool with new price and market cap
        supabase.table("pools").update({
            "current_price": new_price,
            "initial_price": new_price,
            "market_cap": new_market_cap,
            "nmbr_reserve": new_market_cap
        }).eq("creator_id", creator["id"]).execute()
        
        change = new_cpi - old_cpi
        change_str = f"+{change:.1f}" if change >= 0 else f"{change:.1f}"
        
        print(f"  {creator['display_name'][:30]:<30} CPI: {old_cpi:>6.1f} → {new_cpi:>6.1f} ({change_str}) | Price: {new_price:.6f}")
        updated_count += 1
    
    print(f"\n✅ Updated {updated_count} creators with new CPI scores")


if __name__ == "__main__":
    print("🔄 Recalculating CPI scores with improved formula v2...\n")
    asyncio.run(recalculate_all_creators())
    print("\n✅ Done!")
