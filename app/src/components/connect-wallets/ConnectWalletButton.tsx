// components/ConnectWalletButton.tsx
'use client'

import { useState, useEffect } from 'react';
//import { BrowserProvider } from 'ethers';

// @dev - Blockchain related imports
import { connectToEvmWallet } from '../../lib/blockchains/evm/connect-wallets/connect-to-evm-wallet';

/**
 * @notice - A button component to connect to an EVM wallet (e.g., MetaMask) by using "ethers.js (v6)"
 */
export default function ConnectWalletButton() {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { provider, signer } = await connectToEvmWallet(); // @dev - Connect to EVM wallet (i.e. MetaMask) on page load
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]); // @dev - To always link an connected-wallet address and display it - even if a web browser is refreshed.
    }
    init();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      const { provider, signer } = await connectToEvmWallet();
      //const provider = new BrowserProvider(window.ethereum);
      
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <button
      onClick={connectWallet}
      className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-medium hover:bg-blue-700"
    >
      {account ? ` ${account.slice(0, 6)}...` : "Connect Wallet"}
    </button>
  );
}