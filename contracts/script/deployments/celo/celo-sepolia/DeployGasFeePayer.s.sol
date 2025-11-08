// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import { OpenbandsV2GasFeePayer } from "../../../../src/OpenbandsV2GasFeePayer.sol";

/**
 * @title DeployGasFeePayer
 * @notice Deployment script for OpenbandsV2GasFeePayer contract
 * @dev Run with: forge script script/DeployGasFeePayer.s.sol:DeployGasFeePayer --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployGasFeePayer is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        OpenbandsV2GasFeePayer gasFeePayer = new OpenbandsV2GasFeePayer();
        
        console.log("====================================");
        console.log("OpenbandsV2GasFeePayer deployed on Celo Sepolia!");
        console.log("====================================");
        console.log("Contract address:", address(gasFeePayer));
        console.log("Deployer (owner):", msg.sender);
        console.log("====================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Add this address to your .env.local:");
        console.log("OPENBANDS_V2_GAS_FEE_PAYER_ON_CELO_SEPOLIA=%s", address(gasFeePayer));
        console.log("");
        console.log("2. Update the frontend to use the new contract");
        console.log("3. Verify the contract on Celoscan (if not auto-verified)");
        console.log("====================================");
        
        vm.stopBroadcast();
    }
}
