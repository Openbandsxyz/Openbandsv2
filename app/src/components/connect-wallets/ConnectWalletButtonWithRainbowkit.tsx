// components/ConnectWalletButton.tsx
'use client'
import { useState, useEffect } from 'react';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, Config, useAccount, useDisconnect } from 'wagmi';
import { base } from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { reconnect, getConnections } from '@wagmi/core';
import { wagmiConfig } from '@/lib/blockchains/evm/smart-contracts/wagmi/config';

// @dev - Blockchain related imports
//import { connectToEvmWallet } from '../../lib/blockchains/evm/connect-wallets/connect-to-evm-wallet';

/**
 * @notice - Set up and return the RainbowKit config and React Query client
 */
export function setConfigAndQueryClient(): { config: Config, queryClient: QueryClient } {
  const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

  // Set up config for RainbowKit
  const config = getDefaultConfig({
    appName: 'OpenBands MiniApp',
    projectId: PROJECT_ID,
    chains: [base],
    //chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: true, // If your dApp uses server side rendering (SSR)
  });

  // @dev - React Query Client for RainbowKit
  const queryClient = new QueryClient();

  return { config, queryClient };
}

/** 
 * @dev - Utility function to check if there are stored connections
 */
function hasStoredConnections(): boolean {
  try {
    // Check if there are any stored wallet connections
    const connections = getConnections(wagmiConfig);
    return connections.length > 0;
  } catch (error) {
    console.warn('Error checking stored connections:', error);
    return false;
  }
}

/**
 * @notice - A button component to connect to an EVM wallet (e.g., MetaMask) by using the RainbowKit
 * @dev - Includes automatic reconnection to previously connected wallets
 */
export default function ConnectWalletButtonWithRainbowkit() {
  const [isReconnecting, setIsReconnecting] = useState(true);
  const [reconnectAttempted, setReconnectAttempted] = useState(false);
  
  // @dev - Wagmi hooks for connection status
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    async function handleReconnect() {
      if (reconnectAttempted) return; // Prevent multiple reconnect attempts
      
      // @dev - Check if there are stored connections first
      const hasStored = hasStoredConnections();
      if (!hasStored) {
        console.log('No stored wallet connections found');
        setIsReconnecting(false);
        setReconnectAttempted(true);
        return;
      }
      
      try {
        setIsReconnecting(true);
        setReconnectAttempted(true);
        
        console.log('Attempting to reconnect to previously connected wallets...');
        
        // @dev - Attempt to reconnect to previously connected wallets
        const result = await reconnect(wagmiConfig, {
          // Optional parameters you can use:
          // connectors: [specificConnectors], // Limit to specific connectors
        });
        
        console.log('Reconnection attempt completed:', result);
      } catch (error) {
        console.warn('Reconnection failed:', error);
      } finally {
        setIsReconnecting(false);
      }
    }
    
    handleReconnect();
  }, [reconnectAttempted]);

  // @dev - Manual reconnect function for user-triggered reconnection
  const handleManualReconnect = async () => {
    setIsReconnecting(true);
    try {
      await reconnect(wagmiConfig);
      console.log('Manual reconnection successful');
    } catch (error) {
      console.error('Manual reconnection failed:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  // @dev - Show loading state while reconnecting or connecting
  if (isReconnecting || isConnecting) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 p-2">
        <span className="animate-spin">🔄</span>
        <span>{isReconnecting ? 'Restoring wallet connection...' : 'Connecting...'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ConnectButton />
      
      {/* @dev - Connection status and manual reconnect option */}
      {/* 
      {!isConnected && reconnectAttempted && (
        <div className="text-center">
          <button
            onClick={handleManualReconnect}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            disabled={isReconnecting}
          >
            Try reconnecting to previous wallet
          </button>
        </div>
      )}
      */}
      
      {/* @dev - Debug info (remove in production) */}
      {/*
      {process.env.NODE_ENV === 'development' && address && (
        <div className="text-xs text-gray-500 mt-2">
          <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
          <div>Address: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
        </div>
      )}
      */}
    </div>
  );
}
