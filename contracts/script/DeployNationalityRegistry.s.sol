// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/OpenbandsV2NationalityRegistry.sol";

/**
 * @title DeployNationalityRegistry
 * @notice Deployment script for OpenbandsV2NationalityRegistry contract
 * @dev Run with: forge script script/DeployNationalityRegistry.s.sol:DeployNationalityRegistry --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployNationalityRegistry is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        OpenbandsV2NationalityRegistry registry = new OpenbandsV2NationalityRegistry();
        
        console.log("====================================");
        console.log("OpenbandsV2NationalityRegistry deployed!");
        console.log("====================================");
        console.log("Contract address:", address(registry));
        console.log("Deployer (owner):", msg.sender);
        console.log("====================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Add this address to your .env.local:");
        console.log("   NEXT_PUBLIC_NATIONALITY_REGISTRY_CONTRACT_ADDRESS=%s", address(registry));
        console.log("");
        console.log("2. Update the frontend to use the new contract");
        console.log("3. Verify the contract on Celoscan (if not auto-verified)");
        console.log("====================================");
        
        vm.stopBroadcast();
    }
}

