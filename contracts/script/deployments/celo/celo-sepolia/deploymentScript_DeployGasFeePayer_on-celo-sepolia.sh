echo "Deploy the OpenbandsV2GasFeePayer contract on Celo Sepolia..."
# forge script script/DeployGasFeePayer.s.sol:DeployGasFeePayer \
#   --rpc-url $CELO_SEPOLIA_RPC_URL \
#   --broadcast \
#   --verify

forge script script/deployments/celo/celo-sepolia/DeployGasFeePayer.s.sol:DeployGasFeePayer \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --broadcast \
  --verify