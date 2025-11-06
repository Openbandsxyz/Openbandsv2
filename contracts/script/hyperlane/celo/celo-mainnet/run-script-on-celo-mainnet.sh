echo "Load the environment variables from the .env file..."
#source .env
. ./.env

echo "Run the script of the OpenbandsV2HyperlaneIntegrationSendingMessageFromCelo.s.sol on Celo mainnet..."
forge script script/hyperlane/celo/celo-mainnet/OpenbandsV2HyperlaneIntegrationSendingMessageFromCelo.s.sol --broadcast --private-key ${PRIVATE_KEY_EXAMPLE_USER_1_ON_CELO_MAINNET} --rpc-url ${CELO_MAINNET_RPC_URL} --skip-simulation
