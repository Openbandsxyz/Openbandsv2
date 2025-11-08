/**
 * OpenBands v2 - List Communities API
 * GET /api/communities
 * 
 * Lists all active communities with filtering and pagination.
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const attestationType = searchParams.get('attestationType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sort = searchParams.get('sort') || 'newest';
    
    const offset = (page - 1) * limit;
    
    console.log(`[List Communities] Fetching page ${page}, type: ${attestationType || 'all'}, sort: ${sort}`);
    
    const supabase = getServerSupabase();
    
    let query = supabase
      .from('community_stats')
      .select('*', { count: 'exact' });
    
    // Filter by attestation type
    if (attestationType) {
      query = query.eq('attestation_type', attestationType);
    }
    
    // Sort
    if (sort === 'popular') {
      query = query.order('member_count', { ascending: false });
    } else if (sort === 'active') {
      query = query.order('last_post_at', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[List Communities] Query error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch communities' 
      }, { status: 500 });
    }
    
    console.log(`[List Communities] Found ${count} communities, returning ${data?.length} for this page`);
    
    return NextResponse.json({
      success: true,
      communities: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[List Communities] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

