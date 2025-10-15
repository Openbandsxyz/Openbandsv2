//import type { JWK } from "@/lib/types";
import { getJwtHeader, extractDomain, getGooglePublicKey } from "@/lib/google-jwt/google-jwt";

// @dev - Noir
import { generateInputs } from "noir-jwt";
import { InputMap, type CompiledCircuit } from "@noir-lang/noir_js";
import { initProver } from "./lazy-modules";

//const MAX_PARTIAL_DATA_LENGTH = 640
const MAX_DOMAIN_LENGTH = 64;

export interface ZkJwtProofResult {
  proof: Uint8Array;
  publicInputs: string[];
}

/**
 * @notice - Generates a zero-knowledge proof for a JWT
 * @param email 
 * @param idToken 
 */
export async function generateZkJwtProof(email: string, idToken: string): Promise<ZkJwtProofResult> {
  const domain = extractDomain(email);
  //const domain = email.split('@')[1];

  const jwtHeader = getJwtHeader(idToken);
  const jwtPubkey = await getGooglePublicKey(jwtHeader.kid);

  const { proof, publicInputs } = await _generateZkJwtProof(idToken, jwtPubkey, domain);

  return { proof, publicInputs };
}


/**
 * @notice - Run the zkJWT circuit with NoirJS/bb.js
 * @param idToken 
 * @param jwtPubkey 
 * @param domain 
 */
async function _generateZkJwtProof(
  idToken: string,
  jwtPubkey: JsonWebKey,
  domain: string,
): Promise<ZkJwtProofResult> {
  if (!idToken || !jwtPubkey) {
    throw new Error(
      "[JWT Circuit] Proof generation failed: idToken and jwtPubkey are required"
    );
  }

  const jwtInputs = await generateInputs({
    jwt: idToken,
    pubkey: jwtPubkey,
    shaPrecomputeTillKeys: ["email", "email_verified"],
    maxSignedDataLength: 640,
  });

  const domainUint8Array = new Uint8Array(MAX_DOMAIN_LENGTH);
  domainUint8Array.set(Uint8Array.from(new TextEncoder().encode(domain)));

  const inputs = {
    partial_data: jwtInputs.partial_data,
    partial_hash: jwtInputs.partial_hash,
    full_data_length: jwtInputs.full_data_length,
    base64_decode_offset: jwtInputs.base64_decode_offset,
    jwt_pubkey_modulus_limbs: jwtInputs.pubkey_modulus_limbs,
    jwt_pubkey_redc_params_limbs: jwtInputs.redc_params_limbs,
    jwt_signature_limbs: jwtInputs.signature_limbs,
    domain: {
      storage: Array.from(domainUint8Array),
      len: domain.length,
    }
  };

  console.log("Openbands circuit inputs", inputs);

  const { Noir, UltraHonkBackend } = await initProver();

  const circuitArtifact = await import(`./artifacts/openbands_miniapp.json`);
  
  const backend = new UltraHonkBackend(circuitArtifact.bytecode, { threads: 8 });
  const noir = new Noir(circuitArtifact as CompiledCircuit);

  // Generate witness and prove
  const startTime = performance.now();
  const { witness } = await noir.execute(inputs as InputMap);
  const generatedProof = await backend.generateProof(witness, { keccak: true }); // @dev - This is used when storing the proof/publicInputs into the EVM Blockchain via the Solidity Smart Contract.
  //const proof = await backend.generateProof(witness);                 // @dev - This is used when storing the proof/publicInputs into the Web2 Database via Supabase.
  console.log(`generatedProof: ${JSON.stringify(generatedProof, null, 2)}`);

  const provingTime = performance.now() - startTime;

  console.log(`Proof generated in ${provingTime}ms`);

  // @dev - Proof and PublicInputs
  const proof = generatedProof.proof;
  const publicInputs = generatedProof.publicInputs;
  console.log(`proof: ${ JSON.stringify(generatedProof.proof, null, 2) }`);
  console.log(`publicInputs: ${ JSON.stringify(generatedProof.publicInputs, null, 2) }`);

  //console.log(`type of proof: ${ typeof proof }`);               // @dev - [Return]: "object" 
  //console.log(`type of publicInputs: ${ typeof publicInputs }`); // @dev - [Return]: "object" 

  // @dev - [TEST]: Proof verification with NoirJS
  //const isValidProof = await backend.verifyProof(generatedProof, { keccak: true });
  //console.log(`isValidProof (via NoirJS): ${ isValidProof }`); // @dev - [Result]: True

  // @dev - Return
  return { proof, publicInputs };
}