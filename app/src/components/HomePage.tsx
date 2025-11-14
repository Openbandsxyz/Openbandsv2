"use client";
import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { SignInPanel } from '@/components/SignInPanel';

export default function HomePage() {
  const { isAuthenticated } = useApp();
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="flex-1 bg-white">

      {/* Main Content */}
      <div className="py-4 pl-6 space-y-4">
        {/* Hero Section */}
        <div className="text-center pt-6 pb-2">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Building communities of real humans
            </h2>
            <p className="text-lg text-gray-600 mb-0 leading-relaxed">
              Prove real world attributes without revealing your identity.<br/>
              Join communities with verified peers.<br/> No room for bots, fakes and misinformation.              
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Verified</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Prove real world attributes such as nationality, age or company affiliation.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Anonymous</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              With zero-knowledge proofs, your identity and personal information remains private.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Authentic</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Discuss political, social or company-specific topics with your verified peers.
            </p>
          </div>

        </div>

        {/* How it works */}
        <div className="bg-blue-50 rounded-lg p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">How it works</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-white">1</span>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">Connect Wallet</h4>
              <p className="text-gray-600 text-xs">Use your EVM wallet to connect and verify attributes onchain</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-white">2</span>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">Verify Attributes</h4>
              <p className="text-gray-600 text-xs">Prove real world attributes without revealing personal information</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-lg font-bold text-white">3</span>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-1">Join Communities</h4>
              <p className="text-gray-600 text-xs">Participate in verified communities with proof-of-membership</p>
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
