// @dev - Wagmi related imports
import { simulateContract, writeContract, readContract, watchContractEvent, getBlockNumber } from '@wagmi/core'
import { wagmiConfig } from "@/lib/blockchains/evm/smart-contracts/wagmi/config";
import type { Abi } from 'viem';
import { createPublicClient, http, parseAbiItem } from 'viem';

// @dev - Artifact of the OpenbandsV2NationalityRegistry contract
import artifactOfOpenbandsV2NationalityRegistry from '@/lib/blockchains/evm/smart-contracts/artifacts/OpenbandsV2NationalityRegistry.sol/OpenbandsV2NationalityRegistry.json';
//import artifactOfOpenbandsV2NationalityRegistry from '@/lib/blockchains/evm/smart-contracts/artifacts/nationality-registry/OpenbandsV2NationalityRegistry.json';

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
export function getNationalityRegistryAddress(chainId?: number): `0x${string}` | undefined {
  // Celo Mainnet (42220)
  if (chainId === 42220) {
    const address = process.env.NEXT_PUBLIC_OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET;
    return address ? (address as `0x${string}`) : undefined;
  }
  // Celo Sepolia Testnet (11142220)
  if (chainId === 11142220) {
    const address = process.env.NEXT_PUBLIC_OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_SEPOLIA;
    return address ? (address as `0x${string}`) : undefined;
  }
  
  console.warn(`⚠️ No contract address configured for chain ID: ${chainId}`);
  return undefined;
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
 * @notice Query past NationalityVerified events from (a given "chain ID" of) blockchain
 * @param userAddress - The user's address to query events for
 * @param chainId - The chain ID (42220 for Celo Mainnet, 11142220 for Celo Sepolia)
 * @param blocksBack - How many blocks to look back (default: 1000)
 * @returns Array of NationalityVerifiedEvent objects
 */
export async function queryNationalityVerifiedEvents(
  userAddress: `0x${string}`,
  chainId: number,
  blocksBack: number = 1000
): Promise<NationalityVerifiedEvent[]> {
  try {
    const contractAddress = getNationalityRegistryAddress(chainId);
    
    if (!contractAddress) {
      console.error(`❌ No contract address for chain ${chainId}`);
      return [];
    }

    // Get current block number
    const currentBlock = await getBlockNumber(wagmiConfig, { chainId });
    const fromBlock = currentBlock - BigInt(blocksBack);

    console.log(`🔍 Querying past NationalityVerified events...`);
    console.log(`   User: ${userAddress}`);
    console.log(`   Blocks: ${fromBlock} to ${currentBlock} (${blocksBack} blocks)`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Chain ID: ${chainId}`);

    // Get RPC URL for the chain
    let rpcUrl: string;
    if (chainId === 42220) {
      rpcUrl = process.env.NEXT_PUBLIC_CELO_MAINNET_RPC_URL || 'https://forno.celo.org';
    } else if (chainId === 11142220) {
      rpcUrl = process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org';
    } else {
      console.error(`❌ Unsupported chain ID: ${chainId}`);
      return [];
    }

    // Create a public client to query logs
    const publicClient = createPublicClient({
      transport: http(rpcUrl)
    });

    // Query logs using viem's getLogs
    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: parseAbiItem('event NationalityVerified(address indexed user, string nationality, bytes32 messageId, uint256 timestamp)'),
      args: {
        user: userAddress
      },
      fromBlock,
      toBlock: currentBlock
    });

    console.log(`📊 Found ${logs.length} event(s)`);

    // Parse logs into events
    const events: NationalityVerifiedEvent[] = logs.map(log => {
      const args = log.args as { user: `0x${string}`; nationality: string; messageId: `0x${string}`; timestamp: bigint };
      return {
        user: args.user,
        nationality: args.nationality,
        messageId: args.messageId,
        timestamp: args.timestamp,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash
      };
    });

    // Log each event found
    events.forEach((event, index) => {
      console.log(`\n📋 Event #${index + 1}:`);
      console.log(`   User: ${event.user}`);
      console.log(`   Nationality: ${event.nationality}`);
      console.log(`   Message ID: ${event.messageId}`);
      console.log(`   Timestamp: ${event.timestamp}`);
      console.log(`   Block: ${event.blockNumber}`);
      console.log(`   Tx: ${event.transactionHash}`);
    });

    return events;
  } catch (error) {
    console.error('❌ Error querying past events:', error);
    console.error('   Error details:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * @notice Watch for the NationalityVerified event, which is emitted via the OpenbandsV2NationalityRegistry#customVerificationHook()
 * @dev This event is triggered when a user successfully verifies their nationality via Self.xyz
 *      The event includes a Hyperlane messageId which tracks the cross-chain message to Base
 *      Uses polling mode to avoid "filter not found" errors on public RPC endpoints
 * @param chainId - Optional chain ID to determine which contract to watch (42220 for Celo Mainnet, 11142220 for Celo Sepolia)
 * @param onEvent - Callback function to handle parsed event data
 * @param fromBlock - Block number to start watching from (defaults to 'latest' for new events only)
 * @returns Unwatch function to stop listening for events
 */
export function watchNationalityVerifiedEvent(
  chainId?: number,
  onEvent?: (event: NationalityVerifiedEvent) => void,
  fromBlock?: bigint | 'latest'
) {
  try {
    const nationalityRegistryContractAddress = getNationalityRegistryAddress(chainId);
    
    if (!nationalityRegistryContractAddress) {
      console.error('❌ Cannot watch events: Nationality Registry contract address not configured');
      console.error(`   Please set environment variable for chain ID: ${chainId}`);
      return () => {}; // Return empty unwatch function
    }

    // Use 'latest' by default to only catch new events, or allow specifying a starting block
    const watchFromBlock = fromBlock || 'latest';
    
    console.log('👀 Watching NationalityVerified events...');
    console.log(`📍 Contract Address: ${nationalityRegistryContractAddress}`);
    console.log(`🔗 Chain ID: ${chainId || 'default'}`);
    console.log(`🔄 Polling mode enabled (every 3 seconds)`);
    console.log(`📊 Watching from block: ${watchFromBlock}`);
    console.log('─────────────────────────────────────────────');
    
    const unwatch = watchContractEvent(wagmiConfig, {
      address: nationalityRegistryContractAddress,
      abi: openbandsV2NationalityRegistryContractConfig.abi,
      eventName: 'NationalityVerified',
      poll: true, // Use polling instead of filters to avoid "filter not found" errors
      pollingInterval: 3_000, // Poll every 3 seconds for faster event detection
      // @ts-ignore - fromBlock is not in the type but is supported
      fromBlock: watchFromBlock, // Start watching from this block
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


