#!/usr/bin/env python3
"""
Full System Reset Script

This script:
1. Clears all user holdings
2. Clears all transactions
3. Clears all price history
4. Resets all user balances to 0 (faucet not claimed)
5. Recalculates all pools with new CPI formula (100M tokens, deep liquidity)

Run with: python scripts/full_reset.py
"""

import asyncio
import sys
sys.path.insert(0, '.')

from app.database import get_supabase
from app.services.youtube_service import youtube_service


async def main():
    supabase = get_supabase()
    
    print("=" * 60)
    print("FULL SYSTEM RESET")
    print("=" * 60)
    print()
    
    # Confirm
    confirm = input("This will DELETE all holdings, transactions, and reset all users. Type 'RESET' to confirm: ")
    if confirm != "RESET":
        print("Aborted.")
        return
    
    print()
    
    # Step 1: Clear holdings
    print("[1/5] Clearing all user holdings...")
    supabase.table("user_holdings").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("  ✓ Holdings cleared")
    
    # Step 2: Clear transactions
    print("[2/5] Clearing all transactions...")
    supabase.table("transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("  ✓ Transactions cleared")
    
    # Step 3: Clear price history
    print("[3/5] Clearing price history...")
    supabase.table("price_history").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("  ✓ Price history cleared")
    
    # Step 4: Reset user balances
    print("[4/5] Resetting all user balances...")
    supabase.table("users").update({
        "nmbr_balance": 0,
        "faucet_claimed": False,
        "total_invested": 0,
        "portfolio_value": 0,
        "device_fingerprint": None
    }).neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("  ✓ User balances reset (can claim 10K again)")
    
    # Step 5: Recalculate all pools with new CPI formula
    print("[5/5] Recalculating all pools with new CPI formula...")
    
    # Get all creators
    creators_response = supabase.table("creators").select("*").execute()
    creators = creators_response.data
    
    TOKEN_SUPPLY = 100_000_000  # New 100M supply
    
    for creator in creators:
        # Calculate new CPI using new formula
        new_cpi = youtube_service.calculate_cpi_score(
            creator["subscriber_count"],
            0,  # 30-day views not used in new formula
            creator["view_count_lifetime"]
        )
        
        # CPI now directly equals market cap
        new_market_cap = youtube_service.calculate_initial_market_cap(new_cpi)
        new_price = new_market_cap / TOKEN_SUPPLY
        
        # Update creator CPI
        supabase.table("creators").update({
            "cpi_score": new_cpi
        }).eq("id", creator["id"]).execute()
        
        # Update pool
        supabase.table("pools").update({
            "token_supply": TOKEN_SUPPLY,
            "nmbr_reserve": new_market_cap,
            "initial_price": new_price,
            "current_price": new_price,
            "market_cap": new_market_cap,
            "volume_24h": 0,
            "holder_count": 0,
            "price_change_24h": 0
        }).eq("creator_id", creator["id"]).execute()
        
        print(f"  ✓ {creator['display_name']}: CPI={new_cpi:,.0f}, Price={new_price:.8f}")
    
    print()
    print("=" * 60)
    print("RESET COMPLETE!")
    print("=" * 60)
    print(f"  • {len(creators)} pools recalculated")
    print("  • All users can claim 10K NMBR")
    print("  • All holdings/transactions cleared")


if __name__ == "__main__":
    asyncio.run(main())
