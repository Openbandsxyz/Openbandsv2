"use client";
import { useState, useEffect } from 'react';
import { useCountryPosts } from '@/lib/supabase';
import { CountryPost } from '@/lib/supabase';
import svgPaths from "./imports/svg-x50u5iglgo";
import { commonNames, getCountryFlagEmoji } from '@/lib/utils/country-translation';
import { useAccount } from 'wagmi';
import { PostComposer } from '@/components/communities/PostComposer';
import { PostFeed } from '@/components/communities/PostFeed';

// Icon Components
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

// Country Post Card Component
function CountryPostCard({ post }: { post: CountryPost }) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-lg border p-6 text-left">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
          {post.postTitle}
        </h3>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {formatDate(post.createdAt)}
        </span>
      </div>
      <p className="text-gray-700">
        {post.content}
      </p>
    </div>
  );
}

interface CountryCommunityProps {
  country: {
    name: string;
    code: string;
    flag: string;
    communityId?: string;
  };
}

export default function CountryCommunity({ country }: CountryCommunityProps) {
  const { address } = useAccount();
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [communityData, setCommunityData] = useState<any>(null);
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Fetch country posts from Supabase (keeping old logic for now)
  const { posts, loading, error, refetch } = useCountryPosts(country.code, 'new');

  // Fetch community data if communityId is available
  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!country.communityId) return;
      
      try {
        const params = new URLSearchParams();
        if (address) {
          params.append('walletAddress', address);
        }
        
        const response = await fetch(`/api/communities/${country.communityId}?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setCommunityData(result.community);
          setIsJoined(result.community.isMember);
          setMemberCount(result.community.memberCount);
          setPostCount(result.community.postCount);
        }
      } catch (err) {
        console.error('Failed to fetch community data:', err);
      }
    };
    
    fetchCommunityData();
  }, [country.communityId, address]);

  const handleJoinCommunity = async () => {
    console.log('Joining community:', country.name);
    if (!country.communityId || !address) return;
    
    try {
      const response = await fetch(`/api/communities/${country.communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsJoined(true);
        setMemberCount(prev => prev + 1);
      } else {
        alert(result.error || 'Failed to join community');
      }
    } catch (err) {
      console.error('Failed to join:', err);
      alert('Failed to join community');
    }
  };
  
  const getBadgeEmoji = (type: string) => {
    switch (type) {
      case 'nationality':
        return '🌍';
      case 'company':
        return '✉️';
      case 'age':
        return '🎂';
      default:
        return '🎫';
    }
  };
  
  const getBadgeLabel = (type: string, value: string) => {
    switch (type) {
      case 'nationality':
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
    if (communityData?.badgeRequirements && communityData.badgeRequirements.length > 0) {
      // Multi-badge community: use badgeRequirements from metadata
      return communityData.badgeRequirements.map((req: any) => {
        if (req.type === 'age') {
          return { type: 'age', label: '18+', emoji: '🎂' };
        } else if (req.type === 'nationality' && req.values) {
          // For nationality, return all values
          return req.values.map((code: string) => ({
            type: 'nationality',
            label: commonNames[code as keyof typeof commonNames] || code,
            emoji: getCountryFlagEmoji(code),
          }));
        } else if (req.type === 'company' && req.value) {
          return { type: 'company', label: `@${req.value}`, emoji: '✉️' };
        }
        return null;
      }).flat().filter(Boolean) as Array<{ type: string; label: string; emoji: string }>;
    } else if (communityData?.attestationValues && communityData.attestationValues.length > 1) {
      // Multi-nationality community (legacy format)
      return communityData.attestationValues.map((code: string) => ({
        type: 'nationality',
        label: commonNames[code as keyof typeof commonNames] || code,
        emoji: getCountryFlagEmoji(code),
      }));
    } else {
      // Single badge community
      return [{
        type: communityData?.attestationType || 'nationality',
        label: getBadgeLabel(communityData?.attestationType || 'nationality', communityData?.attestationValue || country.code),
        emoji: communityData?.attestationType === 'nationality' ? getCountryFlagEmoji(country.code) : getBadgeEmoji(communityData?.attestationType || 'nationality'),
      }];
    }
  };
  
  const badgeRequirementsList = getAllBadgeRequirements();
  const hasMultipleBadges = badgeRequirementsList.length > 1;

  return (
    <div className="bg-white relative rounded-tl-[24px] rounded-tr-[24px] size-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[32px] items-start pb-0 pt-[16px] px-[16px] relative size-full">
          {/* Frame8: Main content section */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full max-w-3xl">
            {/* Frame80: Header + Description + Stats */}
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              {/* Frame23: Header with Avatar and Buttons */}
              <div className="content-stretch flex gap-[44px] items-start relative shrink-0 w-full">
                <div className="basis-0 content-stretch flex gap-[12px] grow items-center min-h-px min-w-px relative shrink-0" data-name="Card">
                  {/* Avatar */}
                  <div className="relative rounded-[9999px] shrink-0 size-[78px]" data-name="Avatar">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[9999px]">
                      {communityData?.avatarUrl ? (
                        <img 
                          src={communityData.avatarUrl} 
                          alt={`${country.name} avatar`}
                          className="absolute h-[110%] left-[-5.51%] max-w-none top-[-5%] w-[111.01%] object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">
                          {country.flag}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div className="basis-0 content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[4px] grow h-full items-start justify-center min-h-px min-w-px not-italic relative shrink-0">
                    <p className="leading-[16px] overflow-ellipsis overflow-hidden relative shrink-0 text-[10px] text-nowrap text-zinc-500 tracking-[0.8px] whitespace-pre">COMMUNITY</p>
                    <p className="leading-none min-w-full relative shrink-0 text-[24px] text-zinc-900 w-[min-content]">{communityData?.name || country.name}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0">
                  {isJoined ? (
                    <>
                      <div className="bg-zinc-100 box-border content-stretch flex gap-[8px] h-[32px] items-center px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="Join button">
                        <IconUserCheck />
                        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-900">
                          <p className="leading-[16px] whitespace-pre">Joined</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPostComposer(!showPostComposer)}
                        className="bg-zinc-900 hover:bg-zinc-800 box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 w-[140px] transition-colors"
                        data-name="Button"
                      >
                        <IconPlus />
                        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-50 text-nowrap">
                          <p className="leading-[20px] whitespace-pre">New post</p>
                        </div>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleJoinCommunity}
                      className="bg-blue-600 hover:bg-blue-700 box-border content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 transition-colors"
                    >
                      <IconPlus />
                      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white text-nowrap">
                        <p className="leading-[16px] whitespace-pre">Join</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Frame75: Description + Stats */}
              <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                {/* Frame79: Description + Meta */}
                <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                  <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-500 w-full">
                    {communityData?.description || `This is a space for verified citizens to have candid conversations about national issues, government policies, social concerns, and community initiatives that matter to ${country.name} residents.`}
                  </p>
                  
                  {/* Frame76: Meta info */}
                  <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                    <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
                      <IconFence />
                      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-indigo-400 text-nowrap whitespace-pre">Gated</p>
                    </div>
                  </div>
                </div>

                {/* Frame78: Stats */}
                <div className="content-stretch flex gap-[24px] items-start relative shrink-0">
                  <div className="content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-none relative shrink-0 text-[20px] text-zinc-900 w-full">{memberCount}</p>
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] relative shrink-0 text-[12px] text-zinc-500 w-full">Members</p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-none relative shrink-0 text-[20px] text-zinc-900 w-full">{postCount}</p>
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] relative shrink-0 text-[12px] text-zinc-500 w-full">Posts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Frame81: Badge Requirements */}
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
                <IconFileBadge />
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-indigo-400 text-nowrap whitespace-pre">
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
                        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-zinc-900 text-[14px] text-nowrap whitespace-pre">
                          {badge.emoji} {badge.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="flex h-[1px] items-center justify-center relative shrink-0 w-full">
            <div className="h-0 relative w-full" data-name="Separator">
              <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 804 1">
                  <line id="Separator" stroke="rgba(229, 231, 235, 1)" x2="804" y1="0.5" y2="0.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Post Composer (shown when New Post is clicked) */}
          {showPostComposer && isJoined && communityData?.communityId && (
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full max-w-3xl">
              <PostComposer
                communityId={communityData.communityId}
                isMember={isJoined}
                onPostCreated={() => {
                  setShowPostComposer(false);
                  setRefreshTrigger(prev => prev + 1);
                  // Refresh community data to update post count
                  if (country.communityId) {
                    const fetchCommunityData = async () => {
                      try {
                        const params = new URLSearchParams();
                        if (address) {
                          params.append('walletAddress', address);
                        }
                        const response = await fetch(`/api/communities/${country.communityId}?${params.toString()}`);
                        const result = await response.json();
                        if (result.success) {
                          setCommunityData(result.community);
                          setIsJoined(result.community.isMember);
                          setMemberCount(result.community.memberCount);
                          setPostCount(result.community.postCount);
                        }
                      } catch (err) {
                        console.error('[CountryCommunity] Error refreshing:', err);
                      }
                    };
                    fetchCommunityData();
                  }
                }}
                defaultOpen={true}
                onCancel={() => setShowPostComposer(false)}
              />
            </div>
          )}

          {/* Frame82: Posts Section */}
          {communityData?.communityId ? (
            <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full max-w-3xl">
              <PostFeed
                communityId={communityData.communityId}
                communityName={communityData.name || country.name}
                sort="newest"
                refreshTrigger={refreshTrigger}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}