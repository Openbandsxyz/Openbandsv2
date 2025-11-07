// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Script } from "forge-std/Script.sol";
import "forge-std/console.sol";
//import {console2} from "forge-std/console2.sol";
import {ICeloSender} from "../../../../src/hyperlane/interfaces/ICeloSender.sol";
import {IBaseReceiver} from "../../../../src/hyperlane/interfaces/IBaseReceiver.sol";
import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";

// @dev - Openbands V2 contracts
import { OpenbandsV2NationalityRegistry } from "../../../../src/OpenbandsV2NationalityRegistry.sol"; // @dev - on Celo
import { OpenbandsV2BadgeManager } from "../../../../src/OpenbandsV2BadgeManager.sol";               // @dev - on BASE


/**
 * @title - The script for the Openbands V2 Hyperlane integration contract
 * @dev - Sending a message from Celo Mainnet (to Base Mainnet)
 */
contract OpenbandsV2HyperlaneIntegrationSendingMessageFromCeloScript is Script {
    using TypeCasts for bytes32;
    using TypeCasts for address;

    OpenbandsV2NationalityRegistry public openbandsV2NationalityRegistry;
    //OpenbandsV2BadgeManager public openbandsV2BadgeManager;
    ICeloSender public celoSender;
    IBaseReceiver public baseReceiver;
    address public celoMailbox; // @dev - on Celo Mainnet
    address public baseMailbox; // @dev - on Base Mainnet

    uint256 callerPrivateKey;

    address OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET;
    address IDENTITY_VERIFICATION_HUB_ON_CELO_MAINNET;
    address CELO_SENDER_ON_CELO_MAINNET;
    address BASE_RECEIVER_ON_BASE_MAINNET;

    uint32 constant CELO_MAINNET_DOMAIN = 42220;
    uint32 constant BASE_MAINNET_DOMAIN = 8453;

    function setUp() public {
        /// @dev - Set a private key of the caller wallet
        callerPrivateKey = vm.envUint("PRIVATE_KEY_EXAMPLE_USER_1_ON_CELO_MAINNET");
        vm.startBroadcast(callerPrivateKey);

        // @dev - Store the deployed contract addresses of each Mailbox on Celo Mainnet and Base Mainnet
        celoMailbox = vm.envAddress("CELO_MAINNET_MAILBOX_ADDRESS");
        baseMailbox = vm.envAddress("BASE_MAINNET_MAILBOX_ADDRESS");

        // @dev - Store the deployed contract addresses on Celo Mainnet and Base Mainnet
        CELO_SENDER_ON_CELO_MAINNET = vm.envAddress("CELO_SENDER_ON_CELO_MAINNET");
        BASE_RECEIVER_ON_BASE_MAINNET = vm.envAddress("BASE_RECEIVER_ON_BASE_MAINNET");
        celoSender = ICeloSender(payable(CELO_SENDER_ON_CELO_MAINNET));
        baseReceiver = IBaseReceiver(payable(BASE_RECEIVER_ON_BASE_MAINNET));

        // @dev - Create the Openbands V2 contracts instances on testnet
        IDENTITY_VERIFICATION_HUB_ON_CELO_MAINNET = 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF;  // @dev - The deployed address of the IdentityVerificationHub contract on Celo Mainnet
        OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET = vm.envAddress("OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET");
        //address OPENBANDS_V2_BADGE_MANAGER_ON_BASE_SEPOLIA = vm.envAddress("OPENBANDS_V2_BADGE_MANAGER_ON_BASE_SEPOLIA");
        openbandsV2NationalityRegistry = OpenbandsV2NationalityRegistry(payable(OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET));
        //openbandsV2BadgeManager = OpenbandsV2BadgeManager(OPENBANDS_V2_BADGE_MANAGER_ON_BASE_SEPOLIA);
    }

    /**
     * @notice - Send a message from Celo Sepolia (to Base Sepolia) via Hyperlane
     * @dev - This is just testing the existing "CeloSender" contract
     */
    // function run() public returns (bytes32 _messageId) {
    //     bytes memory message = "Cross-chain message from Celo to Base";

    //     // @dev - Get quote for the message cost from Celo Sepolia (to Base Sepolia, which domain ID is 84532)
    //     uint256 quotedFee = IMailbox(celoMailbox).quoteDispatch(
    //         BASE_SEPOLIA_DOMAIN, // @dev - Base Sepolia domain
    //         address(baseReceiver).addressToBytes32(),
    //         message
    //     );
    //     console.log("Quoted fee (in $CELO on Celo Sepolia):", quotedFee);

    //     // @dev - Add some buffer to the quoted fee (10% extra)
    //     uint256 totalFee = quotedFee + (quotedFee / 10);
    //     console.log("Total fee with buffer (in $CELO on Celo Sepolia):", totalFee);

    //     // @dev - Send from Celo with a totalFee
    //     bytes32 messageId = celoSender.sendToBase{value: totalFee}(address(baseReceiver), message);

    //     console.logBytes32(messageId);

    //     return messageId;
    // }


    /**
     * @notice - Send a message from Celo Mainnet (to Base Mainnet) via Hyperlane
     * @dev - This is just testing the existing "CeloSender" contract
     */
    function run() public returns (bytes32 _messageId) {
        bytes memory message = "Cross-chain message from Celo to Base";

        // @dev - Get quote for the message cost from Celo Mainnet (to Base Mainnet, which domain ID is 8453)
        uint256 quotedFee = IMailbox(celoMailbox).quoteDispatch(
            BASE_MAINNET_DOMAIN, // @dev - Base Mainnet domain
            address(baseReceiver).addressToBytes32(),
            message
        );
        console.log("Quoted fee (in $CELO on Celo Mainnet):", quotedFee);

        // @dev - Add some buffer to the quoted fee (20% extra to ensure sufficient value)
        uint256 totalFee = quotedFee + (quotedFee / 5);
        console.log("Total fee with buffer (in $CELO on Celo Mainnet):", totalFee);

        // @dev - Store the test values
        bytes calldata proofPayload;
        bytes calldata userContextData;

        // @dev - [TODO]: Send from Celo with a totalFee
        //bytes32 messageId = openbandsV2NationalityRegistry.verifySelfProof{value: totalFee}(proofPayload, userContextData);
        bytes32 messageId; // @dev - [TODO]: To be replaced with the line above.

        console.logBytes32(messageId);

        return messageId;
    }
}