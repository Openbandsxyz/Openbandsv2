import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getAgeRecord, AgeRecord } from '@/lib/blockchains/evm/smart-contracts/wagmi/age-registry';

export interface AgeBadgeData {
  isAgeVerified: boolean;
  verifiedAt: bigint;
  hasVerifiedBadge: boolean;
  walletAddress: string;
}

export const useAgeBadgeCheck = () => {
  const { address, isConnected } = useAccount();
  const [badgeData, setBadgeData] = useState<AgeBadgeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useAgeBadgeCheck useEffect triggered');
    console.log('📊 Current state:', { address, isConnected, loading, error });
    
    const checkBadge = async () => {
      if (!address || !isConnected) {
        console.log('⏭️ No wallet connected - address:', address, 'isConnected:', isConnected);
        setBadgeData(null);
        return;
      }

      // Always check on Celo Mainnet (42220) regardless of connected chain
      // Badges are stored on Celo, so we check there even if wallet is on Base
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Checking age badge for wallet:', address, '(checking Celo Mainnet regardless of connected chain)');
        
        const record: AgeRecord = await getAgeRecord(address);
        console.log('📦 Age record from contract:', record);
        
        if (record.isActive && record.isAgeVerified) {
          setBadgeData({
            isAgeVerified: record.isAgeVerified,
            verifiedAt: record.verifiedAt,
            hasVerifiedBadge: true,
            walletAddress: address,
          });
        } else {
          console.log('❌ No verified age badge found for this wallet');
          setBadgeData({
            isAgeVerified: false,
            verifiedAt: BigInt(0),
            hasVerifiedBadge: false,
            walletAddress: address,
          });
        }
      } catch (err) {
        console.error('❌ Error checking age badge:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setBadgeData(null);
      } finally {
        setLoading(false);
      }
    };

    checkBadge();
  }, [address, isConnected]); // Removed chainId dependency - always check on Celo

  return {
    ageBadge: badgeData,
    ageLoading: loading,
    ageError: error,
  };
};
