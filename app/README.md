This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Environment Setup (for the Local Development)

Copy the environment variables file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `NEXT_PUBLIC_ZK_JWT_PROOF_VERIFIER_ON_BASE_TESTNET`: Address of deployed ZkJwtProofVerifier contract
- `NEXT_PUBLIC_ZK_JWT_PROOF_MANAGER_ON_BASE_TESTNET`: Address of deployed ZkJwtProofManager contract
- `NEXT_PUBLIC_HONK_VERIFIER_ON_BASE_TESTNET`: Address of deployed HonkVerifier contract

<br>

**NOTE:**
- For the production/staging environment, the environment variables above should be added to the environment variables file on a frontend hosting server (i.e. Vercel).

<br>

### 2. Start Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<br>

## Deployed-Smart Contract addresses on Base Mainnet

| Contract Name | Descripttion | Deployed-contract addresses on `Base` (Mainnet) | Contract Source Code Verified |
| ------------- |:------------:|:--------------------------------------------------:|:-----------------------------:|
| HonkVerifier | | [0x8Cda51EBA880183C5F4174b553b1C7ea175c7a90](https://basescan.org/address/0x8Cda51EBA880183C5F4174b553b1C7ea175c7a90) | [Contract Source Code Verified](https://basescan.org/address/0x8Cda51EBA880183C5F4174b553b1C7ea175c7a90#code) |
| ZkJwtProofVerifier | | [0x0bC7F66F9b76eA37Ae37e3965E866bDeD8b2824C](https://basescan.org/address/0x0bC7F66F9b76eA37Ae37e3965E866bDeD8b2824C) | [Contract Source Code Verified](https://basescan.org/address/0x0bC7F66F9b76eA37Ae37e3965E866bDeD8b2824C#code) |
| ZkJwtProofManager | | [0x9218D30c18e2342BA5A1661E95a8B2BFeD6911e2](https://basescan.org/address/0x9218D30c18e2342BA5A1661E95a8B2BFeD6911e2) | [Contract Source Code Verified](https://basescan.org/address/0x9218D30c18e2342BA5A1661E95a8B2BFeD6911e2#code) |

<br>

## ZK circuit and Smart Contract repository

The ZK circuit and Smart Contract repository of this project has been implemented in the different repository. You can see it from [here](https://github.com/masaun/Openbands-Miniapp_ZK-circuit_and_contracts).