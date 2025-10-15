"use client";
import { useCountryPosts } from '@/lib/supabase';
import { CountryPost } from '@/lib/supabase';

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

  return (
    <div className="flex-1 bg-white">
      {/* Community Header */}
      <div className="border-b border-gray-200 px-6 py-6">
        <div className="flex items-start space-x-4">
          {/* Community Icon/Flag */}
          <div className="w-20 h-20 rounded-full shadow-lg border-2 border-gray-200 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {country.flag}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Community</span>
            </div>
            
            {/* Country Name */}
            <div className="mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{country.name}</h1>
            </div>
              
            <p className="text-gray-600 mb-4 max-w-2xl">
              This is a space for verified citizens to have candid conversations about national issues, government policies, 
              social concerns, and community initiatives that matter to {country.name} residents.
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Join</span>
              </button>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Gated</span>
              </div>
            </div>

            {/* Badge Requirements */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-600">
                  To join this community, you must have the following badge
                </span>
              </div>
              
              {/* Badge Display */}
              <div className="flex items-center space-x-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>@{country.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-sm text-gray-600">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Error loading posts</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-sm text-gray-600 mb-4">Be the first to share something in the {country.name} community!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <CountryPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}