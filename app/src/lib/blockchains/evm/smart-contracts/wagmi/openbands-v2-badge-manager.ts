// @dev - Wagmi related imports
import { simulateContract, writeContract, readContract, getAccount } from '@wagmi/core'
import { wagmiConfig } from "@/lib/blockchains/evm/smart-contracts/wagmi/config";

import type { Abi } from 'viem';

// @dev - Blockchain related imports
import artifactOfOpenbandsV2BadgeManager from '@/lib/blockchains/evm/smart-contracts/artifacts/OpenbandsV2BadgeManager.sol/OpenbandsV2BadgeManager.json';

/**
 * @notice - Set the OpenbandsV2BadgeManager contract instance (on BASE mainnet or sepolia)
 */
export function setOpenbandsV2BadgeManagerContractInstance(): { openbandsV2BadgeManagerContractAddress: string, openbandsV2BadgeManagerAbi: Abi } {
  // @dev - Create the OpenbandsV2BadgeManager contract instance
  let openbandsV2BadgeManagerContractAddress: string;
  //const openbandsV2BadgeManagerContractAddress: string = process.env.NEXT_PUBLIC_OPENBANDS_V2_BADGE_MANAGER_ON_CELO_CONTRACT_ON_CELO_TESTNET || "";  

  // @dev - Get the network info from wagmiConfig
  const account = getAccount(wagmiConfig);
  const chainId = account.chain?.id;

  // BASE Mainnet (8453) or BASE Sepolia (84532)
  if (chainId === 8453) {
    openbandsV2BadgeManagerContractAddress = process.env.NEXT_PUBLIC_OPENBANDS_V2_BADGE_MANAGER_ON_BASE_MAINNET as `0x${string}`;
  } else if (chainId === 84532) {
    openbandsV2BadgeManagerContractAddress = process.env.NEXT_PUBLIC_OPENBANDS_V2_BADGE_MANAGER_ON_BASE_SEPOLIA as `0x${string}`;
  }

  const openbandsV2BadgeManagerAbi = artifactOfOpenbandsV2BadgeManager.abi;
  //console.log(`openbandsV2BadgeManagerContractAddress: ${openbandsV2BadgeManagerContractAddress}`);
  return { 
    openbandsV2BadgeManagerContractAddress: openbandsV2BadgeManagerContractAddress as `0x${string}`, 
    openbandsV2BadgeManagerAbi: openbandsV2BadgeManagerAbi as Abi
  };
}

/**
 * @notice - Set the OpenbandsV2BadgeManager contract instance as a "openbandsV2BadgeManagerContractConfig" 
 */
const { openbandsV2BadgeManagerContractAddress, openbandsV2BadgeManagerAbi } = setOpenbandsV2BadgeManagerContractInstance();
export const openbandsV2BadgeManagerContractConfig = {
  address: openbandsV2BadgeManagerContractAddress as `0x${string}`,
  abi: openbandsV2BadgeManagerAbi,
} as const

// Type for proof payload
interface ProofPayload {
  [key: string]: unknown;
}

/**
 * @notice - Call the receiveNationalityRecordViaSelf() in the OpenbandsV2BadgeManager contract (on BASE)
 */
export async function receiveNationalityRecordViaSelf(
  nationalityRecordViaSelfInBytes: `0x${string}`
): Promise<`0x${string}`> {
  try {
    console.log('📝 Receive a receiveNationalityRecord via Self.xyz on BASE through Hyperlane:', {
      nationalityRecordViaSelfInBytes
    });

    // First simulate the contract call to check if it will succeed
    const { request } = await simulateContract(wagmiConfig, {
      address: openbandsV2BadgeManagerContractConfig.address,
      abi: openbandsV2BadgeManagerContractConfig.abi,
      functionName: 'receiveNationalityRecordViaSelf',
      args: [nationalityRecordViaSelfInBytes]
    });

    // Execute the actual transaction
    const hash = await writeContract(wagmiConfig, request);
    
    console.log(`✅ Verification data successfully stored on BASE. Transaction hash: ${hash}`);
    return hash;
  } catch (error) {
    console.error('❌ Error storing verification data on BASE:', error);
    throw error;
  }
}

/**
 * @notice - Get a nationality record, which is verified via Self.xyz on Celo, from the openbandsV2BadgeManager contract on BASE.
 * @param userAddress - The address of the user whose nationality record to read
 */
export async function getNationalityRecordViaSelf(
  userAddress: `0x${string}`,
): Promise<string> {
  try {
    const result = await readContract(wagmiConfig, {
      address: openbandsV2BadgeManagerContractConfig.address,
      abi: openbandsV2BadgeManagerContractConfig.abi,
      functionName: 'getNationalityRecordViaSelf',
      args: [userAddress],
    });

    console.log(`Nationality record retrieved for ${userAddress}:`, result);
    return result as string;
  } catch (error) {
    console.error('Error reading nationality record:', error);
    throw error;
  }
}
