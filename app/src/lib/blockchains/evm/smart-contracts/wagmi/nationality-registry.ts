// @dev - Wagmi related imports
import { simulateContract, writeContract, readContract, watchContractEvent } from '@wagmi/core'
import { wagmiConfig } from "@/lib/blockchains/evm/smart-contracts/wagmi/config";
import type { Abi } from 'viem';

// @dev - Artifact of the OpenbandsV2NationalityRegistry contract
import artifactOfOpenbandsV2NationalityRegistry from '@/lib/blockchains/evm/smart-contracts/artifacts/nationality-registry/OpenbandsV2NationalityRegistry.json';

/**
 * @notice - Set the OpenbandsV2NationalityRegistry contract instance
 */
export function setOpenbandsV2NationalityRegistryContractInstance(): { openbandsV2NationalityRegistryContractAddress: string, openbandsV2NationalityRegistryAbi: Abi } {
  // @dev - Create the OpenbandsV2NationalityRegistry contract instance
  const openbandsV2NationalityRegistryContractAddress: string = process.env.NEXT_PUBLIC_OPENBANDS_V2_NATIONALITY_REGISTRY_CONTRACT_ON_CELO_TESTNET || "";  
  const openbandsV2NationalityRegistryAbi = artifactOfOpenbandsV2NationalityRegistry.abi;
  //console.log(`openbandsV2NationalityRegistryContractAddress: ${openbandsV2NationalityRegistryContractAddress}`);
  return { openbandsV2NationalityRegistryContractAddress, openbandsV2NationalityRegistryAbi: openbandsV2NationalityRegistryAbi as Abi };
}

/**
 * @notice - Set the OpenbandsV2NationalityRegistry contract instance as a "openbandsV2NationalityRegistryContractConfig"
 */
const { openbandsV2NationalityRegistryContractAddress, openbandsV2NationalityRegistryAbi } = setOpenbandsV2NationalityRegistryContractInstance();
export const openbandsV2NationalityRegistryContractConfig = {
  address: openbandsV2NationalityRegistryContractAddress as `0x${string}`,
  abi: openbandsV2NationalityRegistryAbi,
} as const

/**
 * @notice Contract configuration
 * @dev Get contract address based on chain ID
 */
export function getNationalityRegistryAddress(chainId?: number): `0x${string}` {
  // Celo Mainnet (42220)
  if (chainId === 42220) {
    return (process.env.NEXT_PUBLIC_OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET || '') as `0x${string}`;
  }
  // Celo Sepolia Testnet (11142220)
  if (chainId === 11142220) {
    return (process.env.NEXT_PUBLIC_OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_SEPOLIA || '') as `0x${string}`;
  }
}

// export const nationalityRegistryContractConfig = {
//   address: getNationalityRegistryAddress(),
//   abi: NATIONALITY_REGISTRY_ABI as Abi,
// } as const;

/**
 * @notice Nationality record type returned from contract
 */
export interface NationalityRecord {
  nationality: string;
  isValidNationality: boolean;
  verifiedAt: bigint;
  isActive: boolean;
}

/**
 * @notice Store nationality verification data on-chain
 * @param nationality - ISO 3166-1 alpha-3 country code (e.g., "USA", "GBR", "IND")
 * @param isAboveMinimumAge - Whether user meets minimum age requirement
 * @param isValidNationality - Whether nationality was successfully verified
 * @param chainId - Optional chain ID to determine which contract to use
 * @returns Promise with transaction hash
 */
export async function storeNationalityVerification(
  nationality: string,
  isAboveMinimumAge: boolean,
  isValidNationality: boolean,
  chainId?: number
): Promise<`0x${string}`> {
  try {
    const contractAddress = getNationalityRegistryAddress(chainId);
    
    console.log('📝 Storing nationality verification on-chain:', {
      nationality,
      isAboveMinimumAge,
      isValidNationality,
      contractAddress,
      chainId
    });

    if (!contractAddress) {
      throw new Error('Nationality Registry contract address not configured. Please add environment variables for CELO_MAINNET or CELO_SEPOLIA');
    }

    // Simulate the transaction first
    const { request } = await simulateContract(wagmiConfig, {
      address: contractAddress,
      abi: openbandsV2NationalityRegistryContractConfig.abi,
      functionName: 'storeNationalityVerification',
      args: [nationality, isAboveMinimumAge, isValidNationality]
    });

    // Execute the transaction
    const hash = await writeContract(wagmiConfig, request);
    
    console.log(`✅ Nationality verification stored successfully!`);
    console.log(`🌍 Nationality: ${nationality}`);
    console.log(`📜 Transaction hash: ${hash}`);
    
    return hash;
  } catch (error) {
    console.error('❌ Error storing nationality verification:', error);
    throw error;
  }
}

