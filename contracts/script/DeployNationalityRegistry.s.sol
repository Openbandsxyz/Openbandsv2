// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

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
        
        // Self.xyz Identity Verification Hub V2 on Celo Mainnet
        // Source: https://docs.self.xyz/contract-integration/deployed-contracts
        // Verified: https://celoscan.io/address/0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF
        address identityVerificationHub = 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF;
        
        // Scope seed for OpenBands v2
        // The official SelfVerificationRoot handles scope calculation with Poseidon hash
        string memory scopeSeed = "openbands-v2";
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        OpenbandsV2NationalityRegistry registry = new OpenbandsV2NationalityRegistry(
            identityVerificationHub,
            scopeSeed
        );
        
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

