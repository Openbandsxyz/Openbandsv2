/**
 * OpenBands v2 - Membership Verification Utilities
 * 
 * Server-side utilities for checking community membership and permissions.
 * Used by API routes to enforce access control for posting and commenting.
 */

import { createClient } from '@supabase/supabase-js';
import { verifyUserBadge } from './badge-verification';

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
 * Check if user is a member of a community
 */
export async function isCommunityMember(
  userAddress: string,
  communityId: string
): Promise<boolean> {
  try {
    const supabase = getServerSupabase();
    
    const { data, error } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('member_address', userAddress.toLowerCase())
      .eq('is_active', true)
      .single();
    
    return !!data && !error;
  } catch (error) {
    console.error('[Membership] Error checking membership:', error);
    return false;
  }
}

/**
 * Check if user can join a community (has required badge)
 */
export async function canJoinCommunity(
  userAddress: string,
  communityId: string
): Promise<{
  canJoin: boolean;
  reason?: string;
  community?: any;
}> {
  try {
    const supabase = getServerSupabase();
    
    // Get community info
    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('community_id', communityId)
      .eq('is_active', true)
      .single();
    
    if (error || !community) {
      return { canJoin: false, reason: 'Community not found' };
    }
    
    // Check if already a member
    const isAlreadyMember = await isCommunityMember(userAddress, communityId);
    if (isAlreadyMember) {
      return { canJoin: false, reason: 'Already a member', community };
    }
    
  // Verify user has required badge
  // For nationality communities with multiple values, check if user has ANY of them
  if (community.attestation_type === 'nationality' && community.attestation_values && Array.isArray(community.attestation_values)) {
    // Multi-nationality community
    const userVerification = await verifyUserBadge(userAddress, 'nationality');
    
    if (!userVerification.isVerified) {
      return {
        canJoin: false,
        reason: 'You need to verify your nationality first',
        community,
      };
    }
    
    // Check if user's nationality is in the allowed list
    if (!community.attestation_values.includes(userVerification.actualValue || '')) {
      return {
        canJoin: false,
        reason: `This community is for ${community.attestation_values.join(', ')} citizens only`,
        community,
      };
    }
    
    return { canJoin: true, community };
  }
  
  // Single-value verification (age, company, or single nationality)
  const verification = await verifyUserBadge(
    userAddress,
    community.attestation_type,
    community.attestation_value
  );
  
  if (!verification.isVerified) {
    return {
      canJoin: false,
      reason: verification.error || 'Badge verification failed',
      community,
    };
  }
  
  return { canJoin: true, community };
  } catch (error) {
    console.error('[Membership] Error checking join eligibility:', error);
    return {
      canJoin: false,
      reason: 'Internal error checking eligibility',
    };
  }
}

/**
 * Check if user can post in a community
 * 
 * Strategy: Trust the membership table for better UX
 * - Badge verification happens ONCE when joining (on-chain check)
 * - For posting, we only check membership (fast DB query)
 * - This eliminates blockchain reads for every post, reducing friction
 * 
 * Note: If we want to periodically re-verify badges, we can do it via
 * a background job that updates membership status, not on every post.
 */
export async function canPostInCommunity(
  userAddress: string,
  communityId: string
): Promise<{
  canPost: boolean;
  reason?: string;
}> {
  try {
    // Simple membership check - if they're a member, they can post
    const isMember = await isCommunityMember(userAddress, communityId);
    
    if (!isMember) {
      return { canPost: false, reason: 'You must join this community before posting' };
    }
    
    // That's it! Badge was verified when they joined.
    return { canPost: true };
    
  } catch (error) {
    console.error('[Membership] Error checking post eligibility:', error);
    return {
      canPost: false,
      reason: 'Internal error checking eligibility',
    };
  }
}

/**
 * Get community details by ID
 */
export async function getCommunityById(communityId: string) {
  try {
    const supabase = getServerSupabase();
    
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('community_id', communityId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('[Membership] Error fetching community:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[Membership] Error in getCommunityById:', error);
    return null;
  }
}

/**
 * Get user's membership status for a community
 */
export async function getMembershipStatus(
  userAddress: string,
  communityId: string
) {
  try {
    const supabase = getServerSupabase();
    
    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', communityId)
      .eq('member_address', userAddress.toLowerCase())
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[Membership] Error getting membership status:', error);
    return null;
  }
}

