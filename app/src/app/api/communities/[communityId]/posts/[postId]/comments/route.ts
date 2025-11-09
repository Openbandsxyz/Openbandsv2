/**
 * OpenBands v2 - Comments API
 * POST /api/communities/[communityId]/posts/[postId]/comments - Create a comment
 * 
 * Handles creating comments on posts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canPostInCommunity } from '@/lib/verification/membership';

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
 * POST - Create a new comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string; postId: string } }
) {
  try {
    const { walletAddress, content, anonymousId, parentCommentId } = await req.json();
    const { communityId, postId } = params;
    
    console.log(`[Create Comment] Request from ${walletAddress} on post ${postId}, parentCommentId: ${parentCommentId || 'none'}`);
    
    // Validate input
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address' 
      }, { status: 400 });
    }
    
    // Validate content
    if (!content || content.length < 1 || content.length > 2000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid content length (1-2,000 characters)' 
      }, { status: 400 });
    }
    
    // Check if user can post (members can comment)
    const postCheck = await canPostInCommunity(walletAddress, communityId);
    
    if (!postCheck.canPost) {
      console.log(`[Create Comment] Cannot comment: ${postCheck.reason}`);
      return NextResponse.json({ 
        success: false, 
        error: postCheck.reason 
      }, { status: 403 });
    }
    
    // Verify post exists and belongs to community
    const supabase = getServerSupabase();
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, community_id')
      .eq('id', postId)
      .eq('community_id', communityId)
      .eq('is_active', true)
      .single();
    
    if (postError || !post) {
      return NextResponse.json({ 
        success: false, 
        error: 'Post not found' 
      }, { status: 404 });
    }
    
    // Generate anonymous ID if not provided
    const finalAnonymousId = anonymousId || `Anon-${walletAddress.slice(2, 8)}`;
    
    // If parentCommentId is provided, verify it exists and belongs to the same post
    // Also check nesting depth (max 3 levels like Reddit)
    if (parentCommentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, post_id, parent_comment_id')
        .eq('id', parentCommentId)
        .eq('post_id', postId)
        .single();
      
      if (parentError || !parentComment) {
        return NextResponse.json({ 
          success: false, 
          error: 'Parent comment not found' 
        }, { status: 404 });
      }
      
      // Check nesting depth - Reddit-style: API caps at ~8-10 levels
      // Database supports unlimited nesting, but we cap API responses for performance
      const API_DEPTH_LIMIT = 10; // Reddit caps at ~8, we use 10 for flexibility
      let currentParentId = parentComment.parent_comment_id;
      let depth = 1; // We're already at depth 1 (replying to parentComment)
      
      // Traverse up the tree to count depth
      while (currentParentId && depth < API_DEPTH_LIMIT) {
        const { data: grandParent } = await supabase
          .from('comments')
          .select('parent_comment_id')
          .eq('id', currentParentId)
          .single();
        
        if (!grandParent) break;
        
        currentParentId = grandParent.parent_comment_id;
        depth++;
      }
      
      if (depth >= API_DEPTH_LIMIT) {
        return NextResponse.json({ 
          success: false, 
          error: `Maximum nesting depth (${API_DEPTH_LIMIT} levels) reached. Please use "Continue this thread" to view deeper replies.` 
        }, { status: 400 });
      }
    }
    
    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        community_id: communityId,
        parent_comment_id: parentCommentId || null,
        author_address: walletAddress.toLowerCase(),
        author_anonymous_id: finalAnonymousId,
        content: content.trim(),
        upvote_count: 0,
      })
      .select()
      .single();
    
    if (error || !comment) {
      console.error('[Create Comment] Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create comment' 
      }, { status: 500 });
    }
    
    // Update post comment count
    const { data: currentPost } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', postId)
      .single();
    
    if (currentPost) {
      await supabase
        .from('posts')
        .update({ comment_count: (currentPost.comment_count || 0) + 1 })
        .eq('id', postId);
    }
    
    console.log(`[Create Comment] Successfully created comment: ${comment.id}`);
    
    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        post_id: comment.post_id,
        parent_comment_id: comment.parent_comment_id || null,
        author_address: comment.author_address,
        author_anonymous_id: comment.author_anonymous_id,
        content: comment.content,
        upvote_count: comment.upvote_count,
        created_at: comment.created_at,
      },
    });
  } catch (error) {
    console.error('[Create Comment] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

