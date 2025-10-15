import { ethers } from "ethers";

export function hashEmail(email: string): string {
  const emailHash = ethers.hashMessage(email);
  return emailHash;
}