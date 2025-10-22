"use client";
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BadgesList from './badges/BadgesList';
import AddBadgeFlow from './badges/AddBadgeFlow';

interface Badge {
  id: string;
  name: string;
  icon: 'user' | 'earth' | 'mail';
  verifiedAt: string;
}

type AttributeType = 'age' | 'email' | 'nationality' | null;
type ProtocolType = 'google' | 'self' | 'worldid' | null;

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
  const [badges, setBadges] = useState<Badge[]>(mockBadges);

  const deleteBadge = (id: string) => {
    setBadges(badges.filter(badge => badge.id !== id));
    console.log('Deleting badge:', id);
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

  // Show badges list (main view)
  return (
    <BadgesList 
      badges={badges}
      onAddNewBadge={addNewBadge}
      onDeleteBadge={deleteBadge}
      onReverifyBadge={reverifyBadge}
    />
  );
}