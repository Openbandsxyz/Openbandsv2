/**
 * OpenBands v2 - Create Community API
 * POST /api/communities/create
 * 
 * Creates a new community for a verified badge owner.
 * Only users with verified badges can create communities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { createClient } from '@supabase/supabase-js';
import { verifyUserBadge } from '@/lib/verification/badge-verification';
import { communityCreationLimiter } from '@/lib/rate-limit';
import { translateMRZToCountryName } from '@/lib/utils/country-translation';

// Initialize Supabase client for server-side operations
// Use SERVICE_ROLE key to bypass RLS (we do our own access control via badge verification)
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

export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      description, 
      shortDescription,
      rules, 
      // New multi-badge support
      badgeRequirements,
      primaryAttestationType,
      primaryAttestationValues,
      // Legacy single-badge support (for backwards compatibility)
      attestationType, 
      attestationValues, 
      walletAddress, 
      signature, 
      timestamp,
      combinationLogic,
      avatarUrl, // Avatar image as base64 data URL
    } = await req.json();
    
    // Rate limit: 5 community creations per hour per wallet
    try {
      await communityCreationLimiter.check(5, walletAddress);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }
    
    // Validate input
    if (!name || name.length < 3 || name.length > 100) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid name (3-100 characters required)' 
      }, { status: 400 });
    }
    
    if (!description || description.length < 10 || description.length > 500) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid description (10-500 characters required)' 
      }, { status: 400 });
    }
    
    // Support both new multi-badge format and legacy single-badge format
    let finalBadgeRequirements: Array<{ type: 'age' | 'nationality' | 'company'; value?: string; values?: string[] }>;
    let finalPrimaryAttestationType: 'nationality' | 'age' | 'company';
    let finalPrimaryAttestationValues: string[] | undefined;
    let finalCombinationLogic: 'any' | 'all' | undefined;
    
    if (badgeRequirements && Array.isArray(badgeRequirements) && badgeRequirements.length > 0) {
      // New multi-badge format
      finalBadgeRequirements = badgeRequirements;
      finalPrimaryAttestationType = primaryAttestationType || badgeRequirements[0].type;
      finalPrimaryAttestationValues = primaryAttestationValues;
      finalCombinationLogic = combinationLogic;
      
      // Validate badge requirements
      if (finalBadgeRequirements.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'At least one badge requirement must be specified' 
        }, { status: 400 });
      }
      
      // Validate each badge requirement
      for (const req of finalBadgeRequirements) {
        if (!['age', 'nationality', 'company'].includes(req.type)) {
          return NextResponse.json({ 
            success: false, 
            error: `Invalid badge type: ${req.type}` 
          }, { status: 400 });
        }
        
        if (req.type === 'nationality') {
          if (!req.values || !Array.isArray(req.values) || req.values.length === 0) {
            return NextResponse.json({ 
              success: false, 
              error: 'Nationality badge must include at least one nationality' 
            }, { status: 400 });
          }
          if (req.values.length > 50) {
            return NextResponse.json({ 
              success: false, 
              error: 'Maximum 50 nationalities allowed per badge requirement' 
            }, { status: 400 });
          }
        } else if (req.type === 'company') {
          if (!req.value || req.value.trim().length === 0) {
            return NextResponse.json({ 
              success: false, 
              error: 'Company badge must include a domain' 
            }, { status: 400 });
          }
        }
      }
      
      // Validate combination logic for multiple badges
      if (finalBadgeRequirements.length > 1 && !finalCombinationLogic) {
        return NextResponse.json({ 
          success: false, 
          error: 'Combination logic (any/all) is required when multiple badges are specified' 
        }, { status: 400 });
      }
    } else {
      // Legacy single-badge format (backwards compatibility)
      if (!attestationType || !['nationality', 'age', 'company'].includes(attestationType)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid attestation type' 
        }, { status: 400 });
      }
      
      // Convert legacy format to new format
      if (attestationType === 'nationality') {
        if (!attestationValues || !Array.isArray(attestationValues) || attestationValues.length === 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'At least one nationality must be selected' 
          }, { status: 400 });
        }
        if (attestationValues.length > 50) {
          return NextResponse.json({ 
            success: false, 
            error: 'Maximum 50 nationalities allowed' 
          }, { status: 400 });
        }
        finalBadgeRequirements = [{ type: 'nationality', values: attestationValues }];
      } else if (attestationType === 'company') {
        finalBadgeRequirements = [{ type: 'company', value: attestationValues || 'verified' }];
      } else {
        finalBadgeRequirements = [{ type: 'age', value: 'verified' }];
      }
      
      finalPrimaryAttestationType = attestationType;
      finalPrimaryAttestationValues = attestationValues;
      finalCombinationLogic = undefined;
    }
    
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid wallet address' 
      }, { status: 400 });
    }
    
    // Validate timestamp (prevent replay attacks - must be within 5 minutes)
    if (!timestamp || typeof timestamp !== 'number') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid timestamp' 
      }, { status: 400 });
    }
    
    const now = Date.now();
    const timeDiff = Math.abs(now - timestamp);
    if (timeDiff > 5 * 60 * 1000) { // 5 minutes
      return NextResponse.json({ 
        success: false, 
        error: 'Request expired. Please try again.' 
      }, { status: 400 });
    }
    
    // Verify signature (use the SAME message that was signed)
    const message = JSON.stringify({
      name,
      description,
      shortDescription: shortDescription || description,
      rules: rules || [],
      badgeRequirements: finalBadgeRequirements,
      primaryAttestationType: finalPrimaryAttestationType,
      primaryAttestationValues: finalPrimaryAttestationValues,
      combinationLogic: finalCombinationLogic || undefined,
      timestamp, // Use the timestamp from the request!
    });
    
    let isValidSignature = false;
    try {
      isValidSignature = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
    } catch (error) {
      console.error('[Community Creation] Signature verification error:', error);
    }
    
    if (!isValidSignature) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid signature' 
      }, { status: 401 });
    }
    
    // Verify user owns required badges based on combination logic
    console.log(`[Community Creation] Verifying badges for ${walletAddress}, requirements: ${JSON.stringify(finalBadgeRequirements)}, logic: ${finalCombinationLogic || 'single'}`);
    
    const ownedBadges: Array<{ type: string; value: string }> = [];
    const missingBadges: Array<{ type: string; value: string; error: string }> = [];
    
    // Verify each badge requirement
    for (const req of finalBadgeRequirements) {
      if (req.type === 'age') {
        const verification = await verifyUserBadge(walletAddress, 'age');
        if (verification.isVerified) {
          ownedBadges.push({ type: 'age', value: 'verified' });
        } else {
          missingBadges.push({ type: 'age', value: 'verified', error: verification.error || 'User has not verified age' });
        }
      } else if (req.type === 'nationality') {
        const verification = await verifyUserBadge(walletAddress, 'nationality');
        if (!verification.isVerified) {
          missingBadges.push({ type: 'nationality', value: req.values?.join(', ') || '', error: 'User has not verified nationality' });
          continue;
        }
        
        // Normalize user nationality (D<< -> DEU)
        let userNationality = verification.actualValue!;
        if (userNationality === 'D<<') {
          userNationality = 'DEU';
        }
        
        // Normalize required nationalities
        const normalizedRequired = (req.values || []).map((code: string) => code === 'D<<' ? 'DEU' : code);
        
        if (normalizedRequired.includes(userNationality)) {
          ownedBadges.push({ type: 'nationality', value: userNationality });
        } else {
          const userCountryName = translateMRZToCountryName(userNationality);
          missingBadges.push({ 
            type: 'nationality', 
            value: normalizedRequired.join(', '), 
            error: `User nationality (${userCountryName}) not in required list: ${normalizedRequired.map(c => translateMRZToCountryName(c)).join(', ')}` 
          });
        }
      } else if (req.type === 'company') {
        const verification = await verifyUserBadge(walletAddress, 'company');
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
    if (finalCombinationLogic === 'all') {
      // User must own ALL badges
      if (missingBadges.length > 0) {
        const missingList = missingBadges.map(b => `${b.type} (${b.value})`).join(', ');
        const ownedList = ownedBadges.length > 0 ? ownedBadges.map(b => `${b.type} (${b.value})`).join(', ') : 'none';
        return NextResponse.json({ 
          success: false, 
          error: `You don't own all required badges. Missing: ${missingList}. You own: ${ownedList}.` 
        }, { status: 403 });
      }
    } else {
      // User must own AT LEAST ONE badge (or single badge must be owned)
      if (ownedBadges.length === 0) {
        const requiredList = finalBadgeRequirements.map(req => {
          if (req.type === 'age') return 'Age (18+)';
          if (req.type === 'nationality') return `Nationality (${req.values?.join(', ') || ''})`;
          if (req.type === 'company') return `Email (@${req.value})`;
          return '';
        }).filter(Boolean).join(', ');
        return NextResponse.json({ 
          success: false, 
          error: `You don't own any of the required badges. Required: ${requiredList}.` 
        }, { status: 403 });
      }
    }
    
    console.log(`[Community Creation] Badge verification passed. Owned: ${ownedBadges.length}, Missing: ${missingBadges.length}`);
    
    // Determine primary attestation values for database storage (backwards compatibility)
    let finalAttestationValue: string;
    let finalAttestationValues: string[] | null = null;
    
    if (finalPrimaryAttestationType === 'nationality' && finalPrimaryAttestationValues) {
      const normalized = finalPrimaryAttestationValues.map((code: string) => code === 'D<<' ? 'DEU' : code);
      finalAttestationValues = normalized;
      finalAttestationValue = normalized[0];
    } else if (finalPrimaryAttestationType === 'company') {
      finalAttestationValue = finalBadgeRequirements.find(r => r.type === 'company')?.value?.replace('@', '').trim() || 'verified';
    } else {
      finalAttestationValue = 'verified';
    }
    
    const supabase = getServerSupabase();
    
    // Check for duplicate community with same badge requirements
    // We need to compare the full badge requirements, not just primary type
    // Normalize badge requirements for comparison (sort arrays, normalize values)
    const normalizeBadgeRequirements = (reqs: Array<{ type: string; value?: string; values?: string[] }>) => {
      return reqs.map(req => {
        if (req.type === 'nationality' && req.values) {
          return { type: req.type, values: [...req.values].sort() };
        } else if (req.type === 'company' && req.value) {
          return { type: req.type, value: req.value.toLowerCase().replace('@', '').trim() };
        } else if (req.type === 'age') {
          return { type: req.type, value: 'verified' };
        }
        return req;
      }).sort((a, b) => {
        // Sort by type first, then by value
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        if (a.type === 'nationality' && a.values && b.values) {
          return JSON.stringify(a.values).localeCompare(JSON.stringify(b.values));
        }
        return (a.value || '').localeCompare(b.value || '');
      });
    };
    
    const normalizedNewRequirements = normalizeBadgeRequirements(finalBadgeRequirements);
    const normalizedNewRequirementsStr = JSON.stringify(normalizedNewRequirements);
    
    // Fetch all existing communities with metadata
    const { data: existingCommunities, error: fetchError } = await supabase
      .from('communities')
      .select('name, metadata, attestation_type, attestation_value')
      .eq('is_active', true);
    
    if (fetchError) {
      console.error('[Community Creation] Failed to check for duplicates:', fetchError);
      // Continue anyway - better to allow duplicate than block legitimate creation
    } else if (existingCommunities) {
      // Check each existing community's badge requirements
      for (const existing of existingCommunities) {
        const existingMetadata = existing.metadata || {};
        const existingBadgeRequirements = existingMetadata.badgeRequirements;
        
        if (existingBadgeRequirements && Array.isArray(existingBadgeRequirements)) {
          // Normalize existing badge requirements
          const normalizedExisting = normalizeBadgeRequirements(existingBadgeRequirements);
          const normalizedExistingStr = JSON.stringify(normalizedExisting);
          
          // Compare normalized badge requirements
          if (normalizedNewRequirementsStr === normalizedExistingStr) {
            return NextResponse.json({ 
              success: false, 
              error: `A community with these exact badge requirements already exists: "${existing.name}". Please join that community or create one with different requirements.` 
            }, { status: 409 });
          }
        } else {
          // Legacy communities without metadata - check based on primary attestation type
          // Only check if the new community is also single-badge (no metadata)
          if (finalBadgeRequirements.length === 1) {
            const existingType = existing.attestation_type;
            const existingValue = existing.attestation_value;
            
            if (existingType === finalPrimaryAttestationType && existingValue === finalAttestationValue) {
              return NextResponse.json({ 
                success: false, 
                error: `A community with this badge requirement already exists: "${existing.name}". Please join that community instead.` 
              }, { status: 409 });
            }
          }
        }
      }
    }
    
    // Determine contract info based on primary attestation type
    let contractInfo: {
      address: string;
      network: string;
      chainId: number;
    };
    
    switch (finalPrimaryAttestationType) {
      case 'nationality':
        contractInfo = {
          address: "0x5aCA8d5C9F44D69Fa48cCeCb6b566475c2A5961a",
          network: "celo",
          chainId: 42220,
        };
        break;
      case 'age':
        contractInfo = {
          address: "0x72f1619824bcD499F4a27E28Bf9F1aa913c2EF2a",
          network: "celo",
          chainId: 42220,
        };
        break;
      case 'company': {
        // Use the correct environment variable name (with fallback for backwards compatibility)
        const zkJwtManagerAddress = process.env.NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_MAINNET || 
                                     process.env.NEXT_PUBLIC_ZKJWT_PROOF_MANAGER_ADDRESS;
        
        if (!zkJwtManagerAddress) {
          return NextResponse.json({ 
            success: false, 
            error: 'ZKJWT Proof Manager address not configured. Please set NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_MAINNET environment variable.' 
          }, { status: 500 });
        }
        
        contractInfo = {
          address: zkJwtManagerAddress,
          network: "base",
          chainId: 8453,
        };
        break;
      }
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid attestation type' 
        }, { status: 400 });
    }
    
    // Validate contract info
    if (!contractInfo.address || contractInfo.address.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Contract address not configured for ${finalPrimaryAttestationType} badge type` 
      }, { status: 500 });
    }
    
    // Generate community ID
    const communityIdSuffix = finalAttestationValues 
      ? finalAttestationValues.slice(0, 3).join('-')  // e.g., "DEU-FRA-ITA"
      : finalAttestationValue;
    const communityId = `${finalPrimaryAttestationType}-${communityIdSuffix}-${Date.now()}`;
    
    console.log(`[Community Creation] Creating community: ${communityId}`);
    
    // Get creator's verification timestamp (use primary badge type)
    const creatorVerification = await verifyUserBadge(walletAddress, finalPrimaryAttestationType);
    
    // Parse rules: rules can be an array or a string (newline-separated)
    const rulesArray = Array.isArray(rules) 
      ? rules.filter((r: string) => r && r.trim().length > 0)
      : (typeof rules === 'string' ? rules.split('\n').filter((r: string) => r.trim()) : []);
    
    // Store badge requirements and combination logic in metadata JSONB column
    const metadata = {
      shortDescription: shortDescription || description.slice(0, 80),
      badgeRequirements: finalBadgeRequirements,
      combinationLogic: finalCombinationLogic,
    };
    
    // Insert into database
    const { data: community, error: dbError } = await supabase
      .from('communities')
      .insert({
        community_id: communityId,
        name,
        description,
        attestation_type: finalPrimaryAttestationType,
        attestation_value: finalAttestationValue,
        attestation_values: finalAttestationValues,
        required_contract_address: contractInfo.address,
        required_contract_network: contractInfo.network,
        required_contract_chain_id: contractInfo.chainId,
        creator_address: walletAddress.toLowerCase(),
        creator_verified_at: Number(creatorVerification.verifiedAt),
        rules: rulesArray, // Store as TEXT[] array
        metadata: metadata, // Store badge requirements and combination logic in JSONB
        avatar_url: avatarUrl || null, // Store avatar image URL (base64 data URL for now)
      })
      .select()
      .single();
    
    if (dbError || !community) {
      console.error('[Community Creation] Database error:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create community' 
      }, { status: 500 });
    }
    
    // Automatically add creator as first member
    const creatorActualValue = creatorVerification.actualValue!;
    const { error: memberError } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        member_address: walletAddress.toLowerCase(),
        attestation_verified_at: Number(creatorVerification.verifiedAt),
        attestation_value: creatorActualValue,
      });
    
    if (memberError) {
      console.error('[Community Creation] Failed to add creator as member:', memberError);
      // Non-critical, continue
    }
    
    console.log(`[Community Creation] Successfully created: ${communityId}`);
    
    return NextResponse.json({
      success: true,
      community: {
        id: community.id,
        communityId: community.community_id,
        name: community.name,
        attestationType: community.attestation_type,
        attestationValue: community.attestation_value,
        createdAt: community.created_at,
      },
    });
  } catch (error) {
    console.error('[Community Creation] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

