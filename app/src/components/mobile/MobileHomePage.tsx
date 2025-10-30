'use client'
import React from 'react'
import { useAccount } from 'wagmi'
import { useApp } from '@/context/AppContext'
import MobileCard from './MobileCard'
import MobileButton from './MobileButton'
import { MobileContainer, MobileSection } from './MobileLayout'
import ConnectWalletButtonWithRainbowkit from '../connect-wallets/ConnectWalletButtonWithRainbowkit'

export default function MobileHomePage() {
  const { isAuthenticated } = useApp()
  const { address, isConnected } = useAccount()

  return (
    <MobileContainer>
      {/* Hero Section */}
      <MobileSection>
        <div className="mobile-text-center mobile-py-2xl">
          <h1 className="mobile-text-4xl mobile-font-bold mobile-text-primary mobile-mb-lg">
            The trusted anon forum for everyone
          </h1>
          <p className="mobile-text-lg mobile-text-secondary mobile-mb-xl mobile-leading-relaxed">
            Prove real world attestations without revealing your identity.<br/>
            Join communities with verified peers.<br/>
            No room for bots, fakes and misinformation.
          </p>
          
          {!isConnected ? (
            <div className="mobile-flex mobile-flex-col mobile-items-center mobile-gap-md">
              <ConnectWalletButtonWithRainbowkit />
              <p className="mobile-text-sm mobile-text-tertiary">
                Connect your wallet to get started
              </p>
            </div>
          ) : (
            <div className="mobile-text-center">
              <p className="mobile-text-lg mobile-text-success mobile-mb-md">
                ✅ Wallet Connected
              </p>
              <p className="mobile-text-sm mobile-text-secondary">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}
        </div>
      </MobileSection>

      {/* Features Grid */}
      <MobileSection>
        <h2 className="mobile-text-2xl mobile-font-semibold mobile-text-primary mobile-mb-lg mobile-text-center">
          How it works
        </h2>
        <div className="mobile-grid mobile-grid-cols-1 mobile-gap-md">
          <MobileCard>
            <div className="mobile-p-md mobile-text-center">
              <div className="mobile-w-12 mobile-h-12 mobile-bg-primary mobile-rounded-full mobile-flex mobile-items-center mobile-justify-center mobile-mx-auto mobile-mb-md">
                <svg className="mobile-w-6 mobile-h-6 mobile-text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mobile-text-lg mobile-font-semibold mobile-text-primary mobile-mb-sm">
                Verify Your Identity
              </h3>
              <p className="mobile-text-sm mobile-text-secondary">
                Prove your company email, nationality, or age without revealing personal details
              </p>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="mobile-p-md mobile-text-center">
              <div className="mobile-w-12 mobile-h-12 mobile-bg-primary mobile-rounded-full mobile-flex mobile-items-center mobile-justify-center mobile-mx-auto mobile-mb-md">
                <svg className="mobile-w-6 mobile-h-6 mobile-text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mobile-text-lg mobile-font-semibold mobile-text-primary mobile-mb-sm">
                Join Communities
              </h3>
              <p className="mobile-text-sm mobile-text-secondary">
                Connect with verified peers in company, country, or age-based communities
              </p>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="mobile-p-md mobile-text-center">
              <div className="mobile-w-12 mobile-h-12 mobile-bg-primary mobile-rounded-full mobile-flex mobile-items-center mobile-justify-center mobile-mx-auto mobile-mb-md">
                <svg className="mobile-w-6 mobile-h-6 mobile-text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mobile-text-lg mobile-font-semibold mobile-text-primary mobile-mb-sm">
                Share Anonymously
              </h3>
              <p className="mobile-text-sm mobile-text-secondary">
                Post and comment while maintaining your privacy and anonymity
              </p>
            </div>
          </MobileCard>
        </div>
      </MobileSection>

      {/* Quick Stats */}
      {isConnected && (
        <MobileSection>
          <h2 className="mobile-text-xl mobile-font-semibold mobile-text-primary mobile-mb-md">
            Your Status
          </h2>
          <div className="mobile-grid mobile-grid-cols-2 mobile-gap-md">
            <MobileCard>
              <div className="mobile-p-md mobile-text-center">
                <div className="mobile-text-2xl mobile-font-bold mobile-text-primary mobile-mb-xs">
                  0
                </div>
                <div className="mobile-text-sm mobile-text-secondary">
                  Verified Badges
                </div>
              </div>
            </MobileCard>
            <MobileCard>
              <div className="mobile-p-md mobile-text-center">
                <div className="mobile-text-2xl mobile-font-bold mobile-text-primary mobile-mb-xs">
                  0
                </div>
                <div className="mobile-text-sm mobile-text-secondary">
                  Communities Joined
                </div>
              </div>
            </MobileCard>
          </div>
        </MobileSection>
      )}

      {/* Call to Action */}
      <MobileSection>
        <div className="mobile-text-center mobile-py-lg">
          <h2 className="mobile-text-xl mobile-font-semibold mobile-text-primary mobile-mb-md">
            Ready to get started?
          </h2>
          <p className="mobile-text-secondary mobile-mb-lg">
            Connect your wallet and start verifying your identity
          </p>
          {!isConnected && (
            <MobileButton
              size="lg"
              fullWidth
              onClick={() => {/* Handle connect wallet */}}
            >
              Connect Wallet
            </MobileButton>
          )}
        </div>
      </MobileSection>
    </MobileContainer>
  )
}
