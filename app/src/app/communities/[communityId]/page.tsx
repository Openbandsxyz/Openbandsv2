/**
 * OpenBands v2 - Community Detail Page
 * 
 * Displays a single community with posts and join functionality.
 * Restored original beautiful design from CountryCommunity.tsx
 */

'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { JoinCommunityButton } from '@/components/communities/JoinCommunityButton';
import { PostComposer } from '@/components/communities/PostComposer';
import { PostFeed } from '@/components/communities/PostFeed';
import svgPaths from "@/components/imports/svg-x50u5iglgo";
import { commonNames, getCountryFlagEmoji } from '@/lib/utils/country-translation';

// Icon Components (from original design)
function IconUserCheck() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <path d={svgPaths.p5c51500} stroke="var(--stroke-0, #18181B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
      </svg>
    </div>
  );
}

function IconPlus() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <path d={svgPaths.p36bdefc0} stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
      </svg>
    </div>
  );
}

function IconFence() {
  return (
    <div className="relative shrink-0 size-[18px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <path d={svgPaths.p2a9e7c00} stroke="var(--stroke-0, #818CF8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function IconFileBadge() {
  return (
    <div className="relative shrink-0 size-[18px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <path d={svgPaths.p12d72af0} stroke="var(--stroke-0, #818CF8)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
      </svg>
    </div>
  );
}

function IconCheck() {
  return (
    <div className="relative shrink-0 size-[18px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <path d="M15 4.5L6.75 12.75L3 9" stroke="var(--stroke-0, #2A9D90)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    </div>
  );
}

function IconMail({ verified = false }: { verified?: boolean }) {
  return (
    <div className="relative shrink-0 size-[11px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <path d={svgPaths.pbc72700} stroke={verified ? "var(--stroke-0, #2A9D90)" : "var(--stroke-0, #71717A)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

interface BadgeRequirement {
  type: 'age' | 'nationality' | 'company';
  value?: string;
  values?: string[];
}

interface Community {
  id: string;
  communityId: string;
  name: string;
  description: string;
  attestationType: string;
  attestationValue: string;
  attestationValues?: string[];
  creatorAddress: string;
  memberCount: number;
  postCount: number;
  lastPostAt: string | null;
  createdAt: string;
  isMember: boolean;
  badgeRequirements?: BadgeRequirement[];
  combinationLogic?: 'any' | 'all';
  avatarUrl?: string | null;
}

export default function CommunityPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { address } = useAccount();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showPostComposer, setShowPostComposer] = useState(false);
  
  useEffect(() => {
    fetchCommunity();
  }, [communityId, address]);
  
  const fetchCommunity = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (address) {
        params.append('walletAddress', address);
      }
      
      console.log(`[Community Page] Fetching ${communityId} with address:`, address);
      
      const response = await fetch(`/api/communities/${communityId}?${params.toString()}`);
      const result = await response.json();
      
      console.log('[Community Page] API response:', result);
      console.log('[Community Page] Member count:', result.community?.memberCount);
      console.log('[Community Page] Is member:', result.community?.isMember);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch community');
      }
      
      setCommunity(result.community);
    } catch (err) {
      console.error('[Community Page] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load community');
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinSuccess = () => {
    console.log('[Community Page] Join successful, refreshing...');
    fetchCommunity();
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handlePostCreated = () => {
    console.log('[Community Page] Post created, refreshing feed...');
    setShowPostComposer(false);
    setRefreshTrigger(prev => prev + 1);
    fetchCommunity(); // Refresh member count
  };
  
  const getBadgeEmoji = (type: string) => {
    switch (type) {
      case 'nationality':
        return '🌍';
      case 'company':
        return '🏢';
      case 'age':
        return '🎂';
      default:
        return '🎫';
    }
  };
  
  const getBadgeLabel = (type: string, value: string) => {
    switch (type) {
      case 'nationality':
        // Translate 3-letter country code to English name
        return commonNames[value as keyof typeof commonNames] || value;
      case 'company':
        return `@${value}`;
      case 'age':
        return '18+';
      default:
        return value;
    }
  };
  
  // Get all badge requirements for display
  const getAllBadgeRequirements = (): Array<{ type: string; label: string; emoji: string }> => {
    if (community?.badgeRequirements && community.badgeRequirements.length > 0) {
      // Multi-badge community: use badgeRequirements from metadata
      return community.badgeRequirements.map(req => {
        if (req.type === 'age') {
          return { type: 'age', label: '18+', emoji: '🎂' };
        } else if (req.type === 'nationality' && req.values) {
          // For nationality, return all values
          return req.values.map(code => ({
            type: 'nationality',
            label: commonNames[code as keyof typeof commonNames] || code,
            emoji: getCountryFlagEmoji(code),
          }));
        } else if (req.type === 'company' && req.value) {
          return { type: 'company', label: `@${req.value}`, emoji: '✉️' };
        }
        return null;
      }).flat().filter(Boolean) as Array<{ type: string; label: string; emoji: string }>;
    } else if (community?.attestationValues && community.attestationValues.length > 1) {
      // Multi-nationality community (legacy format)
      return community.attestationValues.map(code => ({
        type: 'nationality',
        label: commonNames[code as keyof typeof commonNames] || code,
        emoji: getCountryFlagEmoji(code),
      }));
    } else {
      // Single badge community
      return [{
        type: community?.attestationType || 'age',
        label: getBadgeLabel(community?.attestationType || 'age', community?.attestationValue || 'verified'),
        emoji: getBadgeEmoji(community?.attestationType || 'age'),
      }];
    }
  };
  
  if (loading) {
    return (
      <div className="relative size-full">
        <div className="size-full bg-white">
          <div className="box-border content-stretch flex flex-col items-center justify-center p-[40px] relative size-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">Loading community...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !community) {
    return (
      <div className="relative size-full">
        <div className="size-full bg-white">
          <div className="box-border content-stretch flex flex-col items-center justify-center p-[40px] relative size-full">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
              <p className="text-red-700">Error: {error || 'Community not found'}</p>
              <Link href="/" className="mt-2 text-sm text-red-600 hover:text-red-800 underline inline-block">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate badge requirements for display
  const badgeRequirementsList = getAllBadgeRequirements();
  const hasMultipleBadges = badgeRequirementsList.length > 1;
  
  return (
    <div className="relative size-full">
      <div className="size-full bg-white">
        <div className="box-border content-stretch flex flex-col items-start p-[40px] relative size-full">
          <div className="content-stretch flex flex-col gap-[20px] items-start relative w-full">
            {/* Main Community Info */}
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              {/* Header with Avatar and Buttons */}
              <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                {/* Community Avatar */}
                <div className="relative rounded-[9999px] shrink-0 size-[78px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[9999px]">
                    {community.avatarUrl ? (
                      <img 
                        src={community.avatarUrl} 
                        alt={`${community.name} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">
                        {getBadgeEmoji(community.attestationType)}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Title and Buttons Container */}
                <div className="content-stretch flex flex-col gap-[4px] grow items-start relative shrink-0">
                  <p className="leading-[16px] overflow-ellipsis overflow-hidden relative shrink-0 text-[10px] text-nowrap text-zinc-500 tracking-[0.8px] whitespace-pre font-['Inter:Medium',_sans-serif] font-medium">COMMUNITY</p>
                  
                  {/* Title and Buttons Row */}
                  <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                    <p className="leading-none relative shrink-0 text-[24px] text-zinc-900 font-['Inter:Semi_Bold',_sans-serif] font-semibold">{community.name}</p>
                    
                    {/* Action Buttons */}
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                      {community.isMember ? (
                        <>
                          {/* Joined Button */}
                          <div className="bg-zinc-100 box-border content-stretch flex gap-[4px] h-[28px] items-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
                            <IconUserCheck />
                            <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-900">
                              <p className="leading-[16px] whitespace-pre">Joined</p>
                            </div>
                          </div>
                          {/* New Post Button */}
                          <button
                            onClick={() => setShowPostComposer(!showPostComposer)}
                            className="bg-zinc-900 hover:bg-zinc-800 box-border content-stretch flex gap-[4px] h-[28px] items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 transition-colors"
                          >
                            <IconPlus />
                            <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap">
                              <p className="leading-[16px] whitespace-pre">New post</p>
                            </div>
                          </button>
                        </>
                      ) : (
                        /* Join Button - use the component for proper verification */
                        <JoinCommunityButton
                          communityId={community.communityId}
                          attestationType={community.attestationType}
                          attestationValue={community.attestationValue}
                          isJoined={false}
                          onJoinSuccess={handleJoinSuccess}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description and Stats */}
              <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                  <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[20px] not-italic text-[14px] text-zinc-500" style={{ maxWidth: '600px' }}>
                    {community.description}
                  </p>
                  
                  {/* Meta info */}
                  <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
                      <IconFence />
                      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-indigo-400 text-nowrap whitespace-pre">Gated</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="content-stretch flex gap-[24px] items-start relative shrink-0">
                  <div className="content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0">
                    <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-none relative shrink-0 text-[20px] text-zinc-900 w-full">{community.memberCount}</p>
                    <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] relative shrink-0 text-[12px] text-zinc-500 w-full">Members</p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0">
                    <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-none relative shrink-0 text-[20px] text-zinc-900 w-full">{community.postCount}</p>
                    <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] relative shrink-0 text-[12px] text-zinc-500 w-full">Posts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge Requirements */}
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
                <IconFileBadge />
                <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-indigo-400 text-nowrap whitespace-pre">
                  {hasMultipleBadges
                    ? 'To join this community, you must have at least one of the following badges'
                    : 'To join this community, you must have the following badge'}
                </p>
              </div>
              
              <div className="content-stretch flex gap-[10px] items-center flex-wrap relative shrink-0 w-full">
                {badgeRequirementsList.map((badge, index) => (
                  <div key={`${badge.type}-${index}`} className="content-stretch flex items-start relative rounded-[12px] shrink-0">
                    <div className="bg-neutral-50 box-border content-stretch flex gap-[8px] items-center justify-center px-[10px] py-[2px] relative rounded-[12px] shrink-0">
                      <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[12px]" />
                      <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                        <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-zinc-900 text-[14px] text-nowrap whitespace-pre">
                          {badge.emoji} {badge.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Post Composer (shown when New Post is clicked) */}
          {showPostComposer && community.isMember && (
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full mt-4">
              <PostComposer
                communityId={communityId}
                isMember={community.isMember}
                onPostCreated={handlePostCreated}
                defaultOpen={true}
                onCancel={() => setShowPostComposer(false)}
              />
            </div>
          )}

          {/* Posts Section */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full mt-8">
            <PostFeed
              communityId={communityId}
              sort="newest"
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
