-- Migration: Rename likes to upvotes for consistency
-- This migration renames columns and tables from "like" to "upvote"

-- ============================================
-- STEP 1: Rename columns in posts and comments tables
-- ============================================

-- Rename like_count to upvote_count in posts table (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'like_count'
  ) THEN
    ALTER TABLE posts RENAME COLUMN like_count TO upvote_count;
  END IF;
END $$;

-- Rename like_count to upvote_count in comments table (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'like_count'
  ) THEN
    ALTER TABLE comments RENAME COLUMN like_count TO upvote_count;
  END IF;
END $$;

-- ============================================
-- STEP 2: Rename indexes that reference like_count
-- ============================================

-- Drop old index on posts
DROP INDEX IF EXISTS idx_posts_hot;

-- Recreate index with new column name (only if upvote_count column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'upvote_count'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_posts_hot ON posts(community_id, upvote_count DESC, created_at DESC);
  END IF;
END $$;

-- ============================================
-- STEP 3: Rename post_likes table to post_upvotes
-- ============================================

-- Rename the table if it exists (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_likes') THEN
    ALTER TABLE post_likes RENAME TO post_upvotes;
  END IF;
END $$;

-- Rename indexes (only if table exists)
DROP INDEX IF EXISTS idx_post_likes_post;
DROP INDEX IF EXISTS idx_post_likes_user;

-- Create indexes only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_upvotes') THEN
    CREATE INDEX IF NOT EXISTS idx_post_upvotes_post ON post_upvotes(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_upvotes_user ON post_upvotes(user_address, created_at DESC);
  END IF;
END $$;

-- Drop old policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_upvotes') THEN
    DROP POLICY IF EXISTS "Anyone can view post likes" ON post_upvotes;
    DROP POLICY IF EXISTS "Authenticated users can like posts" ON post_upvotes;
    DROP POLICY IF EXISTS "Users can unlike posts" ON post_upvotes;
  END IF;
END $$;

-- Create new policies with updated names (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_upvotes') THEN
    CREATE POLICY "Anyone can view post upvotes" 
      ON post_upvotes FOR SELECT 
      USING (true);

    CREATE POLICY "Authenticated users can upvote posts" 
      ON post_upvotes FOR INSERT 
      WITH CHECK (true);

    CREATE POLICY "Users can remove upvote from posts" 
      ON post_upvotes FOR DELETE 
      USING (true);
  END IF;
END $$;

-- ============================================
-- STEP 4: Rename comment_likes table to comment_upvotes
-- ============================================

-- Rename the table if it exists (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comment_likes') THEN
    ALTER TABLE comment_likes RENAME TO comment_upvotes;
  END IF;
END $$;

-- Rename indexes (only if table exists)
DROP INDEX IF EXISTS idx_comment_likes_comment;
DROP INDEX IF EXISTS idx_comment_likes_user;

-- Create indexes only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comment_upvotes') THEN
    CREATE INDEX IF NOT EXISTS idx_comment_upvotes_comment ON comment_upvotes(comment_id);
    CREATE INDEX IF NOT EXISTS idx_comment_upvotes_user ON comment_upvotes(user_address, created_at DESC);
  END IF;
END $$;

-- Drop old policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comment_upvotes') THEN
    DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_upvotes;
    DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_upvotes;
    DROP POLICY IF EXISTS "Users can unlike comments" ON comment_upvotes;
  END IF;
END $$;

-- Create new policies with updated names (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comment_upvotes') THEN
    CREATE POLICY "Anyone can view comment upvotes" 
      ON comment_upvotes FOR SELECT 
      USING (true);

    CREATE POLICY "Authenticated users can upvote comments" 
      ON comment_upvotes FOR INSERT 
      WITH CHECK (true);

    CREATE POLICY "Users can remove upvote from comments" 
      ON comment_upvotes FOR DELETE 
      USING (true);
  END IF;
END $$;

