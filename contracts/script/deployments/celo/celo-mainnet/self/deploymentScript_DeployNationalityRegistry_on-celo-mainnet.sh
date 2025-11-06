echo "Deploy the DeployNationalityRegistry contract on Celo mainnet..."
# forge script script/DeployNationalityRegistry.s.sol:DeployNationalityRegistry \
#   --rpc-url $CELO_MAINNET_RPC_URL \
#   --broadcast \
#   --verify

forge script script/deployments/celo/celo-mainnet/self/DeployNationalityRegistry.s.sol:DeployNationalityRegistry \
  --rpc-url https://forno.celo.org \
  --broadcast \
  --verify