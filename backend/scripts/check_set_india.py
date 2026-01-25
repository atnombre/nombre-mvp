from app.database import get_supabase

supabase = get_supabase()

# Check SET India specifically
result = supabase.table("creators").select(
    "id, display_name, subscriber_count, view_count_30d, view_count_lifetime, cpi_score"
).ilike("display_name", "%SET India%").execute()

print("SET India data:")
for c in result.data:
    print(f"  Subs: {c['subscriber_count']:,}")
    print(f"  30d views: {c['view_count_30d']}")
    print(f"  Lifetime: {c['view_count_lifetime']:,}")
    print(f"  CPI: {c['cpi_score']}")
    
    pool = supabase.table("pools").select("*").eq("creator_id", c["id"]).execute()
    if pool.data:
        p = pool.data[0]
        print(f"  Price: {p['current_price']}")
        print(f"  Market cap: {p['market_cap']}")

# Also check some zero-price creators
print("\n\nAll creators with view_count_30d = 0:")
zero_views = supabase.table("creators").select(
    "id, display_name, subscriber_count, view_count_30d, view_count_lifetime, cpi_score"
).eq("view_count_30d", 0).limit(10).execute()

for c in zero_views.data:
    pool = supabase.table("pools").select("current_price").eq("creator_id", c["id"]).execute()
    price = pool.data[0]["current_price"] if pool.data else 0
    print(f"  {c['display_name'][:30]:<30} CPI={c['cpi_score']:>7.1f}  Price={price:.8f}")
