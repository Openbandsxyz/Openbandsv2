-- Migration: Create comment_likes table
-- This table tracks which users have upvoted which comments (to prevent duplicate upvotes)

CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_address VARCHAR(42) NOT NULL,
  community_id VARCHAR(255) NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: One like per user per comment
  UNIQUE(comment_id, user_address)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes(user_address, created_at DESC);

-- Row Level Security
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;

CREATE POLICY "Anyone can view comment likes" 
  ON comment_likes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like comments" 
  ON comment_likes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can unlike comments" 
  ON comment_likes FOR DELETE 
  USING (true);

