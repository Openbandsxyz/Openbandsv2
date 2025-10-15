import { Contract, JsonRpcSigner, InterfaceAbi } from "ethers";

// @dev - Blockchain related imports
import artifactOfZkJwtProofVerifier from '../artifacts/ZkJwtProofVerifier.sol/ZkJwtProofVerifier.json';

/**
 * @notice - ZkJwtProofVerifier.sol#verifyZkJwtProof(), which the HonkVerifier# verify() isinternally called.
 */
export async function verifyZkJwtProof(
  signer: JsonRpcSigner, 
  proof: Uint8Array, 
  publicInputs: Array<string | number>
): Promise<{ isValidProof: boolean }> {
  // @dev - Create the ZkJwtProofVerifier contract instance
  const zkJwtProofVerifierAddress: string = process.env.NEXT_PUBLIC_ZK_JWT_PROOF_VERIFIER_ON_BASE_MAINNET || "";
  //const zkJwtProofVerifierAddress: string = process.env.NEXT_PUBLIC_ZK_JWT_PROOF_VERIFIER_ON_BASE_TESTNET || "";
  const zkJwtProofVerifierAbi: InterfaceAbi = artifactOfZkJwtProofVerifier.abi;
  const zkJwtProofVerifier = new Contract(zkJwtProofVerifierAddress, zkJwtProofVerifierAbi, signer);
  console.log(`zkJwtProofVerifierAddress: ${zkJwtProofVerifierAddress}`);

  // @dev - Convert Uint8Array proof to hex string proofHex
  const proofHex = "0x" + Buffer.from(proof).toString("hex");
  //const proofHex = uint8ArrayToHex(proof);
  console.log(`proofHex: ${proofHex}`);

  const publicInputsStringArray = JSON.stringify(publicInputs, null, 2);
  console.log(`publicInputsStringArray: ${publicInputsStringArray}`);

  // @dev - Call the verifyZkJwtProof() in the ZkJwtProofVerifier.sol
  //const isValidProof = await zkJwtProofVerifier.verifyZkJwtProof(proofHex, publicInputsArray);
  const isValidProof = await zkJwtProofVerifier.verifyZkJwtProof(proofHex, publicInputs);
  console.log(`isValidProof: ${isValidProof}`);

  return { isValidProof };
}