/**
 * OpenBands v2 - Community List Component
 * 
 * Displays a list of communities with stats and filtering.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Community {
  id: string;
  community_id: string;
  name: string;
  description: string;
  attestation_type: string;
  attestation_value: string;
  creator_address: string;
  member_count: number;
  post_count: number;
  last_post_at: string | null;
  created_at: string;
}

interface CommunityListProps {
  attestationType?: 'nationality' | 'age' | 'company' | 'all';
  sort?: 'newest' | 'popular' | 'active';
  limit?: number;
}

export function CommunityList({ 
  attestationType = 'all', 
  sort = 'newest',
  limit = 20
}: CommunityListProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchCommunities();
  }, [attestationType, sort, page]);
  
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });
      
      if (attestationType !== 'all') {
        params.append('attestationType', attestationType);
      }
      
      console.log(`[Community List] Fetching communities: ${params.toString()}`);
      
      const response = await fetch(`/api/communities?${params.toString()}`);
      const result = await response.json();
      
      console.log('[Community List] API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch communities');
      }
      
      setCommunities(result.communities || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error('[Community List] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };
  
  const getBadgeLabel = (type: string, value: string) => {
    switch (type) {
      case 'nationality':
        return `🌍 ${value}`;
      case 'company':
        return `🏢 ${value}`;
      case 'age':
        return `🎂 18+`;
      default:
        return value;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };
  
  if (loading && communities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading communities...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={() => fetchCommunities()}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No communities found</p>
        <p className="text-sm text-gray-400">Be the first to create one!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Community Cards */}
      <div className="grid gap-4">
        {communities.map((community) => (
          <Link
            key={community.id}
            href={`/communities/${community.community_id}`}
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {community.name}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {getBadgeLabel(community.attestation_type, community.attestation_value)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {community.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>👥 {community.member_count} {community.member_count === 1 ? 'member' : 'members'}</span>
                  <span>📝 {community.post_count} {community.post_count === 1 ? 'post' : 'posts'}</span>
                  <span>📅 Created {formatDate(community.created_at)}</span>
                  {community.last_post_at && (
                    <span>💬 Last post {formatDate(community.last_post_at)}</span>
                  )}
                </div>
              </div>
              
              <div className="ml-4">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
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

