"""
Add admin column and set specific users as admins.

STEP 1: Run this SQL in Supabase SQL Editor first:
-----------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

STEP 2: Then run this script to set admin users.
"""
from app.database import get_supabase

supabase = get_supabase()

# Try to check if column exists
try:
    users = supabase.table("users").select("id, email, is_admin").execute()
    print(f"Users ({len(users.data)}):")
    for u in users.data:
        admin_status = "✓ ADMIN" if u.get("is_admin") else ""
        print(f"  {u['email']:<40} {admin_status}")

    # Admin emails - add your emails here
    ADMIN_EMAILS = [
        # Add your admin emails below:
        # "your@email.com",
    ]

    if ADMIN_EMAILS:
        print(f"\nSetting admin status for: {ADMIN_EMAILS}")
        for email in ADMIN_EMAILS:
            result = supabase.table("users").update({"is_admin": True}).eq("email", email).execute()
            if result.data:
                print(f"  ✓ {email} is now admin")
            else:
                print(f"  ✗ {email} not found")
    else:
        print("\n--- To make a user admin, add their email to ADMIN_EMAILS list in this script ---")

except Exception as e:
    if "is_admin" in str(e) and "does not exist" in str(e):
        print("ERROR: is_admin column doesn't exist yet!")
        print("\nPlease run this SQL in Supabase SQL Editor:")
        print("=" * 60)
        print("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;")
        print("=" * 60)
    else:
        raise e
