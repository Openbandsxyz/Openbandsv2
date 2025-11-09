"use client";
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { usePosts, useCompanies } from '@/lib/supabase';
import { SignInPanel } from '@/components/SignInPanel';
import { PostComposer } from '@/components/PostComposer';
import { PostCard } from '@/components/PostCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MainContent() {
  const { isAuthenticated, anonymousId, companyDomain, signOut } = useApp();
  const [sort, setSort] = useState<'new' | 'hot'>('new');
  const [showSignIn, setShowSignIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const router = useRouter();

  // Fetch posts from Supabase
  const { posts, loading, error, refetch } = usePosts(sort);
  
  // Fetch companies for search
  const { companies } = useCompanies();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false);
      }
      if (showSearchDropdown) {
        setShowSearchDropdown(false);
      }
      if (showHelpPopup) {
        setShowHelpPopup(false);
      }
    };

    if (showDropdown || showSearchDropdown || showHelpPopup) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown, showSearchDropdown, showHelpPopup]);

  // Filter companies based on search query (starts with)
  const filteredCompanies = companies.filter(company =>
    company.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  // Handle company selection
  const handleCompanySelect = (company: string) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    // Navigate to company page using Next.js router
    router.push(`/company/${company}`);
  };

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-200 transition-colors min-w-[70px]"
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
            <div className="relative">
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
                  <p className="text-xs text-gray-600 mb-2">Join verified workplace conversations without giving up your privacy. With zero-knowledge proofs, your identity stays yours — all that&apos;s revealed is the company you work for.</p>
                  <ul className="text-xs text-gray-600 space-y-2 mb-2">
                    <li>• <span className="font-medium">Verified, not exposed</span> <br></br>Prove your company affiliation with your Google email, without sharing it.</li>
                    <li>• <span className="font-medium">True anonymity</span> <br></br>Post and comment freely, your name never appears.</li>
                    <li>• <span className="font-medium">Company-first feeds</span><br></br>See what&apos;s trending inside your company, filter by New or Hot.</li>
                    <li>• <span className="font-medium">Cross-company insights</span><br></br>Search other domains to explore their discussions.</li>
                    <li>• <span className="font-medium">Privacy by design</span><br></br>Your data never leaves your device.</li>
                  </ul>
                  <p className="text-[11px] text-gray-500">Openbands is where employees speak their minds — anonymous. verified. raw.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search by company"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) {
                setShowSearchDropdown(true);
              }
            }}
            className="w-full px-3 py-2 pl-8 text-sm bg-gray-100 border-0 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          <svg 
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          {/* Search Results Dropdown */}
          {showSearchDropdown && filteredCompanies.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
              {filteredCompanies.slice(0, 10).map((company) => (
                <button
                  key={company}
                  onClick={() => handleCompanySelect(company)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-800">{company}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* No Results */}
          {showSearchDropdown && searchQuery.length > 0 && filteredCompanies.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No companies found
              </div>
            </div>
          )}
        </div>
        
        {/* User Info Bar - only show when authenticated */}
        {isAuthenticated && anonymousId && companyDomain && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                {companyDomain}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-600">{anonymousId}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href={`/company/${companyDomain}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                My Company →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="py-6 space-y-4">
        {/* Post Composer - only show when authenticated */}
        {isAuthenticated && anonymousId && companyDomain ? (
          <PostComposer onPosted={() => refetch({ silent: true })} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Want to share something?</h3>
              <p className="text-xs text-gray-600 mb-3">Sign in with your work email to post</p>
              <button
                onClick={() => setShowSignIn(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Sign In to Post
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
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
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-sm text-gray-600 mb-4">Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onLiked={() => refetch({ silent: true })} />
            ))
          )}
        </div>
      </div>

      {/* Sign In Modal */}
      {showSignIn && !isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSignIn(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Sign In</h2>
                <button
                  onClick={() => setShowSignIn(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SignInPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
