echo "Deploy the DeployBadgeManager contract on Base Sepolia..."
# forge script script/DeployBadgeManager.s.sol:DeployBadgeManager \
#   --rpc-url $BASE_SEPOLIA_RPC_URL \
#   --broadcast \
#   --verify

forge script script/deployments/base/base-sepolia/DeployBadgeManager.s.sol:DeployBadgeManager \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify