"use client";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConnectWalletButtonWithRainbowkit from '@/components/connect-wallets/ConnectWalletButtonWithRainbowkit';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'badges' | 'employees' | 'communities';
  onTabChange?: (tab: 'home' | 'badges' | 'employees' | 'communities') => void;
  onCommunitySelect?: (community: { name: string; code: string; flag: string }) => void;
}

export default function Layout({ children, activeTab = 'home', onTabChange, onCommunitySelect }: LayoutProps) {
  const { isAuthenticated, anonymousId, companyDomain, signOut } = useApp();
  const [showCommunities, setShowCommunities] = useState(false);
  const router = useRouter();

  const communities = [
    { name: 'United States', code: 'US', flag: '🇺🇸' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪' },
    { name: 'France', code: 'FR', flag: '🇫🇷' },
    { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  ];

  const handleEmployeesClick = () => {
    onTabChange?.('employees');
    // This will trigger the existing authentication workflow
    // The main content will show the "Want to share something? Sign in with your work email to post" flow
  };

  const handleCommunityClick = (community: { name: string; code: string; flag: string }) => {
    // Navigate to community-specific page or filter
    onTabChange?.('communities');
    // Pass the selected community to the parent component
    onCommunitySelect?.(community);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Title */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Openbands</h1>
          <p className="text-sm text-gray-600 mt-1">Anonymous. Verified. Raw.</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Home */}
          <button
            onClick={() => onTabChange?.('home')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'home' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Home</span>
          </button>

          {/* My Badges */}
          <button
            onClick={() => onTabChange?.('badges')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'badges' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="font-medium">My Badges</span>
          </button>

          {/* For Employees */}
          <button
            onClick={handleEmployeesClick}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'employees' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">For employees</span>
          </button>

          {/* Communities */}
          <div className="space-y-1">
            <button
              onClick={() => setShowCommunities(!showCommunities)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'communities' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">Communities</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${showCommunities ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Communities List */}
            {showCommunities && (
              <div className="ml-6 space-y-1">
                {communities.map((community) => (
                  <button
                    key={community.code}
                    onClick={() => handleCommunityClick(community)}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-lg">{community.flag}</span>
                    <span>{community.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Right Wallet Button */}
        <div className="absolute top-4 right-4 z-10">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-700">{anonymousId}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{companyDomain}</span>
              </div>
              <button
                onClick={signOut}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Sign out"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <ConnectWalletButtonWithRainbowkit />
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
