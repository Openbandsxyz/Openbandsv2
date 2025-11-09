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
 * @notice Event data structure for NationalityVerified event
 * @dev Matches the event signature in OpenbandsV2NationalityRegistry.sol:
 *      event NationalityVerified(address indexed user, string nationality, bytes32 messageId, uint256 timestamp)
 */
export interface NationalityVerifiedEvent {
  user: `0x${string}`;
  nationality: string;
  messageId: `0x${string}`;  // Hyperlane message ID for cross-chain bridging to Base
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

/**
 * @notice Watch for the NationalityVerified event, which is emitted via the OpenbandsV2NationalityRegistry#customVerificationHook()
 * @dev This event is triggered when a user successfully verifies their nationality via Self.xyz
 *      The event includes a Hyperlane messageId which tracks the cross-chain message to Base
 *      Uses polling mode to avoid "filter not found" errors on public RPC endpoints
 * @param chainId - Optional chain ID to determine which contract to watch (42220 for Celo Mainnet, 11142220 for Celo Sepolia)
 * @param onEvent - Callback function to handle parsed event data
 * @returns Unwatch function to stop listening for events
 */
export function watchNationalityVerifiedEvent(
  chainId?: number,
  onEvent?: (event: NationalityVerifiedEvent) => void
) {
  try {
    const nationalityRegistryContractAddress = getNationalityRegistryAddress(chainId);
    
    if (!nationalityRegistryContractAddress) {
      console.error('❌ Cannot watch events: Nationality Registry contract address not configured');
      console.error(`   Please set environment variable for chain ID: ${chainId}`);
      return () => {}; // Return empty unwatch function
    }

    console.log('👀 Watching NationalityVerified events...');
    console.log(`📍 Contract Address: ${nationalityRegistryContractAddress}`);
    console.log(`🔗 Chain ID: ${chainId || 'default'}`);
    console.log(`🔄 Using polling mode to avoid RPC filter issues`);
    console.log('─────────────────────────────────────────────');
    
    const unwatch = watchContractEvent(wagmiConfig, {
      address: nationalityRegistryContractAddress,
      abi: openbandsV2NationalityRegistryContractConfig.abi,
      eventName: 'NationalityVerified',
      poll: true, // Use polling instead of filters to avoid "filter not found" errors
      pollingInterval: 5_000, // Poll every 5 seconds (adjust as needed)
      onLogs(logs) {
        console.log('\n🎉 NationalityVerified event detected!');
        console.log(`📊 Total logs received: ${logs.length}`);
        
        // Process each log entry
        logs.forEach((log, index) => {
          try {
            console.log(`\n╔════════════════════════════════════════════╗`);
            console.log(`║  📋 Processing Event Log #${index + 1}              ║`);
            console.log(`╚════════════════════════════════════════════╝`);
            
            // Parse event arguments matching the Solidity event signature
            const { user, nationality, messageId, timestamp } = log.args;
            
            // Log detailed event information
            console.log(`\n🔹 Event Details:`);
            console.log(`   👤 User Address: ${user}`);
            console.log(`   🌍 Nationality: ${nationality}`);
            console.log(`   📨 Hyperlane Message ID: ${messageId}`);
            console.log(`   ⏰ Timestamp: ${timestamp}`);
            console.log(`   📅 Date: ${new Date(Number(timestamp) * 1000).toISOString()}`);
            console.log(`\n🔹 Transaction Info:`);
            console.log(`   📦 Block Number: ${log.blockNumber}`);
            console.log(`   🔗 Transaction Hash: ${log.transactionHash}`);
            console.log(`\n🔹 Cross-Chain Info:`);
            console.log(`   🌉 Message ID (Hyperlane): ${messageId}`);
            console.log(`   🎯 This message bridges nationality data from Celo → Base`);
            console.log(`   ✅ Track this messageId to verify delivery on Base chain`);
            console.log(`\n${'═'.repeat(50)}\n`);
            
            // Create structured event data
            const eventData: NationalityVerifiedEvent = {
              user: user as `0x${string}`,
              nationality: nationality as string,
              messageId: messageId as `0x${string}`,
              timestamp: timestamp as bigint,
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash
            };
            
            // Call the callback function if provided
            if (onEvent) {
              console.log('📞 Calling event callback handler...');
              onEvent(eventData);
            }
            
            // Emit a custom browser event for UI updates
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('nationalityVerified', {
                detail: eventData
              }));
              console.log('📡 Browser event dispatched: "nationalityVerified"');
            }
            
          } catch (parseError) {
            console.error(`\n❌ Error parsing log #${index + 1}:`);
            console.error('   Error:', parseError);
            console.error('   Raw log data:', log);
          }
        });
        
        console.log('\n✅ Event processing completed!\n');
      },
      onError(error) {
        // Filter out common "filter not found" errors that are expected with polling
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('filter not found')) {
          console.warn('⚠️ Filter expired (expected with polling mode) - will recreate on next poll');
          return;
        }
        
        console.error('\n❌ Error in NationalityVerified event watcher:');
        console.error('   Error:', error);
        console.error('   Contract Address:', nationalityRegistryContractAddress);
        console.error('   Chain ID:', chainId);
        console.error('   Note: If you see "filter not found" errors, this is normal with public RPC nodes');
      }
    });

    console.log('✅ Event watcher successfully initialized');
    console.log('🔔 Listening for NationalityVerified events...\n');
    
    return unwatch;
    
  } catch (error) {
    console.error('\n❌ Error setting up NationalityVerified event watcher:');
    console.error('   Error:', error);
    console.error('   Chain ID:', chainId);
    return () => {}; // Return empty unwatch function on error
  }
}


