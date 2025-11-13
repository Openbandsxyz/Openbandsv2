/**
 * @notice Custom hook to check if a connected wallet has a verified nationality badge
 * @dev Reads from OpenbandsV2NationalityRegistry contract on Celo Sepolia (testnet) or Celo Mainnet
 */

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { getNationalityRecord } from '@/lib/blockchains/evm/smart-contracts/wagmi/nationality-registry';
import type { NationalityRecord } from '@/lib/blockchains/evm/smart-contracts/wagmi/nationality-registry';
import { translateMRZToCountryName } from '@/lib/utils/country-translation';

export interface NationalityBadgeData {
  nationality: string; // MRZ country code (e.g., "D<<", "JPN")
  countryName: string; // Full country name (e.g., "Germany", "Japan")
  isAboveMinimumAge: boolean;
  isValidNationality: boolean;
  verifiedAt: bigint;
  hasVerifiedBadge: boolean;
  walletAddress: string;
}

export const useNationalityBadgeCheck = () => {
  const { address, isConnected } = useAccount();
  const [badgeData, setBadgeData] = useState<NationalityBadgeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useNationalityBadgeCheck useEffect triggered');
    console.log('📊 Current state:', { address, isConnected, loading, error });
    
    const checkBadge = async () => {
      if (!address || !isConnected) {
        console.log('⏭️ No wallet connected - address:', address, 'isConnected:', isConnected);
        setBadgeData(null);
        return;
      }

      // Always check on Celo Mainnet (42220) regardless of connected chain
      // Badges are stored on Celo, so we check there even if wallet is on Base
      console.log(`🔍 Checking nationality badge for wallet: ${address} (checking Celo Mainnet regardless of connected chain)`);
      console.log(`📋 Contract address: ${process.env.NEXT_PUBLIC_NATIONALITY_REGISTRY_CONTRACT_ADDRESS}`);
      setLoading(true);
      setError(null);

      try {
        const record: NationalityRecord = await getNationalityRecord(address);
        
        console.log('📦 Nationality record from contract:', record);

        // Check if the record is active and has valid data
        if (record && record.isActive && record.nationality && record.nationality !== '') {
          const countryName = translateMRZToCountryName(record.nationality);
          console.log(`✅ Found verified nationality badge: ${record.nationality} (${countryName})`);
          
          setBadgeData({
            nationality: record.nationality,
            countryName: countryName,
            isAboveMinimumAge: true, // Default to true since we removed age verification
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
  }, [address, isConnected]); // Removed chainId dependency - always check on Celo

  return { badgeData, loading, error };
};

