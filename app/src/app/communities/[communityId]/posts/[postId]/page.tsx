/**
 * OpenBands v2 - Post Detail Page
 * 
 * Displays a single post with comments.
 */

'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PostDetail } from '@/components/communities/PostDetail';
import { useState, useEffect, Suspense } from 'react';
import Layout from '@/components/Layout';

function PostDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const communityId = params.communityId as string;
  const postId = params.postId as string;
  const [communityName, setCommunityName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'home' | 'badges' | 'employees' | 'communities'>('home');
  const sortParam = searchParams.get('sort') as 'newest' | 'popular' | null;
  // Set default sort to "popular" immediately - ensure it's always 'newest' or 'popular'
  const effectiveSort: 'newest' | 'popular' = (sortParam === 'newest' || sortParam === 'popular') ? sortParam : 'popular';
  const [sort, setSort] = useState<'newest' | 'popular'>(effectiveSort);
  
  // Set default sort to "popular" in URL if no sort param exists - run once on mount
  useEffect(() => {
    const currentSort = searchParams.get('sort');
    if (!currentSort || (currentSort !== 'newest' && currentSort !== 'popular')) {
      // Use replace to update URL without adding to history
      router.replace(`/communities/${communityId}/posts/${postId}?sort=popular`, { scroll: false });
    }
  }, [communityId, postId, router, searchParams]); // Include searchParams to react to URL changes
  
  // Update sort when URL param changes
  useEffect(() => {
    if (sortParam === 'newest' || sortParam === 'popular') {
      setSort(sortParam);
    } else {
      setSort('popular');
    }
  }, [sortParam]);

  useEffect(() => {
    // Fetch community name
    const fetchCommunity = async () => {
      try {
        const response = await fetch(`/api/communities/${communityId}`);
        const result = await response.json();
        if (result.success) {
          setCommunityName(result.community.name);
        }
      } catch (err) {
        console.error('Failed to fetch community:', err);
      }
    };
    
    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  const handleTabChange = (tab: 'home' | 'badges' | 'employees' | 'communities') => {
    // Navigate to home page with tab parameter
    if (tab === 'home') {
      router.push('/');
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  const handleCommunitySelect = (community: { name: string; code: string; flag: string; communityId?: string }) => {
    if (community.communityId) {
      router.push(`/communities/${community.communityId}`);
    }
  };

  const handleBack = () => {
    router.push(`/communities/${communityId}?sort=${sort}`);
  };

  const handleSortChange = (newSort: 'newest' | 'popular') => {
    setSort(newSort);
    // Update URL on current page with the selected sort
    router.replace(`/communities/${communityId}/posts/${postId}?sort=${newSort}`, { scroll: false });
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange} onCommunitySelect={handleCommunitySelect}>
      <div className="bg-white relative rounded-tl-[24px] rounded-tr-[24px] size-full">
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col gap-[32px] items-start pb-0 pt-[16px] px-[16px] relative size-full">
            {/* Back Arrow */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full max-w-3xl">
              <PostDetail 
                communityId={communityId} 
                postId={postId} 
                communityName={communityName}
                sort={effectiveSort}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function PostDetailPage() {
  return (
    <Suspense fallback={
      <Layout activeTab="home" onTabChange={() => {}} onCommunitySelect={() => {}}>
        <div className="bg-white relative rounded-tl-[24px] rounded-tr-[24px] size-full">
          <div className="size-full">
            <div className="box-border content-stretch flex flex-col items-center justify-center p-[40px] relative size-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </Layout>
    }>
      <PostDetailPageContent />
    </Suspense>
  );
}

