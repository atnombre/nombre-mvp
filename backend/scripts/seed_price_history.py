"""
Seed Price History Script

Generates initial price history for all creators to make charts work.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta, timezone
import random
from app.database import get_supabase

def seed_price_history():
    """Seed price history for all pools that don't have any."""
    supabase = get_supabase()
    
    # Get all pools with their initial prices
    pools_response = supabase.table("pools").select(
        "id, creator_id, current_price, initial_price, created_at, creators(display_name)"
    ).execute()
    
    if not pools_response.data:
        print("No pools found")
        return
    
    print(f"Found {len(pools_response.data)} pools")
    
    for pool in pools_response.data:
        pool_id = pool["id"]
        creator_name = pool.get("creators", {}).get("display_name", "Unknown")
        current_price = float(pool["current_price"] or 0)
        initial_price = float(pool.get("initial_price") or current_price)
        created_at = pool.get("created_at")
        
        # Check if pool already has price history
        existing = supabase.table("price_history").select("id").eq("pool_id", pool_id).limit(1).execute()
        
        if existing.data:
            print(f"  ⏭️  {creator_name}: Already has price history, skipping")
            continue
        
        # Generate price history
        print(f"  📈 {creator_name}: Generating price history...")
        
        now = datetime.now(timezone.utc)
        
        # Parse created_at or use a default
        try:
            if created_at:
                start_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            else:
                start_time = now - timedelta(days=7)
        except:
            start_time = now - timedelta(days=7)
        
        # Ensure start_time is timezone-aware
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        
        # Generate hourly data points from creation to now
        time_cursor = start_time
        price_cursor = initial_price
        price_history = []
        
        # Calculate hourly price change to reach current price
        hours_elapsed = max(1, int((now - start_time).total_seconds() / 3600))
        price_change_per_hour = (current_price - initial_price) / hours_elapsed if hours_elapsed > 0 else 0
        
        while time_cursor < now:
            # Add some randomness but trend toward current price
            noise = random.uniform(-0.002, 0.002) * price_cursor
            price_cursor = max(0.000001, price_cursor + price_change_per_hour + noise)
            
            # Generate some random volume
            volume = random.uniform(10, 500)
            
            price_history.append({
                "pool_id": pool_id,
                "price": round(price_cursor, 8),
                "volume": round(volume, 2),
                "timestamp": time_cursor.isoformat()
            })
            
            # Move forward 1-4 hours randomly
            time_cursor += timedelta(hours=random.randint(1, 4))
        
        # Make sure last point is at current price
        if price_history:
            price_history[-1]["price"] = current_price
            price_history[-1]["timestamp"] = now.isoformat()
        
        # Insert price history
        if price_history:
            # Insert in batches of 50
            for i in range(0, len(price_history), 50):
                batch = price_history[i:i+50]
                supabase.table("price_history").insert(batch).execute()
            
            print(f"     ✅ Added {len(price_history)} price points")
        else:
            print(f"     ⚠️ No price points generated")
    
    print("\n✅ Price history seeding complete!")

if __name__ == "__main__":
    seed_price_history()
