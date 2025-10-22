// @dev - Wagmi related imports
import { simulateContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { wagmiConfig } from "@/lib/blockchains/evm/smart-contracts/wagmi/config";

import type { Abi } from 'viem';

// @dev - Blockchain related imports
import artifactOfOpenbandsV2BadgeManagerOnCelo from '@/lib/blockchains/evm/smart-contracts/artifacts/zkpassports/self/OpenbandsV2BadgeManagerOnCelo.sol/OpenbandsV2BadgeManagerOnCelo.json';

/**
 * @notice - Set the OpenbandsV2BadgeManagerOnCelo contract instance
 */
export function setOpenbandsV2BadgeManagerOnCeloContractInstance(): { openbandsV2BadgeManagerOnCeloContractAddress: string, openbandsV2BadgeManagerOnCeloAbi: Abi } {
  // @dev - Create the OpenbandsV2BadgeManagerOnCelo contract instance
  const openbandsV2BadgeManagerOnCeloContractAddress: string = process.env.NEXT_PUBLIC_OPENBANDS_V2_BADGE_MANAGER_ON_CELO_CONTRACT_ON_CELO_TESTNET || "";  
  const openbandsV2BadgeManagerOnCeloAbi = artifactOfOpenbandsV2BadgeManagerOnCelo.abi;
  //console.log(`openbandsV2BadgeManagerOnCeloContractAddress: ${openbandsV2BadgeManagerOnCeloContractAddress}`);
  return { openbandsV2BadgeManagerOnCeloContractAddress, openbandsV2BadgeManagerOnCeloAbi: openbandsV2BadgeManagerOnCeloAbi as Abi };
}

/**
 * @notice - Set the OpenbandsV2BadgeManagerOnCelo contract instance as a "openbandsV2BadgeManagerOnCeloContractConfig" 
 */
const { openbandsV2BadgeManagerOnCeloContractAddress, openbandsV2BadgeManagerOnCeloAbi } = setOpenbandsV2BadgeManagerOnCeloContractInstance();
export const openbandsV2BadgeManagerOnCeloContractConfig = {
  address: openbandsV2BadgeManagerOnCeloContractAddress as `0x${string}`,
  abi: openbandsV2BadgeManagerOnCeloAbi,
} as const

// Type for proof payload
interface ProofPayload {
  [key: string]: unknown;
}

/**
 * @notice - Store verification data on the OpenbandsV2BadgeManagerOnCelo contract
 * @param userAddress - The address of the user storing the verification
 * @param isAboveMinimumAge
 * @param isValidNationality
 * @param proofPayload - The ZK proof payload to store
 * @param userContextData - Additional user context data to store
 * @returns Promise with transaction hash if successful
 */
export async function storeVerificationData(
  isAboveMinimumAge: boolean, 
  isValidNationality: boolean,
  proofPayload: ProofPayload, 
  userContextData: string,
): Promise<`0x${string}`> {
  try {
    // First simulate the contract call to check if it will succeed
    const { request } = await simulateContract(wagmiConfig, {
      address: openbandsV2BadgeManagerOnCeloContractConfig.address,
      abi: openbandsV2BadgeManagerOnCeloContractConfig.abi,
      functionName: 'storeVerificationData',
      args: [isAboveMinimumAge, isValidNationality, proofPayload, userContextData, true],
    });

    // Execute the actual transaction
    const hash = await writeContract(wagmiConfig, request);
    
    console.log(`Verification data stored successfully. Transaction hash: ${hash}`);
    return hash;
  } catch (error) {
    console.error('Error storing verification data:', error);
    throw error;
  }
}

/**
 * @notice - Read a proof of human record from the OpenbandsV2BadgeManagerOnCelo contract
 * @param userAddress - The address of the user whose proof of human record to read
 */
export async function getProofOfHumanRecord(
  userAddress: `0x${string}`,
): Promise<string> {
  try {
    const result = await readContract(wagmiConfig, {
      address: openbandsV2BadgeManagerOnCeloContractConfig.address,
      abi: openbandsV2BadgeManagerOnCeloContractConfig.abi,
      functionName: 'getProofOfHumanRecord',
      args: [userAddress],
    });

    console.log(`Proof of human record retrieved for ${userAddress}:`, result);
    return result as string;
  } catch (error) {
    console.error('Error reading proof of human record:', error);
    throw error;
  }
}

