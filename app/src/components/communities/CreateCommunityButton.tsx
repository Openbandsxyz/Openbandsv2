/**
 * OpenBands v2 - Create Community Button Component
 * 
 * Allows users to create new communities.
 * Only requires a connected wallet - badge verification happens when users join.
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CreateCommunityWizard } from './CreateCommunityWizard';

interface CreateCommunityButtonProps {
  onCommunityCreated?: () => void;
}

export function CreateCommunityButton({ onCommunityCreated }: CreateCommunityButtonProps = {}) {
  const { address } = useAccount();
  const [showWizard, setShowWizard] = useState(false);

  if (!address) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-sm"
      >
        Connect wallet to create
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowWizard(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        + Create Community
      </button>
      
      {showWizard && (
        <CreateCommunityWizard
          onCommunityCreated={onCommunityCreated}
          onClose={() => setShowWizard(false)}
        />
      )}
    </>
  );
}
