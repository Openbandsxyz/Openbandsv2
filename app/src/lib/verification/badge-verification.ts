/**
 * OpenBands v2 - Badge Verification Utilities
 * 
 * Server-side utilities for verifying user badges (attestations) against deployed smart contracts.
 * Used by API routes to enforce access control for community creation, joining, and posting.
 */

import { readContract } from '@wagmi/core';
import { wagmiConfig } from '@/lib/blockchains/evm/smart-contracts/wagmi/config';
import type { Abi } from 'viem';

// Import ABIs from existing wagmi contract configs
import { nationalityRegistryContractConfig } from '@/lib/blockchains/evm/smart-contracts/wagmi/nationality-registry';
import { ageRegistryContractConfig } from '@/lib/blockchains/evm/smart-contracts/wagmi/age-registry';
import artifactOfZkJwtProofManager from '@/lib/blockchains/evm/smart-contracts/artifacts/ZkJwtProofManager.sol/ZkJwtProofManager.json';

// Contract addresses
const NATIONALITY_REGISTRY = "0x5aCA8d5C9F44D69Fa48cCeCb6b566475c2A5961a" as const;
const AGE_REGISTRY = "0x72f1619824bcD499F4a27E28Bf9F1aa913c2EF2a" as const;
const CELO_MAINNET = 42220;
const BASE_MAINNET = 8453;

/**
 * Verify user has nationality badge
 */
export async function verifyNationalityBadge(
  userAddress: string
): Promise<{ 
  isVerified: boolean; 
  nationality: string | null;
  verifiedAt: bigint | null;
}> {
  try {
    // Check if user is verified
    const isVerified = await readContract(wagmiConfig, {
      address: NATIONALITY_REGISTRY,
      abi: nationalityRegistryContractConfig.abi,
      functionName: 'isUserVerified',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    }) as boolean;
    
    if (!isVerified) {
      return { isVerified: false, nationality: null, verifiedAt: null };
    }
    
    // Get nationality
    const nationality = await readContract(wagmiConfig, {
      address: NATIONALITY_REGISTRY,
      abi: nationalityRegistryContractConfig.abi,
      functionName: 'getUserNationality',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    }) as string;
    
    // Get record for timestamp
    const record = await readContract(wagmiConfig, {
      address: NATIONALITY_REGISTRY,
      abi: nationalityRegistryContractConfig.abi,
      functionName: 'getNationalityRecord',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    }) as { verifiedAt: bigint };
    
    return {
      isVerified: true,
      nationality,
      verifiedAt: record.verifiedAt,
    };
  } catch (error) {
    console.error('[Badge Verification] Nationality verification failed:', error);
    return { isVerified: false, nationality: null, verifiedAt: null };
  }
}

/**
 * Verify user has company email badge
 */
export async function verifyCompanyBadge(
  userAddress: string
): Promise<{
  isVerified: boolean;
  domain: string | null;
  verifiedAt: bigint | null;
}> {
  try {
    // Use the correct environment variable name (with fallback for backwards compatibility)
    const ZKJWT_MANAGER = process.env.NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_MAINNET || 
                          process.env.NEXT_PUBLIC_ZKJWT_PROOF_MANAGER_ADDRESS;
    
    if (!ZKJWT_MANAGER) {
      console.error('[Badge Verification] ZKJWT_MANAGER address not configured. Please set NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_MAINNET');
      return { isVerified: false, domain: null, verifiedAt: null };
    }
    
    // Get all proofs
    const allProofs = await readContract(wagmiConfig, {
      address: ZKJWT_MANAGER as `0x${string}`,
      abi: artifactOfZkJwtProofManager.abi as Abi,
      functionName: 'getPublicInputsOfAllProofs',
      chainId: BASE_MAINNET,
    }) as Array<{
      domain: string;
      walletAddress: string;
      createdAt: string;
    }>;
    
    // Find proof for this user
    const userProof = allProofs.find(
      proof => proof.walletAddress.toLowerCase() === userAddress.toLowerCase()
    );
    
    if (!userProof || !userProof.domain) {
      return { isVerified: false, domain: null, verifiedAt: null };
    }
    
    // Convert createdAt to BigInt
    // Handle both ISO date strings and numeric timestamps
    let verifiedAt: bigint;
    if (typeof userProof.createdAt === 'string') {
      // If it's an ISO date string, convert to timestamp first
      if (userProof.createdAt.includes('T') || userProof.createdAt.includes('-')) {
        verifiedAt = BigInt(Math.floor(new Date(userProof.createdAt).getTime() / 1000));
      } else {
        // If it's already a numeric string, convert directly
        verifiedAt = BigInt(userProof.createdAt);
      }
    } else {
      // If it's already a number, convert to BigInt
      verifiedAt = BigInt(userProof.createdAt);
    }
    
    return {
      isVerified: true,
      domain: userProof.domain,
      verifiedAt,
    };
  } catch (error) {
    console.error('[Badge Verification] Company verification failed:', error);
    return { isVerified: false, domain: null, verifiedAt: null };
  }
}

