'use client'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import MobileCard from './MobileCard'
import MobileButton from './MobileButton'
import MobileInput from './MobileInput'
import { MobileContainer, MobileSection } from './MobileLayout'
import ConnectWalletButtonWithRainbowkit from '../connect-wallets/ConnectWalletButtonWithRainbowkit'

type ProfileSection = 'badges' | 'create' | 'settings'

export default function MobileProfilePage() {
  const { address, isConnected } = useAccount()
  const [activeSection, setActiveSection] = useState<ProfileSection>('badges')

  const sections = [
    { id: 'badges' as const, label: 'Badges', icon: '🏷️' },
    { id: 'create' as const, label: 'Create', icon: '✍️' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙️' }
  ]

  if (!isConnected) {
    return (
      <MobileContainer>
        <MobileSection>
          <div className="mobile-text-center mobile-py-2xl">
            <div className="mobile-w-16 mobile-h-16 mobile-bg-surface mobile-rounded-full mobile-flex mobile-items-center mobile-justify-center mobile-mx-auto mobile-mb-lg">
              <svg className="mobile-w-8 mobile-h-8 mobile-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mobile-text-xl mobile-font-semibold mobile-text-primary mobile-mb-md">
              Connect Your Wallet
            </h2>
            <p className="mobile-text-secondary mobile-mb-lg">
              Connect your wallet to manage your profile and badges
            </p>
            <ConnectWalletButtonWithRainbowkit />
          </div>
        </MobileSection>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer>
      {/* Profile Header */}
      <MobileSection>
        <div className="mobile-text-center mobile-mb-lg">
          <div className="mobile-w-20 mobile-h-20 mobile-bg-primary mobile-rounded-full mobile-flex mobile-items-center mobile-justify-center mobile-mx-auto mobile-mb-md">
            <span className="mobile-text-3xl">👤</span>
          </div>
          <h1 className="mobile-text-xl mobile-font-semibold mobile-text-primary mobile-mb-xs">
            Your Profile
          </h1>
          <p className="mobile-text-sm mobile-text-secondary">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </MobileSection>

      {/* Section Tabs */}
      <MobileSection>
        <div className="mobile-flex mobile-gap-sm mobile-mb-lg">
          {sections.map((section) => (
            <MobileButton
              key={section.id}
              size="sm"
              variant={activeSection === section.id ? 'primary' : 'secondary'}
              onClick={() => setActiveSection(section.id)}
              className="mobile-flex-1"
            >
              <span className="mobile-mr-xs">{section.icon}</span>
              {section.label}
            </MobileButton>
          ))}
        </div>
      </MobileSection>

      {/* Section Content */}
      {activeSection === 'badges' && <BadgesSection />}
      {activeSection === 'create' && <CreateSection />}
      {activeSection === 'settings' && <SettingsSection />}
    </MobileContainer>
  )
}

// Badges Section Component
function BadgesSection() {
  const mockBadges = [
    { id: '1', name: 'Company Email', type: 'company', verified: true, domain: 'openbands.xyz' },
    { id: '2', name: 'Nationality', type: 'nationality', verified: true, country: 'Germany' },
    { id: '3', name: 'Age Verification', type: 'age', verified: false, age: '18+' }
  ]

  return (
    <MobileSection>
      <div className="mobile-space-y-md">
        <div className="mobile-flex mobile-justify-between mobile-items-center">
          <h2 className="mobile-text-lg mobile-font-semibold mobile-text-primary">
            Your Badges
          </h2>
          <MobileButton size="sm">
            Add Badge
          </MobileButton>
        </div>

        {mockBadges.map((badge) => (
          <MobileCard key={badge.id}>
            <div className="mobile-p-md">
              <div className="mobile-flex mobile-items-center mobile-justify-between mobile-mb-sm">
                <div className="mobile-flex mobile-items-center mobile-gap-sm">
                  <div className={`mobile-w-3 mobile-h-3 mobile-rounded-full ${
                    badge.verified ? 'mobile-bg-success' : 'mobile-bg-tertiary'
                  }`} />
                  <h3 className="mobile-text-base mobile-font-medium mobile-text-primary">
                    {badge.name}
                  </h3>
                </div>
                <span className={`mobile-text-xs mobile-px-sm mobile-py-xs mobile-rounded ${
                  badge.verified 
                    ? 'mobile-bg-success mobile-text-white' 
                    : 'mobile-bg-surface mobile-text-secondary'
                }`}>
                  {badge.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              
              {badge.verified && (
                <p className="mobile-text-sm mobile-text-secondary">
                  {badge.type === 'company' && `Domain: ${badge.domain}`}
                  {badge.type === 'nationality' && `Country: ${badge.country}`}
                  {badge.type === 'age' && `Age: ${badge.age}`}
                </p>
              )}
            </div>
          </MobileCard>
        ))}
      </div>
    </MobileSection>
  )
}

// Create Section Component
function CreateSection() {
  const [postContent, setPostContent] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('')

  const communities = [
    { id: '1', name: 'Germany', flag: '🇩🇪' },
    { id: '2', name: 'Base Protocol', flag: '🔵' },
    { id: '3', name: '18+ Verified', flag: '🔞' }
  ]

  return (
    <MobileSection>
      <div className="mobile-space-y-md">
        <h2 className="mobile-text-lg mobile-font-semibold mobile-text-primary">
          Create Post
        </h2>

        <MobileCard>
          <div className="mobile-p-md mobile-space-y-md">
            <MobileInput
              label="Select Community"
              value={selectedCommunity}
              onChange={setSelectedCommunity}
              placeholder="Choose a community..."
            />

            <div>
              <label className="mobile-text-sm mobile-font-medium mobile-text-primary mobile-mb-sm mobile-block">
                Post Content
              </label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="mobile-input mobile-min-h-24 mobile-resize-none"
                rows={4}
              />
            </div>

            <div className="mobile-flex mobile-gap-sm">
              <MobileButton size="sm" variant="outline">
                Save Draft
              </MobileButton>
              <MobileButton size="sm" className="mobile-flex-1">
                Post
              </MobileButton>
            </div>
          </div>
        </MobileCard>

        {/* Drafts */}
        <div>
          <h3 className="mobile-text-base mobile-font-medium mobile-text-primary mobile-mb-sm">
            Drafts
          </h3>
          <div className="mobile-space-y-sm">
            <MobileCard>
              <div className="mobile-p-md">
                <p className="mobile-text-sm mobile-text-secondary mobile-mb-xs">
                  Germany • 2 hours ago
                </p>
                <p className="mobile-text-sm mobile-text-primary">
                  This is a draft post about...
                </p>
              </div>
            </MobileCard>
          </div>
        </div>
      </div>
    </MobileSection>
  )
}

// Settings Section Component
function SettingsSection() {
  return (
    <MobileSection>
      <div className="mobile-space-y-md">
        <h2 className="mobile-text-lg mobile-font-semibold mobile-text-primary">
          Settings
        </h2>

        <div className="mobile-space-y-sm">
          <MobileCard>
            <div className="mobile-p-md">
              <h3 className="mobile-text-base mobile-font-medium mobile-text-primary mobile-mb-sm">
                Privacy
              </h3>
              <p className="mobile-text-sm mobile-text-secondary mobile-mb-md">
                Control your privacy settings and data sharing
              </p>
              <MobileButton size="sm" variant="outline">
                Manage Privacy
              </MobileButton>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="mobile-p-md">
              <h3 className="mobile-text-base mobile-font-medium mobile-text-primary mobile-mb-sm">
                Notifications
              </h3>
              <p className="mobile-text-sm mobile-text-secondary mobile-mb-md">
                Configure how you receive notifications
              </p>
              <MobileButton size="sm" variant="outline">
                Notification Settings
              </MobileButton>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="mobile-p-md">
              <h3 className="mobile-text-base mobile-font-medium mobile-text-primary mobile-mb-sm">
                Help & Support
              </h3>
              <p className="mobile-text-sm mobile-text-secondary mobile-mb-md">
                Get help or contact support
              </p>
              <MobileButton size="sm" variant="outline">
                Get Help
              </MobileButton>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="mobile-p-md">
              <h3 className="mobile-text-base mobile-font-medium mobile-text-primary mobile-mb-sm">
                About
              </h3>
              <p className="mobile-text-sm mobile-text-secondary mobile-mb-md">
                App version 2.0.0
              </p>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="mobile-p-md">
              <MobileButton size="sm" variant="outline" className="mobile-w-full">
                Sign Out
              </MobileButton>
            </div>
          </MobileCard>
        </div>
      </div>
    </MobileSection>
  )
}
