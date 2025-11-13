/**
 * OpenBands v2 - Join Community Button Component
 * 
 * Allows users with required badges to join communities.
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import svgPaths from "@/components/imports/svg-x50u5iglgo";

// Icon for Plus button
function IconPlus() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <path d={svgPaths.p36bdefc0} stroke="var(--stroke-0, #FAFAFA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
      </svg>
    </div>
  );
}

interface JoinCommunityButtonProps {
  communityId: string;
  attestationType: string;
  attestationValue: string;
  isJoined: boolean;
  onJoinSuccess: () => void;
}

export function JoinCommunityButton({
  communityId,
  attestationType,
  attestationValue,
  isJoined,
  onJoinSuccess,
}: JoinCommunityButtonProps) {
  const { address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleJoin = async () => {
    if (!address || isJoined) return;
    
    setIsJoining(true);
    setError(null);
    
    try {
      console.log(`[Join Community] Attempting to join ${communityId}...`);
      
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      
      const result = await response.json();
      console.log('[Join Community] API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to join community');
      }
      
      // Success!
      onJoinSuccess();
    } catch (err) {
      console.error('[Join Community] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsJoining(false);
    }
  };
  
  if (!address) {
    return (
      <button
        disabled
        className="bg-gray-200 box-border content-stretch flex gap-[4px] h-[28px] items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 cursor-not-allowed"
      >
        <IconPlus />
        <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-gray-500 text-nowrap">
          <p className="leading-[16px] whitespace-pre">Connect wallet</p>
        </div>
      </button>
    );
  }
  
  if (isJoined) {
    return null; // Already handled by parent showing "Joined" badge
  }
  
  return (
    <div className="space-y-2">
      <button
        onClick={handleJoin}
        disabled={isJoining}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 box-border content-stretch flex gap-[4px] h-[28px] items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 transition-colors"
      >
        <IconPlus />
        <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white text-nowrap">
          <p className="leading-[16px] whitespace-pre">{isJoining ? 'Joining...' : 'Join'}</p>
        </div>
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

