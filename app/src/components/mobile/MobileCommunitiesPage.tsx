'use client'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import MobileCard from './MobileCard'
import MobileInput from './MobileInput'
import MobileButton from './MobileButton'
import { MobileContainer, MobileSection } from './MobileLayout'

interface Community {
  id: string
  name: string
  description: string
  memberCount: number
  verificationRequired: string[]
  isJoined: boolean
  flag?: string
}

const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Germany',
    description: 'Verified German citizens discussing national issues',
    memberCount: 1247,
    verificationRequired: ['nationality'],
    isJoined: false,
    flag: '🇩🇪'
  },
  {
    id: '2',
    name: 'Base Protocol',
    description: 'Base ecosystem builders and contributors',
    memberCount: 892,
    verificationRequired: ['company'],
    isJoined: true,
    flag: '🔵'
  },
  {
    id: '3',
    name: '18+ Verified',
    description: 'Age-verified community for mature discussions',
    memberCount: 2156,
    verificationRequired: ['age'],
    isJoined: false,
    flag: '🔞'
  },
  {
    id: '4',
    name: 'Japan',
    description: 'Japanese citizens and residents',
    memberCount: 543,
    verificationRequired: ['nationality'],
    isJoined: false,
    flag: '🇯🇵'
  },
  {
    id: '5',
    name: 'Ethereum Foundation',
    description: 'EF employees and contributors',
    memberCount: 234,
    verificationRequired: ['company'],
    isJoined: true,
    flag: '🟣'
  }
]

export default function MobileCommunitiesPage() {
  const { address, isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')
  const [communities] = useState<Community[]>(mockCommunities)
  const [activeFilter, setActiveFilter] = useState<'all' | 'joined' | 'available'>('all')

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeFilter === 'joined') {
      return matchesSearch && community.isJoined
    } else if (activeFilter === 'available') {
      return matchesSearch && !community.isJoined
    }
    
    return matchesSearch
  })

  const handleJoinCommunity = (communityId: string) => {
    // Handle join logic
    console.log('Joining community:', communityId)
  }

  const handleLeaveCommunity = (communityId: string) => {
    // Handle leave logic
    console.log('Leaving community:', communityId)
  }

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
              Connect your wallet to discover and join communities
            </p>
          </div>
        </MobileSection>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer>
      {/* Search Section */}
      <MobileSection>
        <MobileInput
          type="search"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="mobile-mb-md"
        />
        
        {/* Filter Tabs */}
        <div className="mobile-flex mobile-gap-sm mobile-mb-lg">
          <MobileButton
            size="sm"
            variant={activeFilter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('all')}
          >
            All
          </MobileButton>
          <MobileButton
            size="sm"
            variant={activeFilter === 'joined' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('joined')}
          >
            Joined
          </MobileButton>
          <MobileButton
            size="sm"
            variant={activeFilter === 'available' ? 'primary' : 'secondary'}
            onClick={() => setActiveFilter('available')}
          >
            Available
          </MobileButton>
        </div>
      </MobileSection>

      {/* Communities List */}
      <MobileSection>
        <h2 className="mobile-text-lg mobile-font-semibold mobile-text-primary mobile-mb-md">
          {activeFilter === 'joined' ? 'Your Communities' : 
           activeFilter === 'available' ? 'Available Communities' : 
           'All Communities'}
        </h2>
        
        <div className="mobile-space-y-md">
          {filteredCommunities.map((community) => (
            <MobileCard key={community.id} interactive>
              <div className="mobile-p-md">
                <div className="mobile-flex mobile-items-start mobile-justify-between mobile-mb-sm">
                  <div className="mobile-flex mobile-items-center mobile-gap-sm">
                    <span className="mobile-text-2xl">{community.flag}</span>
                    <div>
                      <h3 className="mobile-text-lg mobile-font-semibold mobile-text-primary">
                        {community.name}
                      </h3>
                      <p className="mobile-text-sm mobile-text-secondary">
                        {community.memberCount.toLocaleString()} members
                      </p>
                    </div>
                  </div>
                  <div className="mobile-flex mobile-items-center mobile-gap-xs">
                    {community.verificationRequired.map((req) => (
                      <span
                        key={req}
                        className="mobile-px-xs mobile-py-xs mobile-bg-primary-light mobile-text-xs mobile-text-primary mobile-rounded"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="mobile-text-sm mobile-text-secondary mobile-mb-md">
                  {community.description}
                </p>
                
                <div className="mobile-flex mobile-justify-between mobile-items-center">
                  <div className="mobile-flex mobile-items-center mobile-gap-sm">
                    <span className="mobile-text-xs mobile-text-tertiary">
                      Requires: {community.verificationRequired.join(', ')}
                    </span>
                  </div>
                  
                  {community.isJoined ? (
                    <MobileButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleLeaveCommunity(community.id)}
                    >
                      Leave
                    </MobileButton>
                  ) : (
                    <MobileButton
                      size="sm"
                      onClick={() => handleJoinCommunity(community.id)}
                    >
                      Join
                    </MobileButton>
                  )}
                </div>
              </div>
            </MobileCard>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="mobile-text-center mobile-py-2xl">
            <div className="mobile-w-16 mobile-h-16 mobile-bg-surface mobile-rounded-full mobile-flex mobile-items-center mobile-justify-center mobile-mx-auto mobile-mb-lg">
              <svg className="mobile-w-8 mobile-h-8 mobile-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="mobile-text-lg mobile-font-semibold mobile-text-primary mobile-mb-sm">
              No communities found
            </h3>
            <p className="mobile-text-secondary">
              {searchQuery ? 'Try adjusting your search terms' : 'No communities available yet'}
            </p>
          </div>
        )}
      </MobileSection>
    </MobileContainer>
  )
}
