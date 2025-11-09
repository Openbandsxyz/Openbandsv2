-- Migration: Create comments table
-- This table stores comments on posts

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  community_id VARCHAR(255) NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Author Info
  author_address VARCHAR(42) NOT NULL,
  author_anonymous_id VARCHAR(100) NOT NULL,
  
  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_active ON comments(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);

-- Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Authenticated members can create comments" ON comments;

-- Policy: Anyone can read active comments (service role bypasses RLS automatically)
CREATE POLICY "Comments are viewable by everyone" 
  ON comments FOR SELECT 
  USING (is_active = true);

-- Allow service role to bypass RLS (this is automatic but explicit for clarity)
-- Service role key in API routes will bypass all RLS policies

-- Policy: Service role can create comments (verified in API)
CREATE POLICY "Authenticated members can create comments" 
  ON comments FOR INSERT 
  WITH CHECK (true);

