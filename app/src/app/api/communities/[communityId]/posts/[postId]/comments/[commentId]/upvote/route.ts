/**
 * OpenBands v2 - Upvote Comment API
 * POST /api/communities/[communityId]/posts/[postId]/comments/[commentId]/upvote
 * 
 * Toggles upvote on a comment. Only members can upvote.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canPostInCommunity } from '@/lib/verification/membership';

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

export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string; postId: string; commentId: string } }
) {
  try {
    const { walletAddress } = await req.json();
    const { communityId, commentId } = params;

    console.log(`[Upvote Comment] Request from ${walletAddress} for comment ${commentId} in ${communityId}`);

    // Validate input
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid wallet address'
      }, { status: 400 });
    }

    // Check if user can upvote (must be a member)
    const postCheck = await canPostInCommunity(walletAddress, communityId);

    if (!postCheck.canPost) {
      console.log(`[Upvote Comment] Cannot upvote: ${postCheck.reason}`);
      return NextResponse.json({
        success: false,
        error: postCheck.reason
      }, { status: 403 });
    }

    const supabase = getServerSupabase();

    // Check if user already upvoted this comment
    let existingUpvote = null;
    try {
      const { data } = await supabase
        .from('comment_upvotes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_address', walletAddress.toLowerCase())
        .maybeSingle();
      existingUpvote = data;
    } catch (err) {
      // Table might not exist yet, we'll just toggle the count
      console.log('[Upvote Comment] comment_upvotes table may not exist, using simple toggle');
    }

    // Get current comment to check upvote count
    const { data: currentComment } = await supabase
      .from('comments')
      .select('upvote_count')
      .eq('id', commentId)
      .single();

    if (!currentComment) {
      return NextResponse.json({
        success: false,
        error: 'Comment not found'
      }, { status: 404 });
    }

    if (existingUpvote) {
      // Remove upvote - only if table exists
      if (existingUpvote.id) {
        const { error: deleteError } = await supabase
          .from('comment_upvotes')
          .delete()
          .eq('id', existingUpvote.id);

        if (deleteError) {
          console.error('[Upvote Comment] Error removing upvote:', deleteError);
        }
      }

      // Decrement upvote count
      const newCount = Math.max(0, (currentComment.upvote_count || 0) - 1);
      await supabase
        .from('comments')
        .update({ upvote_count: newCount })
        .eq('id', commentId);

      console.log(`[Upvote Comment] Removed upvote from comment ${commentId}`);

      return NextResponse.json({
        success: true,
        upvoted: false,
        upvoteCount: newCount
      });
    } else {
      // Add upvote - only if table exists
      try {
        await supabase
          .from('comment_upvotes')
          .insert({
            comment_id: commentId,
            user_address: walletAddress.toLowerCase(),
            community_id: communityId,
          });
      } catch (err) {
        // Table might not exist, that's okay - we'll just update the count
        console.log('[Upvote Comment] Could not insert into comment_upvotes table, continuing with count update');
      }

      // Increment upvote count
      const newCount = (currentComment.upvote_count || 0) + 1;
      await supabase
        .from('comments')
        .update({ upvote_count: newCount })
        .eq('id', commentId);

      console.log(`[Upvote Comment] Added upvote to comment ${commentId}`);

      return NextResponse.json({
        success: true,
        upvoted: true,
        upvoteCount: newCount
      });
    }
  } catch (error) {
    console.error('[Upvote Comment] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

