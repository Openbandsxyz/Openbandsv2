import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { getAgeRecord, AgeRecord } from '@/lib/blockchains/evm/smart-contracts/wagmi/zkpassports/self/age-registry';

export interface AgeBadgeData {
  isAgeVerified: boolean;
  verifiedAt: bigint;
  hasVerifiedBadge: boolean;
  walletAddress: string;
}

export const useAgeBadgeCheck = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [badgeData, setBadgeData] = useState<AgeBadgeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useAgeBadgeCheck useEffect triggered');
    console.log('📊 Current state:', { address, isConnected, chainId, loading, error });
    
    const checkBadge = async () => {
      if (!address || !isConnected) {
        console.log('⏭️ No wallet connected - address:', address, 'isConnected:', isConnected);
        setBadgeData(null);
        return;
      }

      // Only check on Celo networks (Mainnet or Sepolia)
      if (chainId !== 42220 && chainId !== 44787) {
        console.log('⏭️ Skipping age badge check - not on Celo network (current chain:', chainId, ')');
        setBadgeData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Checking age badge for wallet:', address, 'on chain', chainId);
        
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
  }, [address, isConnected, chainId]); // Dependencies

  return {
    ageBadge: badgeData,
    ageLoading: loading,
    ageError: error,
  };
};
