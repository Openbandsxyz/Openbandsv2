#!/bin/bash

# OpenbandsV2 Nationality Registry - Quick Setup Script
# This script installs dependencies for Foundry smart contract development

set -e

echo "======================================"
echo "🚀 OpenbandsV2 Nationality Registry"
echo "   Setup Script"
echo "======================================"
echo ""

# Check if foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry is not installed!"
    echo "📥 Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    foundryup
    echo "✅ Foundry installed successfully!"
else
    echo "✅ Foundry is already installed"
fi

echo ""
echo "======================================"
echo "📦 Installing Foundry Dependencies"
echo "======================================"
echo ""

# Install forge-std
if [ ! -d "lib/forge-std" ]; then
    echo "📥 Installing forge-std..."
    forge install foundry-rs/forge-std --no-commit
    echo "✅ forge-std installed"
else
    echo "✅ forge-std already installed"
fi

# Install OpenZeppelin contracts
if [ ! -d "lib/openzeppelin-contracts" ]; then
    echo "📥 Installing OpenZeppelin contracts..."
    forge install OpenZeppelin/openzeppelin-contracts --no-commit
    echo "✅ OpenZeppelin contracts installed"
else
    echo "✅ OpenZeppelin contracts already installed"
fi

echo ""
echo "======================================"
echo "🔧 Environment Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Deployer private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Celo RPC URLs
CELO_TESTNET_RPC_URL=https://alfajores-forno.celo-testnet.org
CELO_MAINNET_RPC_URL=https://forno.celo.org

# Celoscan API key (for contract verification)
CELOSCAN_API_KEY=your_celoscan_api_key
ETHERSCAN_API_KEY=your_celoscan_api_key
EOF
    echo "✅ .env file created"
    echo "⚠️  Please edit .env and add your private key and API keys"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "======================================"
echo "🏗️  Compiling Contracts"
echo "======================================"
echo ""

forge build

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your private key"
echo "2. Get testnet CELO from: https://faucet.celo.org/alfajores"
echo "3. Get Celoscan API key from: https://celoscan.io/"
echo "4. Deploy with: ./deploy.sh"
echo ""
echo "📚 Read DEPLOYMENT_GUIDE.md for detailed instructions"
echo "======================================"

