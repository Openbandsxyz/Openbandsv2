echo "Deploy the DeployNationalityRegistry contract on Celo Sepolia..."
# forge script script/DeployNationalityRegistry.s.sol:DeployNationalityRegistry \
#   --rpc-url $CELO_SEPOLIA_RPC_URL \
#   --broadcast \
#   --verify

forge script script/DeployNationalityRegistry.s.sol:DeployNationalityRegistry \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --broadcast \
  --verify