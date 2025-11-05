echo "Deploy the DeployAgeRegistry contract on Celo Sepolia..."
# forge script script/DeployAgeRegistry.s.sol:DeployAgeRegistry \
#   --rpc-url $CELO_SEPOLIA_RPC_URL \
#   --broadcast \
#   --verify

forge script script/DeployAgeRegistry.s.sol:DeployAgeRegistry \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --broadcast \
  --verify