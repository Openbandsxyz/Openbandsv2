# Intro

Openbands is a privacy‑first social app for verified employees. Connect a wallet, sign in with your work email, and generate a zero‑knowledge proof that reveals only your email domain (e.g., `openbands.xyz`). Your identity never leaves your device; posts and comments are anonymous.

Live app: https://app.openbands.xyz

## Core Features

- Verified anonymity via ZK proofs (domain‑only disclosure)
- Wallet connect (EVM) and on‑chain proof recording
- Company‑first feeds (New / Hot)
- Anonymous posts and comments
- Search by company domain

## How It Works

1) Connect EVM wallet
2) Sign in with Google (work email)
3) Client generates a ZK proof – only the email domain becomes public
4) Public inputs (domain, nullifier, wallet) are recorded on‑chain
5) Post/comment anonymously; domain is displayed, identity is not

## Tech Stack

- Next.js, TypeScript, Tailwind CSS
- Wagmi + RainbowKit (wallets)
- ZK tooling: [Noir-lang](https://noir-lang.org/), [noir-jwt](https://github.com/zkemail/noir-jwt))

## Trust Assumption

Google may be able to probabilistically de-anonymize users:

- If someone sends a message right after registering, Google could attempt a timing attack by matching the OAuth completion time with the message activity.

- If only a small number of users from a given domain are using the app, Google     could narrow down the sender by linking activity back to those few accounts.
