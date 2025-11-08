/**
 * OpenBands v2 - Join Community API
 * POST /api/communities/[communityId]/join
 * 
 * Allows users with required badges to join communities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canJoinCommunity } from '@/lib/verification/membership';
import { verifyUserBadge } from '@/lib/verification/badge-verification';
import { joinCommunityLimiter } from '@/lib/rate-limit';

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

export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { walletAddress } = await req.json();
    const { communityId } = params;
    
    console.log(`[Join Community] Request from ${walletAddress} to join ${communityId}`);
    
    // Validate input
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address' 
      }, { status: 400 });
    }
    
    // Rate limit: 10 join attempts per minute
    try {
      await joinCommunityLimiter.check(10, walletAddress);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded' 
      }, { status: 429 });
    }
    
    // Check if user can join
    const joinCheck = await canJoinCommunity(walletAddress, communityId);
    
    if (!joinCheck.canJoin) {
      console.log(`[Join Community] Cannot join: ${joinCheck.reason}`);
      return NextResponse.json({ 
        success: false, 
        error: joinCheck.reason 
      }, { status: 403 });
    }
    
    // Get user's current badge value for snapshot
    const verification = await verifyUserBadge(
      walletAddress,
      joinCheck.community.attestation_type,
      joinCheck.community.attestation_value
    );
    
    if (!verification.isVerified) {
      return NextResponse.json({ 
        success: false, 
        error: 'Badge verification failed' 
      }, { status: 403 });
    }
    
    // Insert membership
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        member_address: walletAddress.toLowerCase(),
        attestation_verified_at: Number(verification.verifiedAt),
        attestation_value: verification.actualValue,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[Join Community] Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to join community' 
      }, { status: 500 });
    }
    
    console.log(`[Join Community] Successfully joined: ${communityId}`);
    
    return NextResponse.json({
      success: true,
      membership: {
        id: data.id,
        communityId: data.community_id,
        joinedAt: data.joined_at,
      },
    });
  } catch (error) {
    console.error('[Join Community] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

