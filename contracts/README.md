# OpenbandsV2 Nationality Registry - Smart Contracts

This directory contains the Solidity smart contracts for storing Self.xyz nationality verification data on-chain.

## 🧠 Architecture Overview

### How Self.xyz Works

```
User's Self App → Self Relayers → Your Backend (/api/verify) → Your Frontend → Your Smart Contract
    [ZK Proof]      [Forward]        [Verify Off-Chain]        [Extract Data]    [Store On-Chain]
```

**Key Points:**
- ✅ ZK proof verification happens **OFF-CHAIN** in your backend
- ✅ Only the **RESULT** is stored on-chain (nationality, age, timestamp)
- ✅ This saves $50-200+ per transaction compared to on-chain ZK verification
- ✅ Your backend is a "trusted verifier" (same model as Google OAuth)

## 📁 Directory Structure

```
contracts/
├── src/
│   └── OpenbandsV2NationalityRegistry.sol  # Main contract
├── script/
│   └── DeployNationalityRegistry.s.sol     # Deployment script
├── foundry.toml                             # Foundry config
├── setup.sh                                 # Setup script
├── deploy.sh                                # Deployment script
├── copy-abi.sh                              # Copy ABI to frontend
├── DEPLOYMENT_GUIDE.md                      # Detailed guide
└── README.md                                # This file
```

## 🚀 Quick Start

### 1. Setup (First Time Only)

```bash
cd /Users/stratos/Openbandsv2/contracts
./setup.sh
```

This will:
- Install Foundry (if not installed)
- Install forge-std and OpenZeppelin
- Create `.env` file
- Compile contracts

### 2. Configure Environment

Edit `.env` and add:
```bash
PRIVATE_KEY=your_private_key_here  # From MetaMask
CELOSCAN_API_KEY=your_api_key      # From celoscan.io
```

### 3. Get Testnet Funds

Visit: https://faucet.celo.org/alfajores

### 4. Deploy

```bash
./deploy.sh
```

### 5. Copy ABI to Frontend

```bash
./copy-abi.sh
```

### 6. Update Frontend `.env.local`

```bash
cd ../app
nano .env.local

# Add this line with your deployed contract address:
NEXT_PUBLIC_NATIONALITY_REGISTRY_CONTRACT_ADDRESS=0xYourContractAddress
```

## 📚 Detailed Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive instructions.

## 🔧 Manual Commands

### Compile
```bash
forge build
```

### Test (coming soon)
```bash
forge test
```

### Deploy to Testnet
```bash
forge script script/DeployNationalityRegistry.s.sol:DeployNationalityRegistry \
  --rpc-url $CELO_TESTNET_RPC_URL \
  --broadcast \
  --verify
```

### Deploy to Mainnet (after testing!)
```bash
forge script script/DeployNationalityRegistry.s.sol:DeployNationalityRegistry \
  --rpc-url $CELO_MAINNET_RPC_URL \
  --broadcast \
  --verify
```

## 📝 Contract Functions

### Write Functions

- `storeNationalityVerification(string nationality, bool isAboveMinimumAge, bool isValidNationality)`
  - Stores nationality data for the caller
  - Can only be called by the user who was verified

### Read Functions

- `getNationalityRecord(address user)` - Get full record for a user
- `isUserVerified(address user)` - Check if user has active verification
- `getUserNationality(address user)` - Get nationality string
- `getAllVerifiedUsers()` - Get array of all verified addresses
- `getTotalVerifiedUsers()` - Get total count

### Admin Functions (Owner Only)

- `revokeVerification(address user)` - Revoke a user's verification
- `transferOwnership(address newOwner)` - Transfer contract ownership

## 🔍 Verification

After deployment, verify your contract on Celoscan:

```bash
forge verify-contract <CONTRACT_ADDRESS> \
  src/OpenbandsV2NationalityRegistry.sol:OpenbandsV2NationalityRegistry \
  --chain-id 44787 \
  --verifier-url https://api-alfajores.celoscan.io/api \
  --etherscan-api-key $CELOSCAN_API_KEY
```

## 🌐 Networks

### Celo Alfajores Testnet
- Chain ID: 44787
- RPC: https://alfajores-forno.celo-testnet.org
- Explorer: https://alfajores.celoscan.io/
- Faucet: https://faucet.celo.org/alfajores

### Celo Mainnet
- Chain ID: 42220
- RPC: https://forno.celo.org
- Explorer: https://celoscan.io/

## 🆘 Troubleshooting

### "Insufficient funds"
Get testnet CELO: https://faucet.celo.org/alfajores

### "Failed to get EIP-1559 fees"
Add `--legacy` flag to deploy command

### Contract not verifying
Run the manual verification command above

## 📚 Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Celo Docs](https://docs.celo.org/)
- [Self.xyz Docs](https://docs.self.xyz/)
- [Celoscan](https://celoscan.io/)

## 🔐 Security Notes

- ⚠️ **NEVER** commit `.env` file to git
- ⚠️ **NEVER** share your private key
- ✅ Test thoroughly on testnet before mainnet
- ✅ Consider a multisig wallet for production

## 📞 Support

- [Self.xyz Discord](https://discord.gg/self)
- [Celo Discord](https://discord.gg/celo)

