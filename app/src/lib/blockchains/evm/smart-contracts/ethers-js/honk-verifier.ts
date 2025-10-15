import { Contract, JsonRpcSigner } from "ethers";

// @dev - Blockchain related imports
import artifactOfHonkVerifier from '../artifacts/honk_vk.sol/HonkVerifier.json';

/**
 * @notice - HonkVerifier# verify()
 */
export async function verifyViaHonkVerifier(
  signer: JsonRpcSigner, 
  proof: Uint8Array, 
  publicInputs: Array<string | number>
): Promise<{ isValidProofViaHonkVerifier: boolean }> {
  // @dev - Create the HonkVerifier contract instance
  const honkVerifierAddress: string = process.env.NEXT_PUBLIC_HONK_VERIFIER_ON_BASE_MAINNET || "";
  //const honkVerifierAddress: string = process.env.NEXT_PUBLIC_HONK_VERIFIER_ON_BASE_TESTNET || "";
  const honkVerifierAbi = artifactOfHonkVerifier.abi;
  const honkVerifier = new Contract(honkVerifierAddress, honkVerifierAbi, signer);
  console.log(`honkVerifierAddress: ${honkVerifierAddress}`);

  // @dev - Convert Uint8Array proof to hex string proofHex
  const proofHex = "0x" + Buffer.from(proof).toString("hex");
  //const proofHex = uint8ArrayToHex(proof);
  console.log(`proofHex: ${proofHex}`);

  const publicInputsStringArray = JSON.stringify(publicInputs, null, 2);
  console.log(`publicInputsStringArray: ${publicInputsStringArray}`);

  // @dev - Call the verify() in the HonkVerifier.sol
  const isValidProofViaHonkVerifier = await honkVerifier.verify(proofHex, publicInputs);
  console.log(`isValidProof: ${isValidProofViaHonkVerifier}`);

  return { isValidProofViaHonkVerifier };
}