/**
 * @notice Custom hook to check if a connected wallet has a verified nationality badge
 * @dev Reads from OpenbandsV2NationalityRegistry contract on Celo Sepolia (testnet) or Celo Mainnet
 */

import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { getNationalityRecord } from '@/lib/blockchains/evm/smart-contracts/wagmi/nationality-registry';
import type { NationalityRecord } from '@/lib/blockchains/evm/smart-contracts/wagmi/nationality-registry';

export interface NationalityBadgeData {
  nationality: string;
  isAboveMinimumAge: boolean;
  isValidNationality: boolean;
  verifiedAt: bigint;
  hasVerifiedBadge: boolean;
  walletAddress: string;
}

export const useNationalityBadgeCheck = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [badgeData, setBadgeData] = useState<NationalityBadgeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBadge = async () => {
      if (!address || !isConnected) {
        console.log('⏭️ No wallet connected');
        setBadgeData(null);
        return;
      }

      // Only check on Celo networks
      // Celo Mainnet: 42220
      // Celo Sepolia: 11142220
      const isCeloNetwork = chainId === 42220 || chainId === 11142220;
      
      if (!isCeloNetwork) {
        console.log(`⏭️ Skipping nationality badge check - not on Celo network (current chain: ${chainId})`);
        setBadgeData(null);
        return;
      }

      console.log(`🔍 Checking nationality badge for wallet: ${address} on chain ${chainId}`);
      setLoading(true);
      setError(null);

      try {
        const record: NationalityRecord = await getNationalityRecord(address);
        
        console.log('📦 Nationality record from contract:', record);

        // Check if the record is active and has valid data
        if (record && record.isActive && record.nationality && record.nationality !== '') {
          console.log(`✅ Found verified nationality badge: ${record.nationality}`);
          
          setBadgeData({
            nationality: record.nationality,
            isAboveMinimumAge: record.isAboveMinimumAge,
            isValidNationality: record.isValidNationality,
            verifiedAt: record.verifiedAt,
            hasVerifiedBadge: true,
            walletAddress: address,
          });
        } else {
          console.log('❌ No verified nationality badge found for this wallet');
          setBadgeData(null);
        }
      } catch (err) {
        console.error('Failed to check nationality badge:', err);
        setError(err instanceof Error ? err.message : 'Unknown error checking nationality badge');
        setBadgeData(null);
      } finally {
        setLoading(false);
      }
    };

    checkBadge();
  }, [address, isConnected, chainId]);

  return { badgeData, loading, error };
};

