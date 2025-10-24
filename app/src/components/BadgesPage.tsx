"use client";
import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useApp } from '@/context/AppContext';
import BadgesList from './badges/BadgesList';
import AddBadgeFlow from './badges/AddBadgeFlow';
import { useBadgeCheck } from '@/hooks/useBadgeCheck';
import { useNationalityBadgeCheck } from '@/hooks/useNationalityBadgeCheck';

interface Badge {
  id: string;
  name: string;
  icon: 'user' | 'earth' | 'mail';
  verifiedAt: string;
}

// Icon Components
function MailIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function EarthIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BadgeIcon({ icon }: { icon: 'user' | 'earth' | 'mail' }) {
  switch (icon) {
    case 'mail':
      return <MailIcon />;
    case 'user':
      return <UserIcon />;
    case 'earth':
      return <EarthIcon />;
    default:
      return <MailIcon />;
  }
}

type AttributeType = 'age' | 'email' | 'nationality' | null;
type ProtocolType = 'google' | 'self' | 'worldid' | null;
import { SignInPanel } from '@/components/SignInPanel';
import { WorldIdQRCodeVerificationPanel } from '@/components/zkpassports/world-id/WorldIdQRCodeVerificationPanel';
import { WorldIdVerification } from '@/components/zkpassports/world-id/WorldIdVerification';
import { SelfQRCodeVerificationPanel } from '@/components/zkpassports/self/SelfQRCodeVerificationPanel';

// @dev - OpenbandsV2BadgeManagerOnCelo.sol related module
import { storeVerificationData, getProofOfHumanRecord } from '@/lib/blockchains/evm/smart-contracts/wagmi/zkpassports/self/openbands-v2-badge-manager-on-celo';
import { formatRelativeTime } from '@/lib/blockchains/evm/utils/convert-timestamp-to-relative-time';


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
  const { badgeData: nationalityBadge, loading: nationalityLoading, error: nationalityError } = useNationalityBadgeCheck();
  const [showSignIn, setShowSignIn] = useState(false);  
  // const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  // //const [badges, setBadges] = useState(null);
  // const [badges, setBadges] = useState(mockBadges);
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
    const updatedBadges: Badge[] = [];

    // Add company email badge (from Base Mainnet)
    if (badgeData.hasVerifiedBadge && badgeData.domain) {
      const emailBadge: Badge = {
        id: 'email-1',
        name: `@${badgeData.domain}`,
        icon: 'mail',
        verifiedAt: badgeData.createdAt 
          ? formatTimestamp(badgeData.createdAt) 
          : 'On-chain verified'
      };
      updatedBadges.push(emailBadge);
    }

  // Add nationality badge (from Celo Sepolia/Mainnet)
  console.log('🔍 BadgesPage - nationalityBadge data:', nationalityBadge);
  console.log('🔍 BadgesPage - nationalityLoading:', nationalityLoading);
  console.log('🔍 BadgesPage - nationalityError:', nationalityError);
  
  if (nationalityBadge?.hasVerifiedBadge && nationalityBadge.nationality) {
      // Helper function to format timestamp from bigint
      const formatBigIntTimestamp = (timestamp: bigint): string => {
        try {
          // Convert bigint seconds to milliseconds
          const date = new Date(Number(timestamp) * 1000);
          return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
        } catch (error) {
          console.error('Error formatting timestamp:', error);
          return 'On-chain verified';
        }
      };

      const nationalityBadgeData: Badge = {
        id: 'nationality-1',
        name: nationalityBadge.countryName, // Use the translated country name from the hook
        icon: 'earth',
        verifiedAt: formatBigIntTimestamp(nationalityBadge.verifiedAt)
      };
      updatedBadges.push(nationalityBadgeData);
    }

    setBadges(updatedBadges);
  }, [badgeData, nationalityBadge]);

  const deleteBadge = (id: string) => {
    setBadges(badges.filter(badge => badge.id !== id));
    console.log('Deleting badge:', id);
  };
    
  // @dev - Wagmi
  const { address, isConnected } = useAccount() // @dev - Get connected wallet address
  const chainId = useChainId()

  // Check if user is connected to BASE Sepolia testnet (chain ID 84532)
  const isBaseSepolia = chainId === 84532;
  
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);

  useEffect(() => {
    const fetchProofOfHumanRecord = async () => {
      if (address && isConnected && !showAddBadge) {
        try {
          console.log("Calling the OpenbandsV2BadgeManagerOnCelo#getProofOfHumanRecord() for address (in useEffect):", address);
          const proofOfHumanityRecordString = await getProofOfHumanRecord(address);
          console.log("OpenbandsV2BadgeManagerOnCelo#getProofOfHumanRecord() result:", proofOfHumanityRecordString);
          
          // @dev - Parse the JSON string returned from the smart contract
          let proofOfHumanityRecord;
          try {
            proofOfHumanityRecord = JSON.parse(proofOfHumanityRecordString);
          } catch (parseError) {
            console.error("Error parsing JSON from smart contract:", parseError);
            return; // Exit early if JSON parsing fails
          }
          
          console.log("Parsed proofOfHumanityRecord:", proofOfHumanityRecord);
          console.log("proofOfHumanityRecord.createdAt:", proofOfHumanityRecord.createdAt);

          let badgesArray = [];

          if (proofOfHumanityRecord.isValidNationality == true) {
            badgesArray.push({
              id: '1',
              name: 'Nationality Verified',
              verified: formatRelativeTime(Number(proofOfHumanityRecord.createdAt)),
              icon: '🌍'
            });
          }

          if (proofOfHumanityRecord.isAboveMinimumAge == true) {
            badgesArray.push({
              id: '2',
              name: 'Age Verified',
              verified: formatRelativeTime(Number(proofOfHumanityRecord.createdAt)),
              icon: '🌍'
            });
          }

          setBadges(badgesArray);
        } catch (error) {
          console.error("Error automatically fetching proof of human record:", error);
        }
      }
    };

    // Only fetch when showing the main badges list view (not the add badge form)
    if (!showAddBadge) {
      fetchProofOfHumanRecord();
    }
  }, [address, isConnected, showAddBadge]); // Re-run when address, connection status, or view changes

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

  const handleReverify = (id: string) => {
    reverifyBadge(id);
  };

  const handleDelete = (id: string) => {
    deleteBadge(id);
  };

  const addNewBadge = () => {
    setShowAddBadge(true);
  };

  // NOTE: Badge creation is now handled automatically by the useEffect hook
  // that reads from the smart contracts (company email from Base, nationality from Celo)
  // Badges will appear when user refreshes page after successful on-chain storage

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
      </div>
    );
  }

  // Show badges list (main view)
  return (
    <>
    {/* 
    <BadgesList 
      badges={badges}
      onAddNewBadge={addNewBadge}
      onDeleteBadge={deleteBadge}
      onReverifyBadge={reverifyBadge}
    /> 
    */}
        
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
                      <BadgeIcon icon={badge.icon} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{badge.name}</span>
                  </div>
                </div>

                {/* Verified Column */}
                <div className="col-span-3">
                  <span className="text-sm text-gray-600">{badge.verifiedAt}</span>
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
    </>
  );
}