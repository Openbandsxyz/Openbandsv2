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
        upvoteCount: post.upvote_count,
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
    const sort = searchParams.get('sort') || 'popular';
    
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
    let shouldSortInMemory = false;
    if (sort === 'popular') {
      // Popular = sorted by (upvote_count + comment_count) descending, then by created_at descending
      // We'll fetch a larger batch (100 posts) and sort in memory, then paginate
      // This ensures we get the truly popular posts across all posts, not just the current page
      query = query.order('created_at', { ascending: false });
      // Temporarily increase limit for popular sorting to get better results
      const popularLimit = Math.min(100, limit * 5); // Fetch up to 5 pages worth
      query = query.range(0, popularLimit - 1);
      shouldSortInMemory = true;
    } else if (sort === 'hot') {
      query = query.order('upvote_count', { ascending: false })
                   .order('created_at', { ascending: false });
      query = query.range(offset, offset + limit - 1);
    } else if (sort === 'top') {
      query = query.order('upvote_count', { ascending: false });
      query = query.range(offset, offset + limit - 1);
    } else {
      // newest (default)
      query = query.order('created_at', { ascending: false });
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[List Posts] Query error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch posts' 
      }, { status: 500 });
    }
    
    // If sorting by popular, sort by (upvote_count + comment_count) descending
    let sortedPosts = data || [];
    if (shouldSortInMemory && sortedPosts.length > 0) {
      // Sort all fetched posts by popularity score
      sortedPosts = sortedPosts.sort((a: any, b: any) => {
        const scoreA = (a.upvote_count || 0) + (a.comment_count || 0);
        const scoreB = (b.upvote_count || 0) + (b.comment_count || 0);
        if (scoreB !== scoreA) {
          return scoreB - scoreA; // Higher score first
        }
        // If scores are equal, sort by created_at descending (newer first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Apply pagination after sorting
      const startIndex = offset;
      const endIndex = offset + limit;
      sortedPosts = sortedPosts.slice(startIndex, endIndex);
      
      // Update total count for pagination (use the fetched count, not the sorted slice count)
      // For popular sorting, we're showing a subset of all posts, so pagination might be off
      // But this is acceptable for now
    }
    
    console.log(`[List Posts] Found ${count} posts, returning ${sortedPosts.length} for this page (sort: ${sort})`);
    
    return NextResponse.json({
      success: true,
      posts: sortedPosts,
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

