/**
 * OpenBands v2 - Posts API
 * POST /api/communities/[communityId]/posts - Create a post
 * GET /api/communities/[communityId]/posts - List posts
 * 
 * Handles creating and listing posts within communities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canPostInCommunity } from '@/lib/verification/membership';
import { postCreationLimiter } from '@/lib/rate-limit';

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
 * POST - Create a new post
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { walletAddress, title, content, anonymousId } = await req.json();
    const { communityId } = params;
    
    console.log(`[Create Post] Request from ${walletAddress} in ${communityId}`);
    
    // Validate input
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address' 
      }, { status: 400 });
    }
    
    // Rate limit: 10 posts per hour per user
    try {
      await postCreationLimiter.check(10, walletAddress);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please slow down.' 
      }, { status: 429 });
    }
    
    // Validate content
    if (!content || content.length < 1 || content.length > 10000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid content length (1-10,000 characters)' 
      }, { status: 400 });
    }
    
    if (title && title.length > 255) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title too long (max 255 characters)' 
      }, { status: 400 });
    }
    
    // Check if user can post
    const postCheck = await canPostInCommunity(walletAddress, communityId);
    
    if (!postCheck.canPost) {
      console.log(`[Create Post] Cannot post: ${postCheck.reason}`);
      return NextResponse.json({ 
        success: false, 
        error: postCheck.reason 
      }, { status: 403 });
    }
    
    // Generate anonymous ID if not provided
    const finalAnonymousId = anonymousId || `Anon-${walletAddress.slice(2, 8)}`;
    
    // Create post
    const supabase = getServerSupabase();
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        community_id: communityId,
        author_address: walletAddress.toLowerCase(),
        author_anonymous_id: finalAnonymousId,
        title: title || null,
        content,
      })
      .select()
      .single();
    
    if (error || !post) {
      console.error('[Create Post] Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create post' 
      }, { status: 500 });
    }
    
    console.log(`[Create Post] Successfully created post: ${post.id}`);
    
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        authorAnonymousId: post.author_anonymous_id,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        createdAt: post.created_at,
      },
    });
  } catch (error) {
    console.error('[Create Post] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * GET - List posts in a community
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sort = searchParams.get('sort') || 'newest';
    
    const offset = (page - 1) * limit;
    const { communityId } = params;
    
    console.log(`[List Posts] Fetching posts for ${communityId}, page ${page}, sort: ${sort}`);
    
    const supabase = getServerSupabase();
    
    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('community_id', communityId)
      .eq('is_active', true);
    
    // Sort
    if (sort === 'hot') {
      query = query.order('like_count', { ascending: false })
                   .order('created_at', { ascending: false });
    } else if (sort === 'top') {
      query = query.order('like_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[List Posts] Query error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch posts' 
      }, { status: 500 });
    }
    
    console.log(`[List Posts] Found ${count} posts, returning ${data?.length} for this page`);
    
    return NextResponse.json({
      success: true,
      posts: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[List Posts] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

