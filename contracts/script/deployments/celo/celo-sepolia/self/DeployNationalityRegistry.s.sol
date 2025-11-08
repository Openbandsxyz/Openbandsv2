// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import "forge-std/Script.sol";
import "../../../../../src/OpenbandsV2NationalityRegistry.sol";

// @dev - Hyperlane wrapper contracts
import { ICeloSender } from "../../../../../src/hyperlane/interfaces/ICeloSender.sol";
import { IBaseReceiver } from "../../../../../src/hyperlane/interfaces/IBaseReceiver.sol";
import { IMailbox } from "../../../../../src/hyperlane/interfaces/IMailbox.sol";
import { OpenbandsV2GasFeePayer } from "../../../../../src/OpenbandsV2GasFeePayer.sol";

/**
 * @title DeployNationalityRegistry
 * @notice Deployment script for OpenbandsV2NationalityRegistry contract
 * @dev Run with: forge script script/DeployNationalityRegistry.s.sol:DeployNationalityRegistry --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployNationalityRegistry is Script {
    function run() external {
        vm.createSelectFork("celo_sepolia");  // [NOTE]: foundry.toml - Celo Sepolia RPC URL
        //vm.createSelectFork("https://forno.celo-sepolia.celo-testnet.org");

        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Self.xyz Identity Verification Hub V2 on Celo Mainnet
        // Source: https://docs.self.xyz/contract-integration/deployed-contracts
        // Verified: https://celoscan.io/address/0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF
        address identityVerificationHub = 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF;              // @dev - The deployed address of the IdentityVerificationHub contract on Celo Mainnet
        address identityVerificationHubOnCeloSepolia = 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74; // @dev - The deployed address of the IdentityVerificationHub contract on Celo Sepolia

        // Scope seed for OpenBands v2
        // The official SelfVerificationRoot handles scope calculation with Poseidon hash
        string memory scopeSeed = "openbands-v2";
        
        // @dev - Hyperlane wrapper contracts
        ICeloSender celoSender;
        IBaseReceiver baseReceiver;
        IMailbox celoMailbox;
        OpenbandsV2GasFeePayer openbandsV2GasFeePayer;

        // @dev - Store the deployed contract addresses of the Hyperlane wrapper contracts on Celo Sepolia and Base Sepolia
        address CELO_SENDER_ADDRESS = vm.envAddress("CELO_SENDER_ADDRESS");
        address BASE_RECEIVER_ADDRESS = vm.envAddress("BASE_RECEIVER_ADDRESS");
        celoSender = ICeloSender(payable(CELO_SENDER_ADDRESS));
        baseReceiver = IBaseReceiver(payable(BASE_RECEIVER_ADDRESS));

        // @dev - Store the deployed contract addresses of each Mailbox on Celo Sepolia and Base Sepolia
        address CELO_SEPOLIA_MAILBOX = vm.envAddress("CELO_SEPOLIA_MAILBOX_ADDRESS");
        celoMailbox = IMailbox(CELO_SEPOLIA_MAILBOX);

        // @dev - OpenbandsV2GasFeePayer contract on Celo Sepolia
        address OPENBANDS_V2_GAS_FEE_PAYER_ON_CELO_SEPOLIA = vm.envAddress("OPENBANDS_V2_GAS_FEE_PAYER_ON_CELO_SEPOLIA");
        openbandsV2GasFeePayer = OpenbandsV2GasFeePayer(payable(OPENBANDS_V2_GAS_FEE_PAYER_ON_CELO_SEPOLIA));

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        OpenbandsV2NationalityRegistry registry = new OpenbandsV2NationalityRegistry(
            //identityVerificationHub,            // @dev - IdentityVerificationHub contract on Celo Mainnet
            identityVerificationHubOnCeloSepolia, // @dev - IdentityVerificationHub contract on Celo Sepolia testnet
            scopeSeed,
            celoSender,
            baseReceiver,
            celoMailbox,
            openbandsV2GasFeePayer
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

