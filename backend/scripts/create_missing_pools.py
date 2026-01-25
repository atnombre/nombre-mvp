"""
Create pools for creators that are missing them.
Pool price = CPI / 90000 (matches the pricing formula)
"""
from app.database import get_supabase

supabase = get_supabase()

# Get all creator IDs
creators_result = supabase.table("creators").select("id, display_name, cpi_score, token_symbol").execute()
creator_map = {c["id"]: c for c in creators_result.data}

# Get all creator IDs that have pools
pools_result = supabase.table("pools").select("creator_id").execute()
pool_creator_ids = {p["creator_id"] for p in pools_result.data}

# Find creators missing pools
missing_creators = [c for c in creators_result.data if c["id"] not in pool_creator_ids]

print(f"Found {len(missing_creators)} creators missing pools:\n")

for creator in missing_creators:
    cpi = creator["cpi_score"] or 500  # Default if somehow null
    
    # Calculate price: CPI / 90000 (standard formula)
    price = cpi / 90000
    
    # Initial supply and market cap
    initial_supply = 1_000_000
    market_cap = price * initial_supply
    
    pool_data = {
        "creator_id": creator["id"],
        "token_supply": initial_supply,
        "nmbr_reserve": 10000,  # Default reserve
        "initial_price": price,
        "current_price": price,
        "price_24h_ago": price,
        "price_change_24h": 0,
        "volume_24h": 0,
        "volume_all_time": 0,
        "market_cap": market_cap,
        "holder_count": 0,
    }
    
    result = supabase.table("pools").insert(pool_data).execute()
    
    if result.data:
        print(f"✓ Created pool for {creator['display_name']:<30} CPI={cpi:>7.1f}  Price={price:.8f}")
    else:
        print(f"✗ FAILED for {creator['display_name']}")

print(f"\nDone! Created {len(missing_creators)} pools.")
