CREATE TABLE IF NOT EXISTS creator_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    youtube_channel_id TEXT NOT NULL UNIQUE,
    channel_name TEXT NOT NULL,
    requested_by_user_id UUID REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster status lookups
CREATE INDEX IF NOT EXISTS idx_creator_requests_status ON creator_requests(status);
