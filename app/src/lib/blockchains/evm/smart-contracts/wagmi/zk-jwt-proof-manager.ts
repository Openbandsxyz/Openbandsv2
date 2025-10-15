/**
 * @notice - This file is a library to interact with the ZkJwtProofManager smart contract using Wagmi.
 * @dev - ref). Write Contract - https://wagmi.sh/react/guides/write-to-contract#_3-add-a-form-handler
 */
import { useWriteContract } from 'wagmi'
import type { Abi } from 'viem';

// @dev - Blockchain related imports
import artifactOfZkJwtProofManager from '../artifacts/ZkJwtProofManager.sol/ZkJwtProofManager.json';

/**
 * @notice - Set the ZkJwtProofManager contract instance
 */
export function setZkJwtProofManagerContractInstance(): { zkJwtProofManagerContractAddress: string, zkJwtProofManagerAbi: Abi } {
  // @dev - Create the ZkJwtProofManager contract instance
  const zkJwtProofManagerContractAddress: string = process.env.NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_MAINNET || "";  
  //const zkJwtProofManagerContractAddress: string = process.env.NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_TESTNET || "";  
  const zkJwtProofManagerAbi = artifactOfZkJwtProofManager.abi;
  //console.log(`zkJwtProofManagerContractAddress: ${zkJwtProofManagerContractAddress}`);
  return { zkJwtProofManagerContractAddress, zkJwtProofManagerAbi: zkJwtProofManagerAbi as Abi };
}

/**
 * @notice - Set the ZkJwtProofManager contract instance as a "zkJwtProofManagerContractConfig" 
 * @dev - [NOTE]: Currently, this variable is not used.
 */
const { zkJwtProofManagerContractAddress, zkJwtProofManagerAbi } = setZkJwtProofManagerContractInstance();
export const zkJwtProofManagerContractConfig = {
  address: zkJwtProofManagerContractAddress,
  abi: zkJwtProofManagerAbi,
} as const

// function callSmartContractFunction(contractAddress: string, abi: Abi, functionName: string, args: string[]) {
//   // @dev - Wagmi
//   const { data: hash, writeContract } = useWriteContract();
// 
//   writeContract({
//     address: contractAddress,
//     abi: abi,
//     functionName: functionName,
//     args: args
//   })
// 
//   console.log("Transaction Hash: ", hash);
// }

/**
 * @notice - ZkJwtProofManager.sol# recordPublicInputsOfZkJwtProof() with Wagmi.
 * @dev - [NOTE]: Not used at the moment.
 */
// export function recordPublicInputsOfZkJwtProof() {
//   const { data: hash, writeContract } = useWriteContract();
// 
//   // Returns an async function to call the contract
//   return async function recordPublicInputsOfZkJwtProof(
//     //_recordPublicInputsOfZkJwtProof: typeof writeContract,
//     proof: Uint8Array,
//     publicInputs: Array<string | number>,
//     separatedPublicInputs: {
//       domain: string;
//       nullifierHash: string;
//       //emailHash?: string;
//       walletAddress: string;
//       createdAt: string;
//     }
//   ) {
//     // @dev - Set the ZkJwtProofManager contract instance
//     const { zkJwtProofManagerContractAddress, zkJwtProofManagerAbi } = await setZkJwtProofManagerContractInstance();
// 
//     // @dev - Convert Uint8Array proof to hex string proofHex
//     const proofHex = "0x" + Buffer.from(proof).toString("hex");
//     console.log(`proofHex: ${proofHex}`);
// 
//     let tx: string | undefined;
//     try {
//       tx = writeContract({
//         address: zkJwtProofManagerContractAddress as `0x${string}`,
//         abi: zkJwtProofManagerAbi,
//         functionName: "recordPublicInputsOfZkJwtProof",
//         args: [proofHex, publicInputs, separatedPublicInputs]
//       });
//     } catch (err) {
//       console.error(`Failed to send a // transaction on BASE: ${err}`);
//     }
//     return { tx };
//   }
// }
