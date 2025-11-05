#!/bin/bash

# Deploy Age Registry Contract to Celo Mainnet
# This script compiles and deploys the OpenbandsV2AgeRegistry contract

set -e

echo "🚀 Deploying OpenbandsV2AgeRegistry to Celo Mainnet..."

# Source environment variables
if [ -f .env ]; then
    source .env
    echo "✅ Loaded environment variables from .env"
else
    echo "❌ .env file not found. Please create one with your PRIVATE_KEY and CELO_MAINNET_RPC_URL"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$CELO_MAINNET_RPC_URL" ]; then
    echo "❌ CELO_MAINNET_RPC_URL not set in .env file"
    exit 1
fi

echo "📦 Compiling contracts..."
forge build

echo "🚀 Deploying OpenbandsV2AgeRegistry..."
forge script script/DeployAgeRegistry.s.sol:DeployAgeRegistry \
    --rpc-url $CELO_MAINNET_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $CELOSCAN_API_KEY

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the deployed contract address from the output above"
echo "2. Add it to your .env.local file:"
echo "   NEXT_PUBLIC_AGE_REGISTRY_CONTRACT_ADDRESS=<contract_address>"
echo "3. Update Vercel environment variables with the new contract address"
echo "4. Test the age verification flow on localhost"
