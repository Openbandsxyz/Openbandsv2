import { readContract, simulateContract, writeContract } from 'wagmi/actions'
import { wagmiConfig } from '../../config'

// Contract configuration
export const ageRegistryContractConfig = {
  address: (process.env.NEXT_PUBLIC_AGE_REGISTRY_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  abi: [
    {
      "type": "function",
      "name": "getAgeRecord",
      "inputs": [
        { "name": "_user", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct OpenbandsV2AgeRegistry.AgeRecord",
          "components": [
            { "name": "isAgeVerified", "type": "bool", "internalType": "bool" },
            { "name": "verifiedAt", "type": "uint256", "internalType": "uint256" },
            { "name": "isActive", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isUserAgeVerified",
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
      "name": "getAllVerifiedUsers",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getScope",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "totalActiveVerifications",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "verifiedUsers",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ageRecords",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "isAgeVerified",
          "type": "bool",
          "internalType": "bool"
        },
        {
          "name": "verifiedAt",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "isActive",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    }
  ] as const,
}

// Type definitions
export interface AgeRecord {
  isAgeVerified: boolean;
  verifiedAt: bigint;
  isActive: boolean;
}

// Functions
export async function getAgeRecord(
  userAddress: `0x${string}`
): Promise<AgeRecord> {
  try {
    console.log(`🔍 Reading age record for ${userAddress}`);
    console.log(`📋 Contract address: ${ageRegistryContractConfig.address}`);
    
    const result = await readContract(wagmiConfig, {
      address: ageRegistryContractConfig.address,
      abi: ageRegistryContractConfig.abi,
      functionName: 'getAgeRecord',
      args: [userAddress],
    }) as any;

    console.log(`📦 Age record retrieved for ${userAddress}:`, result);
    
    return {
      isAgeVerified: result.isAgeVerified,
      verifiedAt: result.verifiedAt,
      isActive: result.isActive,
    };
  } catch (error) {
    console.error('Error reading age record:', error);
    throw error;
  }
}

export async function isUserAgeVerified(
  userAddress: `0x${string}`
): Promise<boolean> {
  try {
    console.log(`🔍 Checking if user ${userAddress} is age verified`);
    
    const result = await readContract(wagmiConfig, {
      address: ageRegistryContractConfig.address,
      abi: ageRegistryContractConfig.abi,
      functionName: 'isUserAgeVerified',
      args: [userAddress],
    }) as boolean;

    console.log(`📦 Age verification status for ${userAddress}:`, result);
    return result;
  } catch (error) {
    console.error('Error checking age verification:', error);
    throw error;
  }
}

export async function getAllVerifiedUsers(): Promise<`0x${string}`[]> {
  try {
    console.log(`🔍 Getting all verified users`);
    
    const result = await readContract(wagmiConfig, {
      address: ageRegistryContractConfig.address,
      abi: ageRegistryContractConfig.abi,
      functionName: 'getAllVerifiedUsers',
      args: [],
    }) as `0x${string}`[];

    console.log(`📦 All verified users:`, result);
    return result;
  } catch (error) {
    console.error('Error getting all verified users:', error);
    throw error;
  }
}

export async function getTotalActiveVerifications(): Promise<bigint> {
  try {
    console.log(`🔍 Getting total active verifications`);
    
    const result = await readContract(wagmiConfig, {
      address: ageRegistryContractConfig.address,
      abi: ageRegistryContractConfig.abi,
      functionName: 'totalActiveVerifications',
      args: [],
    }) as bigint;

    console.log(`📦 Total active verifications:`, result);
    return result;
  } catch (error) {
    console.error('Error getting total active verifications:', error);
    throw error;
  }
}
