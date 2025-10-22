"use client";
import { useState } from 'react';
import { useCountryPosts } from '@/lib/supabase';
import { CountryPost } from '@/lib/supabase';
import svgPaths from "./imports/svg-x50u5iglgo";

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
  };
}

export default function CountryCommunity({ country }: CountryCommunityProps) {
  // Fetch country posts from Supabase
  const { posts, loading, error, refetch } = useCountryPosts(country.code, 'new');
  const [isJoined, setIsJoined] = useState(false); // Default to not joined
  
  // TODO: This will be fetched from on-chain data when verification system is implemented
  // Count of verified wallets that have joined this community
  const verifiedMembersCount = 0; // Placeholder - will be replaced with on-chain data

  const handleJoinCommunity = () => {
    console.log('Joining community:', country.name);
    setIsJoined(true);
  };

  return (
    <div className="relative size-full">
      <div className="size-full bg-white">
        <div className="box-border content-stretch flex flex-col items-start p-[40px] relative size-full">
          <div className="content-stretch flex flex-col gap-[20px] items-start relative w-full">
            {/* Main Community Info */}
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              {/* Header with Avatar and Buttons */}
              <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                {/* Country Flag Avatar */}
                <div className="relative rounded-[9999px] shrink-0 size-[78px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[9999px]">
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">
                      {country.flag}
                    </div>
                  </div>
                </div>
                
                {/* Title and Buttons Container */}
                <div className="content-stretch flex flex-col gap-[4px] grow items-start relative shrink-0">
                  <p className="leading-[16px] overflow-ellipsis overflow-hidden relative shrink-0 text-[10px] text-nowrap text-zinc-500 tracking-[0.8px] whitespace-pre font-['Inter:Medium',_sans-serif] font-medium">COMMUNITY</p>
                  
                  {/* Title and Buttons Row */}
                  <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                    <p className="leading-none relative shrink-0 text-[24px] text-zinc-900 font-['Inter:Semi_Bold',_sans-serif] font-semibold">{country.name}</p>
                    
                    {/* Action Buttons */}
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                      {isJoined ? (
                        <>
                          {/* Joined Button */}
                          <div className="bg-zinc-100 box-border content-stretch flex gap-[4px] h-[28px] items-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
                            <IconUserCheck />
                            <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-900">
                              <p className="leading-[16px] whitespace-pre">Joined</p>
                            </div>
                          </div>
                          {/* New Post Button */}
                          <div className="bg-zinc-900 box-border content-stretch flex gap-[4px] h-[28px] items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
                            <IconPlus />
                            <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-neutral-50 text-nowrap">
                              <p className="leading-[16px] whitespace-pre">New post</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Join Button */
                        <button
                          onClick={handleJoinCommunity}
                          className="bg-blue-600 hover:bg-blue-700 box-border content-stretch flex gap-[4px] h-[28px] items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 transition-colors"
                        >
                          <IconPlus />
                          <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white text-nowrap">
                            <p className="leading-[16px] whitespace-pre">Join</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description and Stats */}
              <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                  <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-500 w-full">
                    This is a space for verified citizens to have candid conversations about national issues, government policies, 
                    social concerns, and community initiatives that matter to {country.name} residents.
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
                    <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-none relative shrink-0 text-[20px] text-zinc-900 w-full">{verifiedMembersCount}</p>
                    <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] relative shrink-0 text-[12px] text-zinc-500 w-full">Members</p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0">
                    <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-none relative shrink-0 text-[20px] text-zinc-900 w-full">{posts.length}</p>
                    <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[16px] relative shrink-0 text-[12px] text-zinc-500 w-full">Posts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge Requirements */}
            <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
                <IconFileBadge />
                <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-indigo-400 text-nowrap whitespace-pre">To join this community, you must have the following badge</p>
              </div>
              
              <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
                {/* Unverified Badge (Default State) */}
                <div className="content-stretch flex items-start relative rounded-[12px] shrink-0">
                  <div className="bg-neutral-50 box-border content-stretch flex gap-[8px] items-center justify-center px-[10px] py-[2px] relative rounded-[12px] shrink-0">
                    <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[12px]" />
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                      <IconMail verified={false} />
                      <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-zinc-900 text-[14px] text-nowrap whitespace-pre">@{country.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            {loading ? (
              <div className="bg-white rounded-lg border p-8 text-center w-full">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-sm text-gray-600">Loading posts...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg border p-8 text-center w-full">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Error loading posts</h3>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center w-full">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-sm text-gray-600 mb-4">Be the first to share something in the {country.name} community!</p>
              </div>
            ) : (
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                {posts.map((post) => (
                  <CountryPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}