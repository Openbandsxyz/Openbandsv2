import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from '@/lib/blockchains/evm/smart-contracts/wagmi/config';
import {
  setZkJwtProofManagerContractInstance,
} from '@/lib/blockchains/evm/smart-contracts/wagmi/zk-jwt-proof-manager';
import type { PublicInputs } from '@/lib/types';

interface BadgeData {
  domain: string | null;
  walletAddress: string;
  hasVerifiedBadge: boolean;
  createdAt: string | null;
}

export function useBadgeCheck() {
  const { address } = useAccount();
  const [badgeData, setBadgeData] = useState<BadgeData>({
    domain: null,
    walletAddress: '',
    hasVerifiedBadge: false,
    createdAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBadge = async () => {
      if (!address) {
        setBadgeData({
          domain: null,
          walletAddress: '',
          hasVerifiedBadge: false,
          createdAt: null,
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Set the ZkJwtProofManager contract instance
        const { zkJwtProofManagerContractAddress, zkJwtProofManagerAbi } = 
          setZkJwtProofManagerContractInstance();

        console.log('Checking badge for wallet:', address);

        // Get all public inputs from the contract
        // This returns an array of DataType.PublicInput structs containing:
        // - domain (string): e.g., "ethereum.org", "aztec-labs.com"
        // - nullifierHash (bytes32): unique proof identifier
        // - emailHash (string): hashed email
        // - walletAddress (address): connected wallet that verified the email
        // - createdAt (string): timestamp of verification
        const allPublicInputs = await readContract(wagmiConfig, {
          abi: zkJwtProofManagerAbi,
          address: zkJwtProofManagerContractAddress as `0x${string}`,
          functionName: 'getPublicInputsOfAllProofs',
        }) as PublicInputs[];

        console.log('All public inputs from contract:', allPublicInputs);
        console.log('Total verified badges on-chain:', allPublicInputs.length);

        // Find the public input that matches the connected wallet address
        // Note: Solidity addresses are checksummed, so we compare lowercase
        const walletPublicInput = allPublicInputs.find(
          (input) => input.walletAddress.toLowerCase() === address.toLowerCase()
        );

        if (walletPublicInput && walletPublicInput.domain) {
          console.log('✅ Found verified domain for wallet:', walletPublicInput.domain);
          console.log('Verification details:', {
            domain: walletPublicInput.domain,
            walletAddress: walletPublicInput.walletAddress,
            createdAt: walletPublicInput.createdAt,
            nullifierHash: walletPublicInput.nullifierHash
          });
          
          setBadgeData({
            domain: walletPublicInput.domain,
            walletAddress: address,
            hasVerifiedBadge: true,
            createdAt: walletPublicInput.createdAt,
          });
        } else {
          console.log('❌ No verified domain found for wallet:', address);
          setBadgeData({
            domain: null,
            walletAddress: address,
            hasVerifiedBadge: false,
            createdAt: null,
          });
        }
        
      } catch (err) {
        console.error('Error checking badge:', err);
        setError('Failed to check badge status');
        setBadgeData({
          domain: null,
          walletAddress: address,
          hasVerifiedBadge: false,
          createdAt: null,
        });
      } finally {
        setLoading(false);
      }
    };

    checkBadge();
  }, [address]);

  return { badgeData, loading, error };
}
