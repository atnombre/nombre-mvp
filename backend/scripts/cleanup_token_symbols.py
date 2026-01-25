"""
Script to remove $ prefix from token symbols in the database.
Run this once to clean up existing data.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/cleanup_token_symbols.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_supabase


def cleanup_token_symbols():
    """Remove $ prefix from all token symbols."""
    supabase = get_supabase()
    
    # Get all creators with $ in token_symbol
    result = supabase.table("creators").select("id, token_symbol").execute()
    
    if not result.data:
        print("No creators found")
        return
    
    updated_count = 0
    for creator in result.data:
        token_symbol = creator.get("token_symbol", "")
        if token_symbol.startswith("$"):
            new_symbol = token_symbol[1:]  # Remove $ prefix
            supabase.table("creators").update({
                "token_symbol": new_symbol
            }).eq("id", creator["id"]).execute()
            print(f"  ✅ Updated: {token_symbol} → {new_symbol}")
            updated_count += 1
    
    print(f"\n✅ Updated {updated_count} token symbols")


if __name__ == "__main__":
    print("🧹 Cleaning up token symbols (removing $ prefix)...\n")
    cleanup_token_symbols()
    print("\n✅ Done!")
