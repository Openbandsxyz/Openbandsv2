// components/ConnectWalletButton.tsx
'use client'
import { useState, useEffect } from 'react';

import { 
  Wallet, 
  ConnectWallet, 
  WalletDropdown, WalletDropdownDisconnect, 
} from '@coinbase/onchainkit/wallet';

import { Identity, Avatar, Name, Address, EthBalance } from '@coinbase/onchainkit/identity';

// @dev - Blockchain related imports
//import { connectToEvmWallet } from '../../lib/blockchains/evm/connect-wallets/connect-to-evm-wallet';

/**
 * @notice - A button component to connect to an EVM wallet (e.g., MetaMask) by using the <Wallet /> component powered by BASE's OnChainKit.
 */
export default function ConnectWalletButtonWithOnchainkit() {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      // const { provider, signer } = await connectToEvmWallet(); // @dev - Connect to EVM wallet (i.e. MetaMask) on page load
      // const accounts = await provider.send("eth_requestAccounts", []);
      // setAccount(accounts[0]); // @dev - To always link an connected-wallet address and display it - even if a web browser is refreshed.
    }
    init();
  }, []);

  // const connectWallet = async () => {
  //   if (typeof window.ethereum === 'undefined') {
  //     alert('MetaMask is not installed!');
  //     return;
  //   }

  //   try {
  //     const { provider, signer } = await connectToEvmWallet();
  //     //const provider = new BrowserProvider(window.ethereum);
      
  //     const accounts = await provider.send("eth_requestAccounts", []);
  //     setAccount(accounts[0]);
  //   } catch (error) {
  //     console.error("Connection failed:", error);
  //   }
  // };

  return (
    <Wallet>
      <ConnectWallet>
        <Avatar className="h-6 w-6" />
        <Name />
      </ConnectWallet>
      <WalletDropdown>
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}