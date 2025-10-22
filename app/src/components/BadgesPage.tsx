"use client";
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import BadgesList from './badges/BadgesList';
import AddBadgeFlow from './badges/AddBadgeFlow';
import { useBadgeCheck } from '@/hooks/useBadgeCheck';

interface Badge {
  id: string;
  name: string;
  icon: 'user' | 'earth' | 'mail';
  verifiedAt: string;
}

type AttributeType = 'age' | 'email' | 'nationality' | null;
type ProtocolType = 'google' | 'self' | 'worldid' | null;
import { SignInPanel } from '@/components/SignInPanel';
import { SelfQRCodeVerificationPanel } from '@/components/zkpassports/self/SelfQRCodeVerificationPanel';
import { WorldIdQRCodeVerificationPanel } from '@/components/zkpassports/world-id/WorldIdQRCodeVerificationPanel';
import { WorldIdVerification } from '@/components/zkpassports/world-id/WorldIdVerification';
import { useChainId } from 'wagmi';

// Mock badge data - in real implementation, this would come from Supabase
const mockBadges: Badge[] = [
  {
    id: '1',
    name: '18+ years old',
    icon: 'user',
    verifiedAt: '2 hours ago'
  },
  {
    id: '2', 
    name: 'Costa Rica',
    icon: 'earth',
    verifiedAt: '1 week ago'
  },
  {
    id: '3',
    name: '@pse.dev',
    icon: 'mail',
    verifiedAt: 'February 2, 2025'
  }
];

