
import asyncio
import os
import sys

# Add backend directory to python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.database import get_supabase

def check_dhruv():
    supabase = get_supabase()
    
    print("--- Searching in CREATORS table ---")
    creators = supabase.table("creators").select("*").ilike("display_name", "%Dhruv Rathee%").execute()
    for c in creators.data:
        print(f"Found in CREATORS: ID={c['id']}, Name={c['display_name']}, ChannelID={c['youtube_channel_id']}")

    print("\n--- Searching in CREATOR_REQUESTS table ---")
    requests = supabase.table("creator_requests").select("*").ilike("channel_name", "%Dhruv Rathee%").execute()
    for r in requests.data:
        print(f"Found in REQUESTS: ID={r['id']}, Name={r['channel_name']}, Status={r['status']}, ChannelID={r['youtube_channel_id']}")

if __name__ == "__main__":
    check_dhruv()
