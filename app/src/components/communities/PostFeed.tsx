/**
 * OpenBands v2 - Post Feed Component
 * 
 * Displays a feed of posts from a community.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

interface Post {
  id: string;
  title: string | null;
  content: string;
  author_anonymous_id: string;
  author_address?: string; // For fetching badges
  upvote_count: number;
  comment_count: number;
  created_at: string;
  community_name?: string; // Community name for tag
}

// Icon Components
function IconMessageSquare() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[12.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <path 
            d="M2 2H12V10H6L2 14V2Z" 
            stroke="rgba(24, 24, 27, 1)" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.33" 
          />
        </svg>
      </div>
    </div>
  );
}

function IconUsers() {
  return (
    <div className="overflow-clip relative shrink-0 size-[14px]">
      <div className="absolute inset-[12.5%_8.33%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 12">
          <path 
            d="M9 9.5C9.82843 9.5 10.5 8.82843 10.5 8C10.5 7.17157 9.82843 6.5 9 6.5C8.17157 6.5 7.5 7.17157 7.5 8C7.5 8.82843 8.17157 9.5 9 9.5Z M4 9.5C4.82843 9.5 5.5 8.82843 5.5 8C5.5 7.17157 4.82843 6.5 4 6.5C3.17157 6.5 2.5 7.17157 2.5 8C2.5 8.82843 3.17157 9.5 4 9.5Z M9 5.5C10.3807 5.5 11.5 4.38071 11.5 3C11.5 1.61929 10.3807 0.5 9 0.5C7.61929 0.5 6.5 1.61929 6.5 3C6.5 4.38071 7.61929 5.5 9 5.5Z M4 5.5C5.38071 5.5 6.5 4.38071 6.5 3C6.5 1.61929 5.38071 0.5 4 0.5C2.61929 0.5 1.5 1.61929 1.5 3C1.5 4.38071 2.61929 5.5 4 5.5Z" 
            stroke="rgba(59, 130, 246, 1)" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.2" 
          />
        </svg>
      </div>
    </div>
  );
}

function IconArrowUpLarge() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]">
      <div className="absolute inset-[12.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <path 
            d="M7 3.5V10.5M7 3.5L3.5 7M7 3.5L10.5 7" 
            stroke="rgba(24, 24, 27, 1)" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
          />
        </svg>
      </div>
    </div>
  );
}

function IconMail({ verified = false }: { verified?: boolean }) {
  return (
    <div className="overflow-clip relative shrink-0 size-[11px]">
      <div className="absolute inset-[16.67%_8.33%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 9">
          <path 
            d="M1 1H10V8H1V1Z M1 1L5.5 4.5L10 1" 
            stroke={verified ? "rgba(42, 157, 144, 1)" : "rgba(113, 113, 122, 1)"} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.2" 
          />
        </svg>
      </div>
    </div>
  );
}

// Post Card Component matching the design
function PostCard({ post, formatTimestamp, communityId, onUpvote }: { post: Post; formatTimestamp: (date: string) => string; communityId: string; onUpvote?: (postId: string) => void }) {
  const router = useRouter();
  
  // Generate author name from anonymous ID
  const authorName = post.author_anonymous_id.startsWith('Anon-') 
    ? `User${post.author_anonymous_id.slice(-4)}` 
    : post.author_anonymous_id;

  // Placeholder for author badges - can be enhanced to fetch from API
  const authorBadges: Array<{ domain: string; verified: boolean }> = []; // TODO: Fetch from API

  const handleClick = () => {
    router.push(`/communities/${communityId}/posts/${post.id}`);
  };

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking upvote
    if (onUpvote) {
      onUpvote(post.id);
    }
  };

  return (
    <div 
      className="bg-white min-w-[85px] relative rounded-[6px] shrink-0 w-full cursor-pointer hover:bg-zinc-50 transition-colors"
      onClick={handleClick}
    >
      <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
      <div className="min-w-inherit size-full">
        <div className="box-border content-stretch flex gap-[16px] items-start min-w-inherit p-[14px] relative w-full">
          <div className="basis-0 content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px relative shrink-0">
            {/* Header: Title and Timestamp in same row */}
            <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
              {post.title && (
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 flex-1 min-w-0" data-name="Card / Header">
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] not-italic relative shrink-0 text-[18px] text-zinc-950 break-words overflow-wrap-break-word">
                    {post.title}
                  </p>
                </div>
              )}
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0 ml-2">
                <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[10px] text-nowrap text-zinc-500">
                  <p className="leading-none overflow-ellipsis overflow-hidden whitespace-pre">{formatTimestamp(post.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-zinc-900 w-full whitespace-pre-wrap break-words overflow-wrap-break-word">
              {post.content}
            </p>

            {/* Author + Badges */}
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
              {/* Author */}
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                <div className="content-stretch flex gap-[2px] items-center relative shrink-0">
                  <div className="bg-green-500 rounded-[9999px] shrink-0 size-[20px]" data-name="Avatar" />
                </div>
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-950 whitespace-pre">
                  {authorName}
                </p>
                <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-950 whitespace-pre">·</p>
              </div>

              {/* Author Badges */}
              {authorBadges.length > 0 && (
                <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                  {authorBadges.map((badge, idx) => (
                    <div key={idx} className="content-stretch flex items-start relative rounded-[12px] shrink-0" data-name="Badge">
                      <div className="bg-neutral-50 box-border content-stretch flex gap-[8px] items-center justify-center px-[10px] py-[2px] relative rounded-[12px] shrink-0" data-name="Badge">
                        <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[12px]" />
                        <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                          <IconMail verified={badge.verified} />
                          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900 whitespace-pre">
                            @{badge.domain}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer: Upvote + Comment */}
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
              {/* Upvote Button */}
              <button
                onClick={handleUpvoteClick}
                className="bg-white box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0 cursor-pointer hover:bg-zinc-50 transition-colors"
                data-name="Button"
              >
                <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                <IconArrowUpLarge />
                <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900">
                  <p className="leading-[20px] whitespace-pre">{post.upvote_count || 0}</p>
                </div>
              </button>

              {/* Comment Button */}
              <div className="bg-white box-border content-stretch flex gap-[8px] h-[36px] items-center justify-center px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="Button">
                <div aria-hidden="true" className="absolute border border-solid border-zinc-200 inset-0 pointer-events-none rounded-[6px]" />
                <IconMessageSquare />
                <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-900">
                  <p className="leading-[20px] whitespace-pre">{post.comment_count || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PostFeedProps {
  communityId: string;
  communityName?: string;
  sort?: 'newest' | 'popular';
  refreshTrigger?: number;
  onSortChange?: (sort: 'newest' | 'popular') => void;
}

export function PostFeed({ communityId, communityName, sort: initialSort = 'popular', refreshTrigger = 0, onSortChange }: PostFeedProps) {
  const { address } = useAccount();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Always default to 'popular' - ensure initialSort is valid
  const validInitialSort: 'newest' | 'popular' = (initialSort === 'newest' || initialSort === 'popular') ? initialSort : 'popular';
  const [sort, setSort] = useState<'newest' | 'popular'>(validInitialSort);
  
  // Update sort when initialSort prop changes
  useEffect(() => {
    const newSort: 'newest' | 'popular' = (initialSort === 'newest' || initialSort === 'popular') ? initialSort : 'popular';
    setSort(newSort);
  }, [initialSort]);
  
  useEffect(() => {
    fetchPosts();
  }, [communityId, sort, page, refreshTrigger]);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort,
      });
      
      console.log(`[Post Feed] Fetching posts for ${communityId}: ${params.toString()}`);
      
      const response = await fetch(`/api/communities/${communityId}/posts?${params.toString()}`);
      const result = await response.json();
      
      console.log('[Post Feed] API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch posts');
      }
      
      setPosts(result.posts || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error('[Post Feed] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleUpvote = async (postId: string) => {
    if (!address) {
      alert('Please connect your wallet to upvote');
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to upvote');
      }

      // Update post with new upvote count
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, upvote_count: result.upvoteCount } : p
      ));
    } catch (err) {
      console.error('[Post Feed] Error upvoting:', err);
      alert(err instanceof Error ? err.message : 'Failed to upvote');
    }
  };
  
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      {/* Tabs - Always show, even when loading or empty */}
      <div className="backdrop-blur-sm backdrop-filter bg-zinc-100 box-border content-stretch cursor-pointer flex h-[32px] items-center max-h-[32px] p-[4px] relative rounded-[8px] shrink-0" data-name="Tabs">
        <button 
          className={`box-border content-stretch flex gap-[8px] h-full items-center justify-center overflow-visible px-[12px] py-[4px] relative rounded-[6px] shrink-0 ${sort === 'popular' ? 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]' : ''}`}
          onClick={() => {
            setSort('popular');
            if (onSortChange) {
              onSortChange('popular');
            }
          }}
          data-name="Tabs / Trigger"
        >
          <p className={`font-['Inter:Medium',sans-serif] font-medium leading-none not-italic relative shrink-0 text-[12px] text-center text-nowrap whitespace-pre ${sort === 'popular' ? 'text-zinc-900' : 'text-zinc-500'}`}>
            Popular
          </p>
        </button>
        <button 
          className={`box-border content-stretch flex gap-[8px] h-full items-center justify-center overflow-visible px-[12px] py-[4px] relative rounded-[6px] shrink-0 ${sort === 'newest' ? 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]' : ''}`}
          onClick={() => {
            setSort('newest');
            if (onSortChange) {
              onSortChange('newest');
            }
          }}
          data-name="Tabs / Trigger"
        >
          <p className={`font-['Inter:Medium',sans-serif] font-medium leading-none not-italic relative shrink-0 text-[12px] text-center text-nowrap whitespace-pre ${sort === 'newest' ? 'text-zinc-900' : 'text-zinc-500'}`}>
            Most recent
          </p>
        </button>
      </div>

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <div className="flex items-center justify-center py-12 w-full">
          <div className="text-gray-500">Loading posts...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg w-full">
          <p className="text-red-700">Error: {error}</p>
          <button
            onClick={() => fetchPosts()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
          <p className="text-gray-500 mb-2">No posts yet</p>
          <p className="text-sm text-gray-400">Be the first to share something!</p>
        </div>
      )}

      {/* Posts */}
      {!error && posts.length > 0 && (
        <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} formatTimestamp={formatTimestamp} communityId={communityId} onUpvote={handleUpvote} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

