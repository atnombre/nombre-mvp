#!/usr/bin/env python3
"""
MVP Reset Script

This script performs a complete reset of the MVP:
1. Deletes all user holdings
2. Deletes all transactions
3. Deletes all price history (keeps initial prices)
4. Resets all user balances to 0
5. Resets faucet_claimed to False for all users
6. Resets all pool stats (volume, holder_count) but keeps prices

Usage:
    cd backend
    python scripts/reset_mvp.py

WARNING: This is destructive! All trading data will be lost.
"""

import sys
import os
from datetime import datetime, timezone

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from app.database import get_supabase


def confirm_reset():
    """Ask for confirmation before proceeding."""
    print("\n" + "=" * 60)
    print("⚠️  WARNING: MVP RESET")
    print("=" * 60)
    print("\nThis will:")
    print("  • Delete ALL user holdings")
    print("  • Delete ALL transactions")
    print("  • Delete ALL price history")
    print("  • Reset ALL user balances to 0")
    print("  • Reset faucet_claimed to False for all users")
    print("  • Reset pool volumes and holder counts")
    print("\nThis action CANNOT be undone!\n")
    
    response = input("Type 'RESET' to confirm: ")
    return response.strip() == "RESET"


def reset_mvp(skip_confirmation=False):
    """
    Perform a complete MVP reset.
    
    Args:
        skip_confirmation: If True, skip the confirmation prompt (for automation)
    """
    if not skip_confirmation and not confirm_reset():
        print("\n❌ Reset cancelled.")
        return False
    
    print("\n🔄 Starting MVP reset...\n")
    
    supabase = get_supabase()
    
    # Step 1: Delete all user holdings
    print("1️⃣  Deleting user holdings...")
    try:
        # Get count first
        holdings = supabase.table("user_holdings").select("id", count="exact").execute()
        count = holdings.count or 0
        
        if count > 0:
            supabase.table("user_holdings").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"   ✅ Deleted {count} holdings")
    except Exception as e:
        print(f"   ⚠️  Error deleting holdings: {e}")
    
    # Step 2: Delete all transactions
    print("2️⃣  Deleting transactions...")
    try:
        transactions = supabase.table("transactions").select("id", count="exact").execute()
        count = transactions.count or 0
        
        if count > 0:
            supabase.table("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"   ✅ Deleted {count} transactions")
    except Exception as e:
        print(f"   ⚠️  Error deleting transactions: {e}")
    
    # Step 3: Delete all price history
    print("3️⃣  Deleting price history...")
    try:
        history = supabase.table("price_history").select("id", count="exact").execute()
        count = history.count or 0
        
        if count > 0:
            supabase.table("price_history").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"   ✅ Deleted {count} price history records")
    except Exception as e:
        print(f"   ⚠️  Error deleting price history: {e}")
    
    # Step 4: Reset all users
    print("4️⃣  Resetting user accounts...")
    try:
        users = supabase.table("users").select("id", count="exact").execute()
        count = users.count or 0
        
        supabase.table("users").update({
            "nmbr_balance": 0,
            "total_invested": 0,
            "portfolio_value": 0,
            "faucet_claimed": False,
            "device_fingerprint": None  # Allow device to claim again
        }).neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"   ✅ Reset {count} user accounts")
    except Exception as e:
        print(f"   ⚠️  Error resetting users: {e}")
    
    # Step 5: Reset pool stats (keep prices at initial values)
    print("5️⃣  Resetting pool stats...")
    try:
        pools = supabase.table("pools").select("id, initial_price, creator_id").execute()
        count = len(pools.data) if pools.data else 0
        
        for pool in pools.data:
            initial_price = float(pool.get("initial_price", 0))
            # Total token supply is 10M (9M in pool + 1M vesting)
            total_supply = 10_000_000
            token_supply_in_pool = 9_000_000
            
            # Calculate initial market cap and reserve
            market_cap = initial_price * total_supply
            nmbr_reserve = initial_price * token_supply_in_pool  # Reserve = price × pool tokens
            
            supabase.table("pools").update({
                "current_price": initial_price,
                "price_24h_ago": initial_price,
                "price_change_24h": 0,
                "volume_24h": 0,
                "volume_all_time": 0,
                "holder_count": 0,
                "token_supply": token_supply_in_pool,
                "nmbr_reserve": nmbr_reserve,
                "market_cap": market_cap
            }).eq("id", pool["id"]).execute()
        
        print(f"   ✅ Reset {count} pools to initial state")
    except Exception as e:
        print(f"   ⚠️  Error resetting pools: {e}")
    
    # Step 6: Re-seed initial price history
    print("6️⃣  Seeding initial price history...")
    try:
        pools = supabase.table("pools").select("id, initial_price").execute()
        now = datetime.now(timezone.utc)
        
        for pool in pools.data:
            supabase.table("price_history").insert({
                "pool_id": pool["id"],
                "price": float(pool["initial_price"]),
                "volume": 0,
                "timestamp": now.isoformat()
            }).execute()
        
        print(f"   ✅ Created initial price points for {len(pools.data)} pools")
    except Exception as e:
        print(f"   ⚠️  Error seeding price history: {e}")
    
    print("\n" + "=" * 60)
    print("✅ MVP RESET COMPLETE!")
    print("=" * 60)
    print("\nAll users can now:")
    print("  • Claim faucet tokens (10,000 NMBR)")
    print("  • Start trading fresh")
    print("\nPools have been reset to their initial CPI-based prices.")
    print()
    
    return True


if __name__ == "__main__":
    # Check for --force flag to skip confirmation
    force = "--force" in sys.argv or "-f" in sys.argv
    reset_mvp(skip_confirmation=force)
