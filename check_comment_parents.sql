-- Check comment parent relationships
-- This will help identify if "yoooo" has the correct parent_comment_id

-- Find all comments and their parents
SELECT 
  id,
  LEFT(content, 50) as content_preview,
  parent_comment_id,
  created_at,
  (SELECT LEFT(content, 50) FROM comments c2 WHERE c2.id = comments.parent_comment_id) as parent_content
FROM comments
WHERE post_id = (
  SELECT id FROM posts 
  ORDER BY created_at DESC 
  LIMIT 1
)
ORDER BY created_at ASC;

-- Find "heee" comment
SELECT 
  id,
  content,
  parent_comment_id,
  (SELECT content FROM comments c2 WHERE c2.id = comments.parent_comment_id) as parent_content
FROM comments
WHERE content LIKE '%heee%'
ORDER BY created_at DESC
LIMIT 1;

-- Find "yoooo" comment and check its parent
SELECT 
  id,
  content,
  parent_comment_id,
  (SELECT content FROM comments c2 WHERE c2.id = comments.parent_comment_id) as parent_content,
  (SELECT id FROM comments c2 WHERE c2.content LIKE '%heee%' ORDER BY created_at DESC LIMIT 1) as heee_comment_id
FROM comments
WHERE content LIKE '%yoooo%'
ORDER BY created_at DESC
LIMIT 1;

