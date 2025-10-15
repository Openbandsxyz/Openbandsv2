import { Contract, JsonRpcSigner, TransactionResponse, TransactionReceipt } from "ethers";

// @dev - Blockchain related imports
import artifactOfZkJwtProofManager from '../artifacts/ZkJwtProofManager.sol/ZkJwtProofManager.json';

/**
 * @notice - Set the ZkJwtProofManager contract instance
 */
export async function setContractInstance(signer: JsonRpcSigner): Promise<{ zkJwtProofManager: Contract }> {
  // @dev - Create the ZkJwtProofManager contract instance
  const zkJwtProofManagerContractAddress: string = process.env.NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_MAINNET || "";  
  //const zkJwtProofManagerContractAddress: string = process.env.NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_TESTNET || "";  
  const zkJwtProofManagerAbi = artifactOfZkJwtProofManager.abi;
  const zkJwtProofManager = new Contract(zkJwtProofManagerContractAddress, zkJwtProofManagerAbi, signer);
  console.log(`zkJwtProofManagerContractAddress: ${zkJwtProofManagerContractAddress}`);
  return { zkJwtProofManager };
}

/**
 * @notice - ZkJwtProofManager.sol# recordPublicInputsOfZkJwtProof()
 */
export async function recordPublicInputsOfZkJwtProof(
  signer: JsonRpcSigner,
  proof: Uint8Array,
  publicInputs: Array<string | number>,
  separatedPublicInputs: {
    domain: string;
    nullifierHash: string;
    //emailHash: string;   // [TODO]: A proper hashing method is to be considered later.
    walletAddress: string;
    createdAt: string;
  }
): Promise<{ txReceipt: TransactionReceipt | null }> {
  // @dev - Set the ZkJwtProofManager contract instance
  const { zkJwtProofManager } = await setContractInstance(signer);

  // @dev - Convert Uint8Array proof to hex string proofHex
  const proofHex = "0x" + Buffer.from(proof).toString("hex");
  console.log(`proofHex: ${proofHex}`);
  
  // @dev - Call the recordPublicInputsOfZkJwtProof() function in the ZkJwtProofManager.sol
  let tx: TransactionResponse;
  let txReceipt: TransactionReceipt | null = null;
  try {
    tx = await zkJwtProofManager.recordPublicInputsOfZkJwtProof(
      proofHex, 
      publicInputs,
      separatedPublicInputs
      //{ value: parseEther("0.001") }  // @dev - Send a TX with 0.01 ETH -> This is not a gas fee. Hence, this is commented out.
    );
    
    // Wait for the transaction to be included.
    txReceipt = await tx.wait();
  } catch (err) {
    console.error(`Failed to send a transaction on BASE: ${err}`);
  }

  return { txReceipt };
}

/**
 * @notice - ZkJwtProofManager.sol# getPublicInputsOfZkJwtProof()
 */
export async function getPublicInputsOfZkJwtProof(signer: JsonRpcSigner, nullifierHash: string): Promise<{ publicInputsFromOnChain: string[] }> {
  // @dev - Set the ZkJwtProofManager contract instance
  const { zkJwtProofManager } = await setContractInstance(signer);

  const publicInputsFromOnChain = await zkJwtProofManager.getPublicInputsOfZkJwtProof(nullifierHash);
  return { publicInputsFromOnChain };
}

/**
 * @notice - ZkJwtProofManager.sol# getNullifiersByDomainAndWalletAddresses()
 */
export async function getNullifiersByDomainAndWalletAddresses(signer: JsonRpcSigner, domain: string): Promise<{ nullifierFromOnChainByDomainAndWalletAddress: string }> {
  // @dev - Set the ZkJwtProofManager contract instance
  const { zkJwtProofManager } = await setContractInstance(signer);

  const nullifierFromOnChainByDomainAndWalletAddress = await zkJwtProofManager.getNullifiersByDomainAndWalletAddresses(domain);
  return { nullifierFromOnChainByDomainAndWalletAddress };
}

/**
 * @notice - ZkJwtProofManager.sol# getNullifiersByDomainAndEmailHashAndWalletAddresses()
 */
// export async function getNullifiersByDomainAndEmailHashAndWalletAddresses(signer: JsonRpcSigner, domain: string, emailHash: string): Promise<{ nullifierFromOnChainByDomainAndEmailHashAndWalletAddress: string }> {
//   // @dev - Set the ZkJwtProofManager contract instance
//   const { zkJwtProofManager } = await setContractInstance(signer);

//   const nullifierFromOnChainByDomainAndEmailHashAndWalletAddress = await zkJwtProofManager.getNullifiersByDomainAndEmailHashAndWalletAddresses(domain, emailHash);
//   return { nullifierFromOnChainByDomainAndEmailHashAndWalletAddress };
// }