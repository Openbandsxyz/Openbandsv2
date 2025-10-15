import type { JWK } from "@/lib/types";

export interface JwtHeader {
  alg: string;
  kid: string;
  typ?: string;
}

export function getJwtHeader(idToken: string): JwtHeader {
  const [headerB64] = idToken.split('.');
  const jwtHeader = JSON.parse(atob(headerB64));
  return jwtHeader;
}

export function extractDomain(email: string): string {
  const domain = email.split('@')[1];
  return domain;
}

export async function getGooglePublicKey(kid: string): Promise<JsonWebKey> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  const jwks = await response.json();
  
  const key = jwks.keys.find((k: JWK) => k.kid === kid);
  if (!key) {
    throw new Error('Unable to find matching public key');
  }
  
  return key;
}