-- Migration: Create posts table
-- This table stores posts within communities

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  community_id VARCHAR(255) NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
  
  -- Author Info (anonymous but verifiable)
  author_address VARCHAR(42) NOT NULL,
  author_anonymous_id VARCHAR(100) NOT NULL,
  
  -- Content
  title VARCHAR(255),
  content TEXT NOT NULL CHECK (char_length(content) <= 10000),
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_posts_hot ON posts(community_id, like_count DESC, created_at DESC);

-- Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Authenticated members can create posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;

-- Policy: Anyone can read active posts
CREATE POLICY "Posts are viewable by everyone" 
  ON posts FOR SELECT 
  USING (is_active = true);

-- Policy: Service role can create posts (verified in API)
CREATE POLICY "Authenticated members can create posts" 
  ON posts FOR INSERT 
  WITH CHECK (true);

-- Policy: Service role can update posts (verified in API)
CREATE POLICY "Authors can update their own posts" 
  ON posts FOR UPDATE 
  USING (true);

