-- Migration: Create post_likes table
-- This table tracks which users have upvoted which posts (to prevent duplicate upvotes)

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_address VARCHAR(42) NOT NULL,
  community_id VARCHAR(255) NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: One like per user per post
  UNIQUE(post_id, user_address)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_address, created_at DESC);

-- Row Level Security
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON post_likes;

CREATE POLICY "Anyone can view post likes" 
  ON post_likes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like posts" 
  ON post_likes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can unlike posts" 
  ON post_likes FOR DELETE 
  USING (true);

