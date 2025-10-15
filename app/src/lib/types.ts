export type CompanyDomain = string; // e.g., "acme.com"

// Simplified for privacy - no email/PII stored
export interface Post {
  id: string;
  authorId: string;
  authorEmail: string; // Keep for compatibility but will be empty
  authorAnonymousId: string; // Anonymous display name
  companyDomain: CompanyDomain;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: number; // epoch ms
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorEmail: string; // Keep for compatibility but will be empty
  authorAnonymousId: string; // Anonymous display name
  companyDomain: CompanyDomain; // domain of the commenter
  content: string;
  likeCount: number;
  createdAt: number; // epoch ms
}

export interface GoogleJwtPayload {
  email: string;
  kid: string;
}

export interface JWK {
  kty: string;
  alg: string;
  kid: string;
  n: string;
  e: string;
  use: string;
}

export interface UserInfo {
  email: string;
  idToken: string;
}

export type PublicInputs = {
  domain: string; // e.g., "acme.com"
  nullifierHash: string; // hex string
  emailHash: string; // hex string (sha256 of email)
  walletAddress: string; // hex string
  createdAt: string; // epoch ms
  //publicInputsFromOnChain: [string, string, string]; // tuple (if always 3 elements)
};