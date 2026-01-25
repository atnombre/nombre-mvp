#!/usr/bin/env python3
"""
Daily Maintenance Script

This script is now a wrapper around the centralized maintenance service.
It can be run manually or via cron.
"""

import sys
import os
import asyncio

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from app.services.maintenance_service import run_all_maintenance


async def main():
    print(f"\n{'='*50}")
    print(f"🔧 Daily Maintenance - {datetime.now().isoformat()}")
    print(f"{'='*50}\n")
    
    try:
        results = await run_all_maintenance()
        print("✅ Maintenance completed successfully")
        print(f"Results: {results}")
    except Exception as e:
        print(f"❌ Error running maintenance: {str(e)}")
        sys.exit(1)
    
    print(f"\n{'='*50}")
    print("✅ Done")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    from datetime import datetime
    asyncio.run(main())
