// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { OpenbandsV2BadgeManager } from "../../../../src/OpenbandsV2BadgeManager.sol";
import { ICeloSender } from "../../../../src/hyperlane/interfaces/ICeloSender.sol";
import { IBaseReceiver } from "../../../../src/hyperlane/interfaces/IBaseReceiver.sol";

/**
 * @title DeployBadgeManager
 * @notice Deployment script for OpenbandsV2BadgeManager contract
 * @dev Run with: forge script script/DeployBadgeManager.s.sol:DeployBadgeManager --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployBadgeManager is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        // @dev - Store the deployed contract addresses on Celo Sepolia and Base Sepolia
        ICeloSender celoSender;
        IBaseReceiver baseReceiver;
        address CELO_SENDER_ON_CELO_SEPOLIA = vm.envAddress("CELO_SENDER_ON_CELO_SEPOLIA");
        address BASE_RECEIVER_ON_BASE_SEPOLIA = vm.envAddress("BASE_RECEIVER_ON_BASE_SEPOLIA");
        celoSender = ICeloSender(payable(CELO_SENDER_ON_CELO_SEPOLIA));
        baseReceiver = IBaseReceiver(payable(BASE_RECEIVER_ON_BASE_SEPOLIA));
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the  OpenBands v2 Badge Management contract
        OpenbandsV2BadgeManager badgeManager = new OpenbandsV2BadgeManager(
            celoSender,
            baseReceiver
        );
        
        console.log("====================================");
        console.log("OpenbandsV2BadgeManager deployed!");
        console.log("====================================");
        console.log("Contract address:", address(badgeManager));
        console.log("Deployer (owner):", msg.sender);
        console.log("====================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Add this address to your .env.local:");
        console.log("   NEXT_PUBLIC_BADGE_MANAGER_CONTRACT_ADDRESS=%s", address(badgeManager));
        console.log("");
        console.log("2. Update the frontend to use the new contract");
        console.log("3. Verify the contract on Celoscan (if not auto-verified)");
        console.log("====================================");
        
        vm.stopBroadcast();
    }
}