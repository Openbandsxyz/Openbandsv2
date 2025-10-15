"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useCompanyPosts } from '@/lib/supabase';
import { PostComposer } from '@/components/PostComposer';
import { PostCard } from '@/components/PostCard';
import Link from 'next/link';

export default function CompanyPage() {
  const params = useParams<{ domain: string }>();
  const domain = params?.domain || '';
  
  const { isAuthenticated, anonymousId, companyDomain, signOut } = useApp();
  const [sort, setSort] = useState<'new' | 'hot'>('new');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  
  // Fetch posts for this specific company
  const { posts, loading, error, refetch } = useCompanyPosts(domain, sort);

  const canPost = isAuthenticated && companyDomain === domain;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false);
      }
      if (showHelpPopup) {
        setShowHelpPopup(false);
      }
    };

    if (showDropdown || showHelpPopup) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown, showHelpPopup]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          {/* First Row: Filter + Help, Connect Wallet */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Filter Dropdown + Help Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-200 transition-colors min-w-[70px]"
                >
                  <span>{sort === 'new' ? 'New' : 'Hot'}</span>
                  <svg 
                    className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <button
                      onClick={() => {
                        setSort('new');
                        setShowDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-base font-semibold hover:bg-gray-50 first:rounded-t-lg transition-colors ${
                        sort === 'new' ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => {
                        setSort('hot');
                        setShowDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-base font-semibold hover:bg-gray-50 last:rounded-b-lg transition-colors ${
                        sort === 'hot' ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
                      }`}
                    >
                      Hot
                    </button>
                  </div>
                )}
              </div>

              {/* Help Button */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowHelpPopup(!showHelpPopup)}
                  className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Help"
                >
                  <span className="text-xs font-semibold">?</span>
                </button>
                
                {showHelpPopup && (
                  <div className="absolute top-full left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-3">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">About Openbands</h3>
                    <p className="text-xs text-gray-600 mb-2">Join verified workplace conversations without giving up your privacy. With zero-knowledge proofs, your identity stays yours — all that&rsquo;s revealed is the company you work for.</p>
                    <ul className="text-xs text-gray-600 space-y-2 mb-2">
                    <li>• <span className="font-medium">Verified, not exposed</span> <br></br>Prove your company affiliation with your Google email, without sharing it.</li>
                      <li>• <span className="font-medium">True anonymity</span> <br></br>Post and comment freely, your name never appears.</li>
                      <li>• <span className="font-medium">Company-first feeds</span><br></br>See what’s trending inside your company, filter by New or Hot.</li>
                      <li>• <span className="font-medium">Cross-company insights</span><br></br>Search other domains to explore their discussions.</li>
                      <li>• <span className="font-medium">Privacy by design</span><br></br>Your data never leaves your device.</li>
                    </ul>
                    <p className="text-[11px] text-gray-500">Openbands is where employees speak their minds — anonymous. verified. raw.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Connect Wallet Button */}
            <div className="flex-shrink-0">
              {isAuthenticated ? (
                <button
                  onClick={signOut}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label="Sign out"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              ) : (
                <Link 
                  href="/"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
          
          {/* Company Info and Back Link */}
          <div className="text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">
              ← Back to feed
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{domain}</h1>
            <p className="text-sm text-gray-600">Company discussion</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        {canPost ? (
          <PostComposer onPosted={() => refetch({ silent: true })} />
        ) : !isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-6">
              <p className="text-gray-600 mb-2">
                Sign in to post to this company page.
              </p>
              <Link 
                href="/"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
              >
                Sign In to Post
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-6">
              <p className="text-gray-600 mb-2">
                Only users from <span className="font-semibold">{domain}</span> can post here.
              </p>
              <p className="text-sm text-gray-500">
                Your company: <span className="font-medium">{companyDomain || 'Unknown'}</span>
              </p>
              {companyDomain && companyDomain !== domain && (
                <Link 
                  href={`/company/${companyDomain}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
                >
                  Go to your company page
                </Link>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-sm text-gray-600">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Error loading posts</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <p className="text-gray-500 mb-2">No posts yet for {domain}</p>
              <p className="text-sm text-gray-400">
                {canPost 
                  ? "Be the first to post something!" 
                  : "Check back later for updates from this company."
                }
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onLiked={() => refetch({ silent: true })} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
