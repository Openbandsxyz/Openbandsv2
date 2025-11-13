/**
 * OpenBands v2 - Get Community Details API
 * GET /api/communities/[communityId]
 * 
 * Returns detailed information about a specific community.
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

export async function GET(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { communityId } = params;
    const searchParams = req.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    
    console.log(`[Get Community] Fetching details for ${communityId}`);
    
    const supabase = getServerSupabase();
    
    // Get community with stats
    const { data: communityStats, error: statsError } = await supabase
      .from('community_stats')
      .select('*')
      .eq('community_id', communityId)
      .single();
    
    if (statsError || !communityStats) {
      console.error('[Get Community] Query error:', statsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Community not found' 
      }, { status: 404 });
    }
    
    // Get metadata and avatar_url from communities table
    const { data: communityData, error: dataError } = await supabase
      .from('communities')
      .select('metadata, avatar_url')
      .eq('community_id', communityId)
      .single();
    
    // If wallet address provided, check membership
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
    
    console.log(`[Get Community] Found community: ${communityStats.name}, member: ${isMember}`);
    
    // Extract badgeRequirements and combinationLogic from metadata
    const metadata = communityData?.metadata || {};
    const badgeRequirements = metadata.badgeRequirements || null;
    const combinationLogic = metadata.combinationLogic || null;
    
    return NextResponse.json({
      success: true,
      community: {
        id: communityStats.id,
        communityId: communityStats.community_id,
        name: communityStats.name,
        description: communityStats.description,
        attestationType: communityStats.attestation_type,
        attestationValue: communityStats.attestation_value,
        attestationValues: communityStats.attestation_values || null,
        creatorAddress: communityStats.creator_address,
        memberCount: communityStats.member_count || 0,
        postCount: communityStats.post_count || 0,
        lastPostAt: communityStats.last_post_at,
        createdAt: communityStats.created_at,
        isMember,
        badgeRequirements, // Include badge requirements for multi-badge communities
        combinationLogic, // Include combination logic
        avatarUrl: communityData?.avatar_url || null, // Include avatar URL
      },
    });
  } catch (error) {
    console.error('[Get Community] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

