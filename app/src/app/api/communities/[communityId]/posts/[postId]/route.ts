/**
 * OpenBands v2 - Single Post API
 * GET /api/communities/[communityId]/posts/[postId] - Get a single post with comments
 * 
 * Handles fetching a single post and its comments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_COMMUNITIES_SUPABASE_URL;
  const supabaseServiceKey = process.env.COMMUNITIES_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Communities Supabase credentials not configured. Please set NEXT_PUBLIC_COMMUNITIES_SUPABASE_URL and COMMUNITIES_SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * GET - Get a single post with comments
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { communityId: string; postId: string } }
) {
  try {
    const { communityId, postId } = params;
    const searchParams = req.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    
    console.log(`[Get Post] Fetching post ${postId} from community ${communityId}`);
    
    const supabase = getServerSupabase();
    
    // Check if user is a member (if wallet address provided)
    let isMember = false;
    if (walletAddress) {
      const { data: membership } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('member_address', walletAddress.toLowerCase())
        .eq('is_active', true)
        .single();
      
      isMember = !!membership;
    }
    
    // Get the post - query by ID only (postId is unique, no need to filter by community_id)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('is_active', true)
      .single();
    
    if (postError || !post) {
      console.error('[Get Post] Query error:', postError);
      console.error('[Get Post] Tried postId:', postId);
      return NextResponse.json({ 
        success: false, 
        error: 'Post not found' 
      }, { status: 404 });
    }
    
    // Verify community_id matches (but don't fail if it doesn't - just log)
    if (post.community_id !== communityId) {
      console.warn(`[Get Post] Community ID mismatch: post.community_id=${post.community_id}, requested=${communityId}`);
    }
    
    console.log(`[Get Post] Post data:`, JSON.stringify(post, null, 2));
    console.log(`[Get Post] Post upvote_count: ${post.upvote_count}, comment_count: ${post.comment_count}`);
    
    // Calculate actual counts from database (not denormalized values)
    // This ensures counts are accurate even if data was deleted directly from DB
    
    // Count active comments
    const { count: actualCommentCount, error: commentCountError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('is_active', true);
    
    if (commentCountError) {
      console.error('[Get Post] Error counting comments:', commentCountError);
    }
    
    // Count active post upvotes
    const { count: actualUpvoteCount, error: upvoteCountError } = await supabase
      .from('post_upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    if (upvoteCountError) {
      console.error('[Get Post] Error counting upvotes:', upvoteCountError);
      // If post_upvotes table doesn't exist or has issues, fall back to stored count
    }
    
    console.log(`[Get Post] Actual comment count: ${actualCommentCount || 0}, Actual upvote count: ${actualUpvoteCount ?? (post.upvote_count || 0)}`);
    
    // Get comments for this post
    // Service role key bypasses RLS, so we can query directly
    let comments = null;
    let commentsError = null;
    
    // Try querying comments
    const commentsResult = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    comments = commentsResult.data;
    commentsError = commentsResult.error;
    
    if (commentsError) {
      console.error('[Get Post] Comments query error:', commentsError);
      console.error('[Get Post] Comments error details:', JSON.stringify(commentsError, null, 2));
      // Continue even if comments fail, but log the error
    }
    
    console.log(`[Get Post] Raw comments from DB:`, JSON.stringify(comments, null, 2));
    console.log(`[Get Post] Comments count: ${comments?.length || 0}`);
    
    // If no comments found, try without is_active filter to debug
    if (!comments || comments.length === 0) {
      console.log(`[Get Post] No active comments found, trying without is_active filter...`);
      const allCommentsResult = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      console.log(`[Get Post] All comments (including inactive):`, JSON.stringify(allCommentsResult.data, null, 2));
      console.log(`[Get Post] All comments count: ${allCommentsResult.data?.length || 0}`);
      if (allCommentsResult.error) {
        console.error('[Get Post] All comments query error:', allCommentsResult.error);
      }
      
      // Use all comments if active comments query failed
      if (allCommentsResult.data && allCommentsResult.data.length > 0) {
        comments = allCommentsResult.data.filter((c: any) => c.is_active !== false);
        console.log(`[Get Post] Using filtered comments: ${comments.length}`);
      }
    }
    
    // Format comments - use upvote_count directly from the comments table
    // Include parent_comment_id for nested comment support
    const formattedComments = (comments || []).map((comment: any) => ({
      id: comment.id,
      post_id: comment.post_id,
      parent_comment_id: comment.parent_comment_id || null,
      author_address: comment.author_address,
      author_anonymous_id: comment.author_anonymous_id,
      content: comment.content,
      upvote_count: comment.upvote_count || 0,
      created_at: comment.created_at,
    }));
    
    console.log(`[Get Post] Formatted comments:`, formattedComments);
    console.log(`[Get Post] Found post with ${formattedComments.length} comments`);
    
    // Use actual counts from database, not denormalized values
    const response = {
      success: true,
      post: {
        id: post.id,
        community_id: post.community_id,
        title: post.title,
        content: post.content,
        author_address: post.author_address,
        author_anonymous_id: post.author_anonymous_id,
        upvote_count: actualUpvoteCount ?? (post.upvote_count || 0), // Use actual count, fallback to stored
        comment_count: actualCommentCount || formattedComments.length || 0, // Use actual count, fallback to formatted length
        created_at: post.created_at,
      },
      comments: formattedComments,
      isMember, // Include membership status so frontend can disable buttons
    };
    
    // Optionally update the denormalized counts in the database to keep them in sync
    if (actualCommentCount !== null || actualUpvoteCount !== null) {
      const updates: any = {};
      if (actualCommentCount !== null && actualCommentCount !== post.comment_count) {
        updates.comment_count = actualCommentCount;
      }
      if (actualUpvoteCount !== null && actualUpvoteCount !== post.upvote_count) {
        updates.upvote_count = actualUpvoteCount;
      }
      
      if (Object.keys(updates).length > 0) {
        console.log(`[Get Post] Updating denormalized counts:`, updates);
        await supabase
          .from('posts')
          .update(updates)
          .eq('id', postId);
      }
    }
    
    console.log(`[Get Post] Final response:`, JSON.stringify(response, null, 2));
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[Get Post] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

