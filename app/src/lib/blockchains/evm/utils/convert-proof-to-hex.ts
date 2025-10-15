/**
 * @notice - Convert a Uint8Array type of ZK Proof to a hex string as a "proofHex"
 */
export function convertProofToHex(proof: Uint8Array): string {
  const proofHex = "0x" + Buffer.from(proof).toString("hex");
  //console.log(`proofHex: ${proofHex}`);
  return proofHex;
}