# OpenBands v2

OpenBands v2 is a privacy-first social platform for verified identities. Connect your wallet, verify your credentials through zero-knowledge proofs, and participate in anonymous communities based on your verified attributes.

**Live app:** https://openbandsv2.vercel.app/

## Core Features

- **Attribute Verification**: Company email domains and nationality
- **Zero-Knowledge Privacy**: Only verified attributes are disclosed, not your identity
- **On-Chain Proof Storage**: All verifications are recorded on blockchain
- **IPFS Integration (⚠️WIP)**: Censorship-resistant content storage and retrieval
- **Permissionless Community Creation (⚠️WIP)**: Create communities based on verified user credentials
- **Community-Based Feeds (⚠️WIP)**: Join discussions based on verified credentials
- **Anonymous Posting (⚠️WIP)**: Post and comment while maintaining privacy. Currently only company domain posts are enabled.


## Verification Types

### 1. Company Email Verification
- **Network**: Base Mainnet
- **Method**: Google OAuth + ZK proof
- **Disclosure**: Email domain only (e.g., `openbands.xyz`)
- **Use Case**: Company-specific communities

### 2. Nationality Verification
- **Network**: Celo Mainnet  
- **Method**: Self.xyz passport verification
- **Disclosure**: Country of nationality only
- **Use Case**: Country-based communities

## Decentralized Infrastructure (⚠️WIP)

### IPFS Content Storage
- **Censorship Resistance**: Content stored on IPFS cannot be easily censored or removed
- **Decentralized Retrieval**: Content accessible from multiple IPFS nodes globally
- **Content Addressing**: Immutable content hashes ensure data integrity
- **Offline Resilience**: Content remains available even if main servers go down

### Permissionless Community Creation
- **Credential-Based Access**: Communities automatically verify user credentials
- **No Central Authority**: Anyone can create communities based on verified attributes
- **Smart Contract Governance**: Community rules enforced by smart contracts
- **Transparent Membership**: On-chain verification of community membership

## How It Works

1) **Connect Wallet** - Link your EVM wallet (MetaMask, WalletConnect, etc.)
2) **Choose Verification** - Select company email or nationality verification
3) **Generate ZK Proof** - Client-side proof generation reveals only the required attribute
4) **On-Chain Storage** - Verification is recorded on the appropriate blockchain
5) **Join Communities (⚠️WIP)** - Access communities based on your verified attributes
6) **Post Anonymously (⚠️WIP)** - Share thoughts while maintaining privacy

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Wagmi + RainbowKit (wallet connection)
- **ZK Proofs**: 
  - Company verification: [Noir-lang](https://noir-lang.org/), [noir-jwt](https://github.com/zkemail/noir-jwt)
  - Nationality verification: [Self.xyz](https://self.xyz/) integration
- **Smart Contracts**: Solidity, Foundry
- **Decentralized Storage**: IPFS (InterPlanetary File System)
- **Community Management**: Smart contract-based access control

## Smart Contracts

### Base Mainnet
- **ZkJwtProofManager**: `0x9218D30c18e2342BA5A1661E95a8B2BFeD6911e2`
- **ZkJwtProofVerifier**: `0x0bC7F66F9b76eA37Ae37e3965E866bDeD8b2824C`
- **HonkVerifier**: `0x390f1ed090D20bB635d832bbb1306bd74FEAb911`

### Celo Mainnet
- **OpenbandsV2NationalityRegistry**: `0x5aCA8d5C9F44D69Fa48cCeCb6b566475c2A5961a`
- **Self.xyz Identity Verification Hub**: `0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF`

## Privacy & Security

- **Zero-Knowledge Proofs**: Your personal data never leaves your device
- **Attribute-Only Disclosure**: Only verified attributes are revealed, not your identity
- **On-Chain Verification**: Immutable proof of verification without exposing personal data
- **Self-Sovereign Identity**: You control your verification data

## Trust Assumptions

- **Company Email**: Google OAuth timing could potentially be used for de-anonymization

## Getting Started

1. Visit the [live app](https://openbandsv2.vercel.app/)
2. Connect your wallet
3. Switch to the appropriate network (Base Mainnet for company, Celo Mainnet for nationality)
4. Follow the verification flow
5. Start participating in communities!