export default function BadgesPage() {
  const { isAuthenticated } = useApp();
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const { badgeData, loading, error } = useBadgeCheck();
  const chainId = useChainId();
  const [showSignIn, setShowSignIn] = useState(false);  
  const [isMobile] = useState(false);
  const [showQRVerification, setShowQRVerification] = useState(false);
  
  // Helper function to format the timestamp
  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      
      // Format as "Month Day, Year" (e.g., "September 22, 2025")
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      
      return formattedDate;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'On-chain verified';
    }
  };

  // Update badges based on on-chain data
  useEffect(() => {
    if (badgeData.hasVerifiedBadge && badgeData.domain) {
      const emailBadge: Badge = {
        id: '1',
        name: `@${badgeData.domain}`,
        icon: 'mail',
        verifiedAt: badgeData.createdAt 
          ? formatTimestamp(badgeData.createdAt) 
          : 'On-chain verified'
      };
      setBadges([emailBadge]);
    } else {
      setBadges([]);
    }
  }, [badgeData]);

  const deleteBadge = (id: string) => {
    setBadges(badges.filter(badge => badge.id !== id));
    console.log('Deleting badge:', id);
    
  // Check if user is connected to BASE Sepolia testnet (chain ID 84532)
  const isBaseSepolia = chainId === 84532;

  const handleAttributeSelect = (attribute: string) => {
    console.log('handleAttributeSelect called with:', attribute, 'isAuthenticated:', isAuthenticated);
    setSelectedAttribute(attribute);
    
    // Show QR verification directly for nationality and age verification (no authentication required)
    if (attribute === 'nationality' || attribute === 'age') {
      console.log('Showing QR verification for:', attribute);
      setShowQRVerification(true);
    } else if (!isAuthenticated) {
      // For other attributes, show sign-in if not authenticated
      setShowSignIn(true);
    }
    console.log('Selected attribute:', attribute);
  };

  const reverifyBadge = (id: string) => {
    console.log('Reverifying badge:', id);
    // Add reverify logic here
  };

  const addNewBadge = () => {
    setShowAddBadge(true);
  };

  const createBadge = (attribute: AttributeType, protocol: ProtocolType) => {
    // Create a new badge based on the selected attribute and protocol
    const newBadge: Badge = {
      id: Date.now().toString(),
      name: getBadgeName(attribute, protocol),
      icon: getBadgeIcon(attribute),
      verifiedAt: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    };

    // Add the new badge to the list
    setBadges(prevBadges => [...prevBadges, newBadge]);
    
    // Show success message
    console.log('Badge created successfully:', newBadge);
  };

  const getBadgeName = (attribute: AttributeType, protocol: ProtocolType): string => {
    const attributeNames: Record<NonNullable<AttributeType>, string> = {
      'nationality': 'Nationality',
      'age': 'Age (18+)',
      'email': 'Company Email'
    };
    
    const protocolNames: Record<NonNullable<ProtocolType>, string> = {
      'google': 'Google Verified',
      'self': 'Self Protocol Verified',
      'worldid': 'WorldID Verified'
    };

    if (!attribute || !protocol) return 'Unknown Badge';
    return `${attributeNames[attribute]} - ${protocolNames[protocol]}`;
  };

  const getBadgeIcon = (attribute: AttributeType): 'user' | 'earth' | 'mail' => {
    switch (attribute) {
      case 'nationality':
        return 'earth';
      case 'age':
        return 'user';
      case 'email':
        return 'mail';
      default:
        return 'user';
    }
  };

  // Show add badge form when "Add new badge" is clicked
  if (showAddBadge) {
    return (
      <AddBadgeFlow 
        onClose={() => setShowAddBadge(false)}
        onCreateBadge={createBadge}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading badges...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
       <div className="text-red-600">Error: {error}</div>
      //<div className="flex-1 bg-white"> // @dev - Boundary of branches between "new-UI-for-badges" and "staging"
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddBadge(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Badge</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-2xl">
            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              Add new badges to your profile, verify and use them as part of your identity securely. 
              Your badges help build trust and credibility within the community.
            </p>

            {/* Attribute Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Select the attribute you want to verify
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Nationality Option */}
                <button
                  onClick={() => handleAttributeSelect('nationality')}
                  className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                    selectedAttribute === 'nationality'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Nationality</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Verify your nationality using passport credentials
                  </p>

                  {isBaseSepolia && (
                    <WorldIdVerification 
                      onSuccess={(result) => {
                        console.log("World ID verification completed:", result);
                      }}
                      onError={(error) => {
                        console.error("World ID verification error:", error);
                      }}
                    />
                  )}
                </button>

                {/* Age Option */}
                <button
                  onClick={() => handleAttributeSelect('age')}
                  className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                    selectedAttribute === 'age'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Age Verification</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Verify you are 18+ years old
                  </p>

                  {isBaseSepolia && (
                    <WorldIdVerification 
                      onSuccess={(result) => {
                        console.log("World ID verification completed:", result);
                      }}
                      onError={(error) => {
                        console.error("World ID verification error:", error);
                      }}
                    />
                  )}
                </button>

                {/* Email Option */}
                <button
                  onClick={() => handleAttributeSelect('email')}
                  className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${
                    selectedAttribute === 'email'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Email Domain</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Verify your email domain (e.g., @company.com)
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Modal */}
        {showSignIn && (
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

        {/* QR Verification Modal for World ID on BASE */}
        {/* 
        {isBaseSepolia && (
          // <WorldIdVerification 
          //   onSuccess={(result) => {
          //     console.log("World ID verification completed:", result);
          //   }}
          //   onError={(error) => {
          //     console.error("World ID verification error:", error);
          //   }}
          // />

          // <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          //   <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowQRVerification(false)} />
          //   <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          //     <div className="p-6">
          //       <WorldIdVerification 
          //         onSuccess={(result) => {
          //           console.log("World ID verification completed:", result);
          //         }}
          //         onError={(error) => {
          //           console.error("World ID verification error:", error);
          //         }}
          //       />
          //     </div>
          //   </div>
          // </div>
        )}
        */}

        {/* QR Verification Modal for Self.xyz on Celo */}
        {showQRVerification && !isBaseSepolia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowQRVerification(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <SelfQRCodeVerificationPanel 
                  selectedAttribute={selectedAttribute}
                  isMobile={isMobile}
                  onClose={() => setShowQRVerification(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show badges list (main view)
  return (
    <!--     
    <BadgesList 
      badges={badges}
      onAddNewBadge={addNewBadge}
      onDeleteBadge={deleteBadge}
      onReverifyBadge={reverifyBadge}
    /> -->
        
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900">My Badges</h1>
        <p className="text-gray-600 mt-2">
          Manage and customize your badges here. You can manage visibility, add new badges, reverify or remove ones you no longer want.
        </p>
      </div>

      {/* Badges Table */}
      <div className="p-6">
        {badges.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No badges yet</h3>
            <p className="text-sm text-gray-600 mb-4">You haven&apos;t verified any attributes yet. Add your first badge to get started.</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-6">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Badge</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Verified</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Actions</span>
              </div>
            </div>

            {/* Badge Rows */}
            {badges.map((badge) => (
              <div key={badge.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                {/* Badge Column */}
                <div className="col-span-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">{badge.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{badge.name}</span>
                  </div>
                </div>

                {/* Verified Column */}
                <div className="col-span-3">
                  <span className="text-sm text-gray-600">{badge.verified}</span>
                </div>

                {/* Actions Column */}
                <div className="col-span-3">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleReverify(badge.id)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Reverify</span>
                    </button>
                    <button
                      onClick={() => handleDelete(badge.id)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Badge Button */}
        <div className="mt-6">
          <button
            onClick={() => setShowAddBadge(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add new badge</span>
          </button>
        </div>
      </div>
    </div>
  );
}