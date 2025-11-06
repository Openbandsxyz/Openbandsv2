echo "Load the environment variables from the .env file..."
#source .env
. ./.env

echo "Run the script of the OpenbandsV2HyperlaneIntegrationReceivingMessageOnBase.s.sol on Base Sepolia testnet..."
forge script script/hyperlane/base/base-sepolia/OpenbandsV2HyperlaneIntegrationReceivingMessageOnBase.s.sol --broadcast --private-key ${PRIVATE_KEY_EXAMPLE_USER_1_ON_BASE_SEPOLIA} --rpc-url ${BASE_SEPOLIA_RPC_URL} --skip-simulation
