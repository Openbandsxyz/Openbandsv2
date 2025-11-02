echo "Load the environment variables from the .env file..."
#source .env
. ./.env

echo "Run the script of the OpenbandsV2HyperlaneIntegrationReceivingMessageOnBase.s.sol on Base Sepolia testnet..."
forge script script/hyperlane/testnet/OpenbandsV2HyperlaneIntegrationReceivingMessageOnBase.s.sol --broadcast --private-key ${PRIVATE_KEY_ON_CELO_SEPOLIA} --rpc-url ${CELO_SEPOLIA_RPC_URL} --skip-simulation
