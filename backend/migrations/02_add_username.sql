
-- Add username column to creator_requests table
ALTER TABLE creator_requests 
ADD COLUMN username VARCHAR(255);

-- Optional: Backfill existing requests if needed (will effect nothing if table is empty or data implies username from channel name, which isn't always true, so leaving null is safer or setting a default)
-- For now, we allow it to be nullable for existing records, but code will enforce it for new ones.