/**
 * Verify user has age badge
 */
export async function verifyAgeBadge(
  userAddress: string
): Promise<{
  isVerified: boolean;
  verifiedAt: bigint | null;
}> {
  try {
    const isVerified = await readContract(wagmiConfig, {
      address: AGE_REGISTRY,
      abi: ageRegistryContractConfig.abi,
      functionName: 'isUserAgeVerified',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    }) as boolean;
    
    if (!isVerified) {
      return { isVerified: false, verifiedAt: null };
    }
    
    const record = await readContract(wagmiConfig, {
      address: AGE_REGISTRY,
      abi: ageRegistryContractConfig.abi,
      functionName: 'getAgeRecord',
      args: [userAddress as `0x${string}`],
      chainId: CELO_MAINNET,
    }) as { verifiedAt: bigint };
    
    return {
      isVerified: true,
      verifiedAt: record.verifiedAt,
    };
  } catch (error) {
    console.error('[Badge Verification] Age verification failed:', error);
    return { isVerified: false, verifiedAt: null };
  }
}

/**
 * Generic verification router with value matching
 */
export async function verifyUserBadge(
  userAddress: string,
  attestationType: 'nationality' | 'age' | 'company',
  requiredValue?: string // Only for nationality/company
): Promise<{
  isVerified: boolean;
  actualValue: string | null;
  verifiedAt: bigint | null;
  error?: string;
}> {
  switch (attestationType) {
    case 'nationality': {
      const result = await verifyNationalityBadge(userAddress);
      
      if (!result.isVerified) {
        return { 
          isVerified: false, 
          actualValue: null, 
          verifiedAt: null,
          error: 'User has not verified nationality' 
        };
      }
      
      // Check if nationality matches required value
      if (requiredValue && result.nationality !== requiredValue) {
        return {
          isVerified: false,
          actualValue: result.nationality,
          verifiedAt: result.verifiedAt,
          error: `User nationality (${result.nationality}) does not match required (${requiredValue})`,
        };
      }
      
      return {
        isVerified: true,
        actualValue: result.nationality,
        verifiedAt: result.verifiedAt,
      };
    }
    
    case 'company': {
      const result = await verifyCompanyBadge(userAddress);
      
      if (!result.isVerified) {
        return {
          isVerified: false,
          actualValue: null,
          verifiedAt: null,
          error: 'User has not verified company email',
        };
      }
      
      // Check if domain matches required value
      if (requiredValue && result.domain !== requiredValue) {
        return {
          isVerified: false,
          actualValue: result.domain,
          verifiedAt: result.verifiedAt,
          error: `User domain (${result.domain}) does not match required (${requiredValue})`,
        };
      }
      
      return {
        isVerified: true,
        actualValue: result.domain,
        verifiedAt: result.verifiedAt,
      };
    }
    
    case 'age': {
      const result = await verifyAgeBadge(userAddress);
      
      if (!result.isVerified) {
        return {
          isVerified: false,
          actualValue: null,
          verifiedAt: null,
          error: 'User has not verified age',
        };
      }
      
      return {
        isVerified: true,
        actualValue: 'verified', // Age doesn't have specific value in MVP
        verifiedAt: result.verifiedAt,
      };
    }
    
    default:
      return {
        isVerified: false,
        actualValue: null,
        verifiedAt: null,
        error: 'Invalid attestation type',
      };
  }
}

/**
 * Retry wrapper for contract calls
 */
export async function verifyWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`[Badge Verification] Retry attempt ${i + 1}/${retries} after error:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('All retry attempts failed');
}

