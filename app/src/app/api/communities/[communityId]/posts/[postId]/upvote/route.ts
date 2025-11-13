/**
 * OpenBands v2 - Upvote Post API
 * POST /api/communities/[communityId]/posts/[postId]/upvote
 * 
 * Toggles upvote on a post. Only members can upvote.
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
  { params }: { params: { communityId: string; postId: string } }
) {
  try {
    const { walletAddress } = await req.json();
    const { communityId, postId } = params;

    console.log(`[Upvote Post] Request from ${walletAddress} for post ${postId} in ${communityId}`);

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
      console.log(`[Upvote Post] Cannot upvote: ${postCheck.reason}`);
      return NextResponse.json({
        success: false,
        error: postCheck.reason
      }, { status: 403 });
    }

    const supabase = getServerSupabase();

    // Check if user already upvoted this post
    // First, check if post_upvotes table exists, otherwise use a simpler approach
    let existingUpvote = null;
    try {
      const { data } = await supabase
        .from('post_upvotes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_address', walletAddress.toLowerCase())
        .maybeSingle();
      existingUpvote = data;
    } catch (err) {
      // Table might not exist yet, we'll just toggle the count
      console.log('[Upvote Post] post_upvotes table may not exist, using simple toggle');
    }

    // Get current post to check upvote count
    const { data: currentPost } = await supabase
      .from('posts')
      .select('upvote_count')
      .eq('id', postId)
      .single();

    if (!currentPost) {
      return NextResponse.json({
        success: false,
        error: 'Post not found'
      }, { status: 404 });
    }

    if (existingUpvote) {
      // Remove upvote - only if table exists
      if (existingUpvote.id) {
        const { error: deleteError } = await supabase
          .from('post_upvotes')
          .delete()
          .eq('id', existingUpvote.id);

        if (deleteError) {
          console.error('[Upvote Post] Error removing upvote:', deleteError);
        }
      }

      // Decrement upvote count
      const newCount = Math.max(0, (currentPost.upvote_count || 0) - 1);
      await supabase
        .from('posts')
        .update({ upvote_count: newCount })
        .eq('id', postId);

      console.log(`[Upvote Post] Removed upvote from post ${postId}`);

      return NextResponse.json({
        success: true,
        upvoted: false,
        upvoteCount: newCount
      });
    } else {
      // Add upvote - only if table exists
      try {
        await supabase
          .from('post_upvotes')
          .insert({
            post_id: postId,
            user_address: walletAddress.toLowerCase(),
            community_id: communityId,
          });
      } catch (err) {
        // Table might not exist, that's okay - we'll just update the count
        console.log('[Upvote Post] Could not insert into post_upvotes table, continuing with count update');
      }

      // Increment upvote count
      const newCount = (currentPost.upvote_count || 0) + 1;
      await supabase
        .from('posts')
        .update({ upvote_count: newCount })
        .eq('id', postId);

      console.log(`[Upvote Post] Added upvote to post ${postId}`);

      return NextResponse.json({
        success: true,
        upvoted: true,
        upvoteCount: newCount
      });
    }
  } catch (error) {
    console.error('[Upvote Post] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

