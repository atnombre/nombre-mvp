# Utility Scripts

Backend scripts for maintenance, seeding, and administration.

**Location**: `backend/scripts/`

---

## Running Scripts

All scripts should be run from the `backend/` directory with the virtual environment activated:

```bash
cd backend
source venv/bin/activate
python scripts/<script_name>.py
```

---

## Available Scripts

### reset_mvp.py

**Purpose**: Completely reset the MVP to a fresh state.

**What it does**:
1. Deletes all user holdings
2. Deletes all transactions
3. Deletes all price history
4. Resets user balances to 0
5. Sets `faucet_claimed` to `false` for all users
6. Resets all pools to initial state (price, reserves, volume)
7. Creates initial price history point for each pool

**Usage**:
```bash
# Interactive mode (asks for confirmation)
python scripts/reset_mvp.py

# Force mode (no confirmation)
python scripts/reset_mvp.py --force
```

**When to use**:
- Starting a new competition round
- Clearing test data
- Resetting after major bug fixes

---

### add_top_youtubers.py

**Purpose**: Seed the database with popular YouTubers.

**What it does**:
1. Reads a list of top YouTube channel IDs
2. Fetches channel data from YouTube API
3. Calculates CPI score for each
4. Creates creator and pool records

**Usage**:
```bash
python scripts/add_top_youtubers.py
```

**Requirements**:
- `YOUTUBE_API_KEY` must be set in `backend/.env`

**Notes**:
- Skips channels that already exist
- Costs ~1-2 YouTube API quota units per channel
- May take several minutes for large lists

---

### seed_price_history.py

**Purpose**: Generate initial price history data for charts.

**What it does**:
1. For each pool without price history
2. Creates an initial price point at pool creation time
3. Optionally generates simulated historical data

**Usage**:
```bash
python scripts/seed_price_history.py
```

**When to use**:
- After adding new creators
- When charts show "No data"
- Setting up new environment

---

### daily_maintenance.py

**Purpose**: Scheduled maintenance tasks (run via cron).

**What it does**:
1. **Price Snapshots**: Record current price for all pools
2. **Volume Reset**: Reset `volume_24h` to 0 (actual rolling 24h would need more logic)
3. **Market Cap Recalculation**: Update market_cap = price × 10M
4. **24h Price Change**: Calculate price_change_24h from yesterday's snapshot

**Usage**:
```bash
python scripts/daily_maintenance.py
```

**Recommended Schedule**:
```cron
# Run daily at midnight UTC
0 0 * * * cd /path/to/backend && source venv/bin/activate && python scripts/daily_maintenance.py
```

---

## Script Template

Creating a new script:

```python
#!/usr/bin/env python3
"""
Script description here.

Usage:
    python scripts/my_script.py [options]
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_supabase_client
from app.config import settings

def main():
    """Main function."""
    supabase = get_supabase_client()
    
    # Your script logic here
    print("Script completed!")

if __name__ == "__main__":
    main()
```

---

## Common Operations

### Query All Creators

```python
response = supabase.table("creators").select("*").execute()
creators = response.data
print(f"Found {len(creators)} creators")
```

### Update Pool Price

```python
supabase.table("pools").update({
    "current_price": new_price,
    "market_cap": new_price * 10_000_000
}).eq("id", pool_id).execute()
```

### Batch Insert Price History

```python
records = [
    {"pool_id": pool_id, "price": price, "timestamp": timestamp}
    for pool_id, price, timestamp in data
]
supabase.table("price_history").insert(records).execute()
```

### Delete Old Data

```python
from datetime import datetime, timedelta

cutoff = (datetime.utcnow() - timedelta(days=30)).isoformat()
supabase.table("price_history")\
    .delete()\
    .lt("timestamp", cutoff)\
    .execute()
```

---

## Environment Variables

Scripts use the same environment as the backend. Required in `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
YOUTUBE_API_KEY=your-youtube-api-key  # For YouTube scripts
```

---

## Error Handling

All scripts should:

1. Validate environment variables exist
2. Handle database errors gracefully
3. Print progress for long operations
4. Exit with appropriate codes (0 = success, 1 = error)

```python
import sys

try:
    # Script logic
    pass
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)

print("Success!")
sys.exit(0)
```

---

## Testing Scripts

Before running in production:

1. Test on a development Supabase project
2. Back up important data
3. Run with `--dry-run` flag if available
4. Check the Supabase Table Editor after running

---

## Adding New Scripts

When adding a new script:

1. Create file in `backend/scripts/`
2. Add docstring with usage
3. Add entry to this documentation
4. Test thoroughly before committing
