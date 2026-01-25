"""Quick test script to verify Supabase connection and tables."""
from supabase import create_client
import os
from dotenv import load_dotenv

# Load from .env file
load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY')

print(f'URL: {url}')
print(f'Key: {key[:20]}...' if key else 'Key: NOT SET')

try:
    client = create_client(url, key)
    
    print('\n--- Testing Tables ---')
    
    # Check creators table
    creators = client.table('creators').select('id, display_name, token_symbol').limit(5).execute()
    print(f'Creators: {len(creators.data)} found')
    for c in creators.data:
        print(f"  - {c['display_name']} (${c['token_symbol']})")
    
    # Check pools table
    pools = client.table('pools').select('id, current_price, creator_id').limit(5).execute()
    print(f'Pools: {len(pools.data)} found')
    for p in pools.data:
        print(f"  - Price: {p['current_price']}")
    
    # Check users table exists
    users = client.table('users').select('id').limit(1).execute()
    print(f'Users table: exists ({len(users.data)} users)')
    
    # Check price_history
    history = client.table('price_history').select('id').limit(1).execute()
    print(f'Price history table: exists')
    
    print('\n✅ Supabase connection successful!')
    print('\nAll tables exist. Ready to run the app!')
    
except Exception as e:
    print(f'\n❌ Error: {e}')
    print('\nPossible issues:')
    print('1. Migrations not run - go to Supabase SQL Editor and run the migration files')
    print('2. Invalid API keys - check your .env file')
    print('3. Project paused - check Supabase dashboard')
