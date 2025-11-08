// @dev - Wagmi related imports
import { simulateContract, writeContract, readContract, getAccount } from '@wagmi/core'
import { wagmiConfig } from "@/lib/blockchains/evm/smart-contracts/wagmi/config";
import { stringToHex } from 'viem';
import type { Abi } from 'viem';

// @dev - Blockchain related imports
import artifactOfCeloSender from '@/lib/blockchains/evm/smart-contracts/artifacts/hyperlane/CeloSender.sol/CeloSender.json';

/**
 * @notice - Set the CeloSender contract instance
 */
export function setCeloSenderContractInstance(): { celoSenderContractAddress: string, celoSenderAbi: Abi } {
  // @dev - Create the CeloSender contract instance
  const celoSenderContractAddress: string = process.env.NEXT_PUBLIC_CELO_SENDER_ON_CELO_SEPOLIA || "";  
  const celoSenderAbi = artifactOfCeloSender.abi;
  //console.log(`celoSenderContractAddress: ${celoSenderContractAddress}`);
  return { celoSenderContractAddress, celoSenderAbi: celoSenderAbi as Abi };
}

/**
 * @notice - Set the CeloSender contract instance as a "celoSenderContractConfig" 
 */
const { celoSenderContractAddress, celoSenderAbi } = setCeloSenderContractInstance();
export const celoSenderContractConfig = {
  address: celoSenderContractAddress as `0x${string}`,
  abi: celoSenderAbi,
} as const

/**
 * @notice - Send verification data via the sendToBase() of the CeloSender contract using Hyperlane
 * @param verificationResult - The verification result to be sent from Celo to Base
 * @returns Transaction hash
 */
export async function sendToBase(
  verificationResult: string
): Promise<`0x${string}`> {
  try {
    const BASE_RECEIVER = process.env.NEXT_PUBLIC_BASE_RECEIVER_ON_BASE_SEPOLIA || "";
    
    // Convert string to bytes format for Solidity
    // stringToHex converts the string to hex-encoded bytes (0x...)
    const messageBytes = stringToHex(verificationResult);
    
    console.log(`📤 Sending verification data to Base...`);
    console.log(`📝 Original message: ${verificationResult}`);
    console.log(`🔢 Encoded bytes: ${messageBytes}`);

    // First simulate the contract call to check if it will succeed
    const { request } = await simulateContract(wagmiConfig, {
      address: celoSenderContractConfig.address,
      abi: celoSenderContractConfig.abi,
      functionName: 'sendToBase', // @dev - CeloSender#sendToBase()
      args: [BASE_RECEIVER, messageBytes]
    });

    // Execute the actual transaction
    const hash = await writeContract(wagmiConfig, request);

    console.log(`✅ Verification data sent successfully from Celo to Base via Hyperlane. Transaction hash: ${hash}`);
    return hash;
  } catch (error) {
    console.error('❌ Error sending verification data from Celo to Base via Hyperlane:', error);
    throw error;
  }
}
