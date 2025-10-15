import { ethers, BrowserProvider, JsonRpcSigner, Network } from "ethers";
import { parseUnits } from "ethers";
import { HDNodeWallet } from "ethers/wallet";

import { EthereumProvider } from "./data-types";

// @dev - The global declaration for the EthereumProvider interface.
declare global {
  // interface EthereumProvider {
  //   request: (...args: any[]) => Promise<any>;
  //   // add more methods as needed
  // }

  // interface Window {
  //   ethereum?: EthereumProvider;
  // }
}

/**
 * @notice - Connect to Ethereum using ethers.js v6
 * @dev - ref). https://docs.ethers.io/v6/getting-started/#getting-started-connecting
 */
export async function connectToEvmWallet(): Promise<{ provider: BrowserProvider, signer: JsonRpcSigner }> {
  let signer: JsonRpcSigner | null = null;
  let provider: BrowserProvider | null = null;
  let network: Network | null = null;

  //let window: Window = { ethereum: undefined };
  //console.log("window.ethereum:", window.ethereum);

  if (window.ethereum == null) {
    // If Web3 EVM Wallet (i.e. MetaMask) is not installed, throw an error since we need a signer
    throw new Error("MetaMask or compatible Web3 wallet not found. Please install MetaMask to continue.");
  } else {

    // Connect to the MetaMask EIP-1193 object. 
    // This is a standard protocol that allows Ethers access to make all read-only requests through MetaMask.
    provider = new ethers.BrowserProvider(window.ethereum);
    //console.log("provider (in the connectToEvmWallet():", provider); // [Log]: Successfully retrieved the log

    // @dev - Check network info
    network = await provider.getNetwork();
    //console.log(`network: ${ JSON.stringify(network, null, 2) }`);   

    // [Log]: Network info retrieved
    // 
    // network: {
    //   "name": "base-sepolia",
    //   "chainId": "84532"
    // }

    // @dev - Request account access first (in order to avoid a "empty signer/provider" error due to lack of setting a signer/provider - particularly when a user open the index page on a web browser at the first time of the day).
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // It also provides an opportunity to request access to write operations, which will be performed by the private key that MetaMask manages for the user.
    signer = await provider.getSigner();
    //console.log("signer (in the connectToEvmWallet():", signer); // [Log]: "JsonRpcSigner {provider: BrowserProvider, address: '0x...'}"
  }

  return { provider, signer }; // Return the resolved value
}




//////////////////////////////////////////////////////////////////// 
// Example usage of ethers.js utilities (v6) for unit conversions //
////////////////////////////////////////////////////////////////////

// // Convert user-provided strings in ether to wei for a value
// eth = parseEther("1.0")
// // 1000000000000000000n

// // Convert user-provided strings in gwei to wei for max base fee
// feePerGas = parseUnits("4.5", "gwei")
// // 4500000000n

// // Convert a value in wei to a string in ether to display in a UI
// formatEther(eth)
// // '1.0'

// // Convert a value in wei to a string in gwei to display in a UI
// formatUnits(feePerGas, "gwei")
// // '4.5'
