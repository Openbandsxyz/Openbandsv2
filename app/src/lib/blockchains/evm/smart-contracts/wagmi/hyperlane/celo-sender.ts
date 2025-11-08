// @dev - Wagmi related imports
import { simulateContract, writeContract, readContract, getAccount } from '@wagmi/core'
import { wagmiConfig } from "@/lib/blockchains/evm/smart-contracts/wagmi/config";
import { stringToHex } from 'viem';
import type { Abi } from 'viem';

// @dev - Blockchain related imports
import artifactOfCeloSender from '@/lib/blockchains/evm/smart-contracts/artifacts/hyperlane/CeloSender.sol/CeloSender.json';
import artifactOfIMailbox from '@/lib/blockchains/evm/smart-contracts/artifacts/hyperlane/IMailbox.sol/IMailbox.json';

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
 * @notice - Set the Mailbox contract instance
 */
export function setMailboxContractInstance(): { mailboxContractAddress: string, mailboxAbi: Abi } {
  // @dev - Create the Mailbox contract instance
  const mailboxContractAddress: string = process.env.NEXT_PUBLIC_CELO_SEPOLIA_MAILBOX_ADDRESS || "";  
  const mailboxAbi = artifactOfIMailbox.abi;
  //console.log(`mailboxContractAddress: ${mailboxContractAddress}`);
  return { mailboxContractAddress, mailboxAbi: mailboxAbi as Abi };
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
 * @notice - Set the Mailbox contract instance as a "mailboxContractConfig" 
 */
const { mailboxContractAddress, mailboxAbi } = setMailboxContractInstance();
export const mailboxContractConfig = {
  address: mailboxContractAddress as `0x${string}`,
  abi: mailboxAbi,
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

    // @dev - Convert string to bytes format for Solidity
    // stringToHex converts the string to hex-encoded bytes (0x...)
    const messageBytes = stringToHex(verificationResult);
    
    console.log(`📤 Sending verification data to Base...`);
    console.log(`📝 Original message: ${verificationResult}`);
    console.log(`🔢 Encoded bytes: ${messageBytes}`);

    // Query the required fee for Hyperlane dispatch
    // The Mailbox contract has a quoteDispatch function to estimate fees
    const MAILBOX_ADDRESS = process.env.NEXT_PUBLIC_HYPERLANE_MAILBOX_ON_CELO_SEPOLIA || "";
    const BASE_DOMAIN = 84532; // Base Sepolia domain ID
    
    let estimatedFee = 0n;
    try {
      // Try to get fee estimation from Mailbox
      estimatedFee = await readContract(wagmiConfig, {
        address: MAILBOX_ADDRESS as `0x${string}`,
        abi: mailboxContractConfig.abi,
        functionName: 'quoteDispatch',
        args: [
          BASE_DOMAIN,
          BASE_RECEIVER as `0x${string}`,
          messageBytes
        ]
      }) as bigint;
      
      // Add 50% buffer for safety
      estimatedFee = (estimatedFee * 150n) / 100n;
      console.log(`💰 Estimated Hyperlane fee: ${estimatedFee.toString()} wei (with 50% buffer)`);
    } catch (feeError) {
      console.warn(`⚠️ Could not estimate fee, using default: ${feeError}`);
      // Fallback to a reasonable default (e.g., 0.001 native token)
      estimatedFee = BigInt('1000000000000000'); // @dev - 0.001 $CELO in wei on Celo Sepolia
    }

    // First simulate the contract call to check if it will succeed
    const { request } = await simulateContract(wagmiConfig, {
      address: celoSenderContractConfig.address,
      abi: celoSenderContractConfig.abi,
      functionName: 'sendToBase', // @dev - CeloSender#sendToBase()
      args: [BASE_RECEIVER, messageBytes],
      value: estimatedFee         // @dev - Send native token to cover the gas fees for Hyperlane (as a "msg.value")
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
