"use client";
import React, { type PropsWithChildren } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { base } from 'wagmi/chains';
import { AppProvider } from '@/context/AppContext';

// @dev - RainbowKit related imports
import { setConfigAndQueryClient } from '@/components/connect-wallets/ConnectWalletButtonWithRainbowkit';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from "@tanstack/react-query";
const { config, queryClient } = setConfigAndQueryClient();


export default function ClientProviders({ children }: PropsWithChildren) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";                // @dev - Production
  //const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_STAGING || "";      // @dev - Staging
  //const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEVELOPMENT || "";  // @dev - Local development and "Preview"
  const apiKey =
    process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ||
    process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY ||
    "";

  return (
    <AppProvider>
      <MiniKitProvider 
        apiKey={apiKey} 
        chain={base}
        // config={{
        //   appearance: {
        //     name: 'OpenBands MiniApp',
        //     logo: 'https://your-logo.com',
        //     mode: 'dark',
        //     theme: 'default',
        //   },
        //   wallet: {
        //     display: 'modal',
        //     termsUrl: 'https://...',
        //     privacyUrl: 'https://...',
        //     supportedWallets: { 
        //       rabby: true, 
        //       trust: true, 
        //       frame: true, 
        //     }, 
        //   },
        // }}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <GoogleOAuthProvider clientId={clientId}>
                {children}
              </GoogleOAuthProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>

        {/* 
        <GoogleOAuthProvider clientId={clientId}>
          {children}
        </GoogleOAuthProvider> 
        */}
      </MiniKitProvider>
    </AppProvider>
  );
}
