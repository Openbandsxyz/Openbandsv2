// @dev - Wagmi related imports
import { simulateContract, writeContract, readContract } from '@wagmi/core'
import { wagmiConfig } from "@/lib/blockchains/evm/smart-contracts/wagmi/config";
import type { Abi } from 'viem';

/**
 * @notice OpenbandsV2NationalityRegistry contract ABI and address configuration
 * @dev This will be populated after contract deployment
 */

// Temporary ABI - will be replaced after deployment
const NATIONALITY_REGISTRY_ABI = [
  {
    "type": "function",
    "name": "storeNationalityVerification",
    "inputs": [
      { "name": "_nationality", "type": "string", "internalType": "string" },
      { "name": "_isAboveMinimumAge", "type": "bool", "internalType": "bool" },
      { "name": "_isValidNationality", "type": "bool", "internalType": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getNationalityRecord",
    "inputs": [
      { "name": "_user", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct OpenbandsV2NationalityRegistry.NationalityRecord",
        "components": [
          { "name": "nationality", "type": "string", "internalType": "string" },
          { "name": "isValidNationality", "type": "bool", "internalType": "bool" },
          { "name": "verifiedAt", "type": "uint256", "internalType": "uint256" },
          { "name": "isActive", "type": "bool", "internalType": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isUserVerified",
    "inputs": [
      { "name": "_user", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserNationality",
    "inputs": [
      { "name": "_user", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      { "name": "", "type": "string", "internalType": "string" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "NationalityVerified",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
      { "name": "nationality", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "isAboveMinimumAge", "type": "bool", "indexed": false, "internalType": "bool" },
      { "name": "timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  }
] as const;

/**
 * @notice Contract configuration
 * @dev Address is loaded from environment variable
 */
export const nationalityRegistryContractConfig = {
  address: (process.env.NEXT_PUBLIC_NATIONALITY_REGISTRY_CONTRACT_ADDRESS || '') as `0x${string}`,
  abi: NATIONALITY_REGISTRY_ABI as Abi,
} as const;

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
 * @returns Promise with transaction hash
 */
export async function storeNationalityVerification(
  nationality: string,
  isAboveMinimumAge: boolean,
  isValidNationality: boolean
): Promise<`0x${string}`> {
  try {
    console.log('📝 Storing nationality verification on-chain:', {
      nationality,
      isAboveMinimumAge,
      isValidNationality,
      contractAddress: nationalityRegistryContractConfig.address
    });

    if (!nationalityRegistryContractConfig.address) {
      throw new Error('Nationality Registry contract address not configured. Please add NEXT_PUBLIC_NATIONALITY_REGISTRY_CONTRACT_ADDRESS to .env.local');
    }

    // Simulate the transaction first
    const { request } = await simulateContract(wagmiConfig, {
      address: nationalityRegistryContractConfig.address,
      abi: nationalityRegistryContractConfig.abi,
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
 * @returns Promise with the nationality record
 */
export async function getNationalityRecord(
  userAddress: `0x${string}`
): Promise<NationalityRecord> {
  try {
    console.log(`🔍 Reading nationality record for ${userAddress}`);
    console.log(`📋 Contract address: ${nationalityRegistryContractConfig.address}`);
    
    const CELO_MAINNET = 42220;
    const result = await readContract(wagmiConfig, {
      address: nationalityRegistryContractConfig.address,
      abi: nationalityRegistryContractConfig.abi,
      functionName: 'getNationalityRecord',
      args: [userAddress],
      chainId: CELO_MAINNET, // Always check on Celo Mainnet regardless of connected chain
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
 * @returns Promise with boolean result
 */
export async function isUserVerified(
  userAddress: `0x${string}`
): Promise<boolean> {
  try {
    const result = await readContract(wagmiConfig, {
      address: nationalityRegistryContractConfig.address,
      abi: nationalityRegistryContractConfig.abi,
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
 * @returns Promise with nationality string
 */
export async function getUserNationality(
  userAddress: `0x${string}`
): Promise<string> {
  try {
    const result = await readContract(wagmiConfig, {
      address: nationalityRegistryContractConfig.address,
      abi: nationalityRegistryContractConfig.abi,
      functionName: 'getUserNationality',
      args: [userAddress],
    });

    return result as string;
  } catch (error) {
    console.error('Error reading user nationality:', error);
    throw error;
  }
}

