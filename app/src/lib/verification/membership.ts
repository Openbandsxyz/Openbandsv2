/**
 * OpenBands v2 - Membership Verification Utilities
 * 
 * Server-side utilities for checking community membership and permissions.
 * Used by API routes to enforce access control for posting and commenting.
 */

import { createClient } from '@supabase/supabase-js';
import { verifyUserBadge } from './badge-verification';
import { normalizeMRZCode } from '@/lib/utils/country-translation';

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
  
  // Check if community has multi-badge requirements in metadata
  const metadata = community.metadata || {};
  const badgeRequirements = metadata.badgeRequirements;
  const combinationLogic = metadata.combinationLogic;
  
  if (badgeRequirements && Array.isArray(badgeRequirements) && badgeRequirements.length > 0) {
    // Multi-badge community - verify based on combination logic
    console.log(`[Membership] Multi-badge community verification for ${userAddress}, logic: ${combinationLogic}`);
    
    const ownedBadges: Array<{ type: string; value: string }> = [];
    const missingBadges: Array<{ type: string; value: string; error: string }> = [];
    
    // Verify each badge requirement
    for (const req of badgeRequirements) {
      if (req.type === 'age') {
        const verification = await verifyUserBadge(userAddress, 'age');
        if (verification.isVerified) {
          ownedBadges.push({ type: 'age', value: 'verified' });
        } else {
          missingBadges.push({ type: 'age', value: 'verified', error: verification.error || 'User has not verified age' });
        }
      } else if (req.type === 'nationality') {
        const verification = await verifyUserBadge(userAddress, 'nationality');
        if (!verification.isVerified) {
          missingBadges.push({ type: 'nationality', value: req.values?.join(', ') || '', error: 'User has not verified nationality' });
          continue;
        }
        
        // Normalize nationality codes (MRZ format -> ISO-3 standard)
        const userNationality = normalizeMRZCode(verification.actualValue || '');
        const normalizedRequired = (req.values || []).map((code: string) => normalizeMRZCode(code));
        
        if (normalizedRequired.includes(userNationality)) {
          ownedBadges.push({ type: 'nationality', value: userNationality });
        } else {
          missingBadges.push({ 
            type: 'nationality', 
            value: normalizedRequired.join(', '), 
            error: `User nationality (${userNationality}) not in required list: ${normalizedRequired.join(', ')}` 
          });
        }
      } else if (req.type === 'company') {
        const verification = await verifyUserBadge(userAddress, 'company');
        if (!verification.isVerified) {
          missingBadges.push({ type: 'company', value: req.value || '', error: 'User has not verified company email' });
          continue;
        }
        
        const userDomain = verification.actualValue!.toLowerCase();
        const requiredDomain = (req.value || '').toLowerCase().replace('@', '');
        
        if (userDomain === requiredDomain) {
          ownedBadges.push({ type: 'company', value: userDomain });
        } else {
          missingBadges.push({ 
            type: 'company', 
            value: requiredDomain, 
            error: `User domain (${userDomain}) does not match required (${requiredDomain})` 
          });
        }
      }
    }
    
    // Apply combination logic
    if (combinationLogic === 'all') {
      // User must own ALL badges
      if (missingBadges.length > 0) {
        const missingList = missingBadges.map(b => `${b.type}`).join(', ');
        return {
          canJoin: false,
          reason: `You need all required badges: ${missingList}. You have: ${ownedBadges.map(b => b.type).join(', ') || 'none'}.`,
          community,
        };
      }
    } else {
      // User must own AT LEAST ONE badge (or default to "any" if not specified)
      if (ownedBadges.length === 0) {
        const requiredList = badgeRequirements.map(req => req.type).join(', ');
        return {
          canJoin: false,
          reason: `You need at least one of: ${requiredList}`,
          community,
        };
      }
    }
    
    console.log(`[Membership] Multi-badge verification passed. Owned: ${ownedBadges.length}, Missing: ${missingBadges.length}`);
    return { canJoin: true, community };
  }
  
  // Legacy verification for single-badge communities
  // For nationality communities with multiple values, check if user has ANY of them
  if (community.attestation_type === 'nationality' && community.attestation_values && Array.isArray(community.attestation_values)) {
    // Multi-nationality community
    console.log(`[Membership] Legacy multi-nationality verification for ${userAddress}`);
    const userVerification = await verifyUserBadge(userAddress, 'nationality');
    
    if (!userVerification.isVerified) {
      console.log(`[Membership] User nationality not verified`);
      return {
        canJoin: false,
        reason: 'You need to verify your nationality first',
        community,
      };
    }
    
    // Normalize user nationality (MRZ format -> ISO-3 standard)
    // E.g., D<< -> DEU, and any other non-standard passport codes
    const userNationality = normalizeMRZCode(userVerification.actualValue || '');
    
    // Normalize stored values to ensure consistent comparison
    // (defensive coding - values should already be normalized, but this ensures it)
    const normalizedStoredValues = community.attestation_values.map((code: string) => 
      normalizeMRZCode(code || '').trim().toUpperCase()
    ).filter(Boolean);
    
    const normalizedUserNationality = userNationality.trim().toUpperCase();
    
    console.log(`[Membership] User nationality: "${normalizedUserNationality}"`);
    console.log(`[Membership] Allowed nationalities: [${normalizedStoredValues.join(', ')}]`);
    console.log(`[Membership] Match: ${normalizedStoredValues.includes(normalizedUserNationality)}`);
    
    // Check if user's nationality is in the allowed list
    if (!normalizedStoredValues.includes(normalizedUserNationality)) {
      return {
        canJoin: false,
        reason: `This community is for ${normalizedStoredValues.join(', ')} citizens only. You have: ${normalizedUserNationality}`,
        community,
      };
    }
    
    console.log(`[Membership] Legacy multi-nationality verification passed`);
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

