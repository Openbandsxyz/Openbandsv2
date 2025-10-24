#!/bin/bash

# OpenbandsV2 Nationality Registry - Deployment Script
# This script deploys the nationality registry to Celo testnet

set -e

echo "======================================"
echo "🚀 Deploying Nationality Registry"
echo "   to Celo Alfajores Testnet"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please run ./setup.sh first"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Set default RPC URL if not set
if [ -z "$CELO_SEPOLIA_RPC_URL" ]; then
    CELO_SEPOLIA_RPC_URL="https://forno.celo-sepolia.celo-testnet.org"
    echo "Using default Celo Sepolia testnet RPC: $CELO_SEPOLIA_RPC_URL"
fi

# Check if private key is set
if [ "$PRIVATE_KEY" = "your_private_key_here" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file!"
    echo "Please edit .env and add your private key"
    exit 1
fi

echo "🔍 Checking wallet balance..."
WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Deployer address: $WALLET_ADDRESS"

BALANCE=$(cast balance $WALLET_ADDRESS --rpc-url $CELO_SEPOLIA_RPC_URL)
echo "Balance: $BALANCE wei"

if [ "$BALANCE" = "0" ]; then
    echo ""
    echo "⚠️  WARNING: Your wallet has 0 balance!"
    echo "Get testnet CELO from: https://faucet.celo.org/celo-sepolia"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "======================================"
echo "📝 Compiling Contracts"
echo "======================================"
echo ""

forge build

echo ""
echo "======================================"
echo "🚀 Deploying to Celo Sepolia Testnet"
echo "======================================"
echo ""

forge script script/DeployNationalityRegistry.s.sol:DeployNationalityRegistry \
  --rpc-url $CELO_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv

echo ""
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "📋 Next steps:"
echo "1. Copy the contract address from above"
echo "2. Add to app/.env.local:"
echo "   NEXT_PUBLIC_NATIONALITY_REGISTRY_CONTRACT_ADDRESS=0x..."
echo "3. Copy ABI to frontend:"
echo "   ./copy-abi.sh"
echo "4. Test the complete flow!"
echo "======================================"

