-- ============================================
-- Recalculate upvote_count and comment_count for all posts
-- ============================================
-- This fixes the counts after deleting comments/upvotes directly from the database

-- Recalculate comment_count for all posts
UPDATE posts
SET comment_count = (
  SELECT COUNT(*)
  FROM comments
  WHERE comments.post_id = posts.id
    AND comments.is_active = true
);

-- Recalculate upvote_count for all posts
UPDATE posts
SET upvote_count = (
  SELECT COUNT(*)
  FROM post_upvotes
  WHERE post_upvotes.post_id = posts.id
);

-- Verify the counts
SELECT 
  id,
  LEFT(content, 50) as content_preview,
  upvote_count,
  comment_count,
  (SELECT COUNT(*) FROM post_upvotes WHERE post_upvotes.post_id = posts.id) as actual_upvote_count,
  (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id AND comments.is_active = true) as actual_comment_count
FROM posts
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 20;

