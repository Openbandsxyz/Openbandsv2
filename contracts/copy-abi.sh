#!/bin/bash

# Script to copy compiled ABI to frontend artifacts directory

set -e

echo "======================================"
echo "📋 Copying ABI to Frontend"
echo "======================================"
echo ""

# Create frontend artifacts directory
mkdir -p ../app/src/lib/blockchains/evm/smart-contracts/artifacts/nationality-registry

# Copy the compiled JSON
if [ -f "out/OpenbandsV2NationalityRegistry.sol/OpenbandsV2NationalityRegistry.json" ]; then
    cp out/OpenbandsV2NationalityRegistry.sol/OpenbandsV2NationalityRegistry.json \
       ../app/src/lib/blockchains/evm/smart-contracts/artifacts/nationality-registry/
    echo "✅ ABI copied successfully!"
    echo ""
    echo "📁 Location:"
    echo "   app/src/lib/blockchains/evm/smart-contracts/artifacts/nationality-registry/"
    echo "   OpenbandsV2NationalityRegistry.json"
else
    echo "❌ Compiled contract not found!"
    echo "Please run 'forge build' first"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ Done!"
echo "======================================"

