/**
 * OpenBands v2 - Post Feed Component
 * 
 * Displays a feed of posts from a community.
 */

'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string | null;
  content: string;
  author_anonymous_id: string;
  like_count: number;
  comment_count: number;
  created_at: string;
}

interface PostFeedProps {
  communityId: string;
  sort?: 'newest' | 'hot' | 'top';
  refreshTrigger?: number;
}

export function PostFeed({ communityId, sort = 'newest', refreshTrigger = 0 }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
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
  
  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={() => fetchPosts()}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-2">No posts yet</p>
        <p className="text-sm text-gray-400">Be the first to share something!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">👤</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {post.author_anonymous_id}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                </div>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="mb-3">
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
              )}
              <p className="text-gray-700 whitespace-pre-wrap break-words">
                {post.content}
              </p>
            </div>
            
            {/* Post Actions */}
            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <span>👍</span>
                <span>{post.like_count}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <span>💬</span>
                <span>{post.comment_count}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
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

