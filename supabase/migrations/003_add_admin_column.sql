-- Add is_admin column to users table
-- This column controls access to admin features like adding creators

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for efficient admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- For security, admin status should ONLY be set via direct database access
-- Never trust client-side admin claims - always verify server-side