/**
 * @notice Get nationality record for a specific user
 * @param userAddress - The address of the user
 * @param chainId - Optional chain ID to determine which contract to use
 * @returns Promise with the nationality record
 */
export async function getNationalityRecord(
  userAddress: `0x${string}`,
  chainId?: number
): Promise<NationalityRecord> {
  try {
    const contractAddress = getNationalityRegistryAddress(chainId);
    
    console.log(`🔍 Reading nationality record for ${userAddress}`);
    console.log(`📋 Contract address: ${contractAddress}`);
    console.log(`🔗 Chain ID: ${chainId}`);
    
    const result = await readContract(wagmiConfig, {
      address: contractAddress,
      abi: openbandsV2NationalityRegistryContractConfig.abi,
      functionName: 'getNationalityRecord',
      args: [userAddress],
    }) as any;

    console.log(`📦 Nationality record retrieved for ${userAddress}:`, result);
    
    return {
      nationality: result.nationality,
      isValidNationality: result.isValidNationality,
      verifiedAt: result.verifiedAt,
      isActive: result.isActive,
    };
  } catch (error) {
    console.error('Error reading nationality record:', error);
    throw error;
  }
}

/**
 * @notice Check if a user has an active nationality verification
 * @param userAddress - The address of the user
 * @param chainId - Optional chain ID to determine which contract to use
 * @returns Promise with boolean result
 */
export async function isUserVerified(
  userAddress: `0x${string}`,
  chainId?: number
): Promise<boolean> {
  try {
    const contractAddress = getNationalityRegistryAddress(chainId);
    
    const result = await readContract(wagmiConfig, {
      address: contractAddress,
      abi: openbandsV2NationalityRegistryContractConfig.abi,
      functionName: 'isUserVerified',
      args: [userAddress],
    });

    return result as boolean;
  } catch (error) {
    console.error('Error checking user verification:', error);
    return false;
  }
}

/**
 * @notice Get nationality for a specific user
 * @param userAddress - The address of the user
 * @param chainId - Optional chain ID to determine which contract to use
 * @returns Promise with nationality string
 */
export async function getUserNationality(
  userAddress: `0x${string}`,
  chainId?: number
): Promise<string> {
  try {
    const contractAddress = getNationalityRegistryAddress(chainId);
    
    const result = await readContract(wagmiConfig, {
      address: contractAddress,
      abi: openbandsV2NationalityRegistryContractConfig.abi,
      functionName: 'getUserNationality',
      args: [userAddress],
    });

    return result as string;
  } catch (error) {
    console.error('Error reading user nationality:', error);
    throw error;
  }
}



//================= Events =====================//

/**
 * @notice - Watch for the NationalityVerified event, which is emitted via the OpenbandsV2NationalityRegistry#customVerificationHook()
 */
export function watchNationalityVerifiedEvent(chainId?: number) {
  try {
    const nationalityRegistryContractAddress = getNationalityRegistryAddress(chainId);
    
    const watchedNationalityVerifiedEvent = watchContractEvent(wagmiConfig, {
      address: nationalityRegistryContractAddress,
      abi: openbandsV2NationalityRegistryContractConfig.abi,
      eventName: 'NationalityVerified',
      onLogs(logs) {
        console.log('New logs!', logs)
      },
    })

    return watchedNationalityVerifiedEvent;
  } catch (error) {
    console.error('Error watching the NationalityVerified event-emitted via the OpenbandsV2NationalityRegistry#customVerificationHook():', error);
    return false;
  }
}


