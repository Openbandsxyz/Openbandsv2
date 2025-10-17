"use client";
import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { SignInPanel } from '@/components/SignInPanel';

export default function HomePage() {
  const { isAuthenticated } = useApp();
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Openbands</h1>
        <p className="text-gray-600 mt-1">The anonymous forum for verified employees</p>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Anonymous. Verified. Raw.
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join verified workplace conversations without giving up your privacy. 
              With zero-knowledge proofs, your identity stays yours — all that&apos;s revealed is the company you work for.
            </p>
            
            {!isAuthenticated && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowSignIn(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
                <p className="text-sm text-gray-500">Sign in with your work email to continue</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified, not exposed</h3>
            <p className="text-gray-600 text-sm">
              Prove your company affiliation with your Google email, without sharing it.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">True anonymity</h3>
            <p className="text-gray-600 text-sm">
              Post and comment freely, your name never appears.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Company-first feeds</h3>
            <p className="text-gray-600 text-sm">
              See what&apos;s trending inside your company, filter by New or Hot.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-company insights</h3>
            <p className="text-gray-600 text-sm">
              Search other domains to explore their discussions.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy by design</h3>
            <p className="text-gray-600 text-sm">
              Your data never leaves your device.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global communities</h3>
            <p className="text-gray-600 text-sm">
              Connect with employees from different countries and companies.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h4>
              <p className="text-gray-600 text-sm">Link your crypto wallet to get started</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Sign in with Google</h4>
              <p className="text-gray-600 text-sm">Verify your work email securely</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Generate ZK Proof</h4>
              <p className="text-gray-600 text-sm">Create anonymous proof of membership</p>
            </div>
          </div>
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
