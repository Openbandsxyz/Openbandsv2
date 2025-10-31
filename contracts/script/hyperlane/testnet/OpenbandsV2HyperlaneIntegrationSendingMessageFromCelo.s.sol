// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Script } from "forge-std/Script.sol";
import "forge-std/console.sol";
//import {console2} from "forge-std/console2.sol";
import {ICeloSender} from "../../../src/hyperlane/interfaces/ICeloSender.sol";
import {IBaseReceiver} from "../../../src/hyperlane/interfaces/IBaseReceiver.sol";
import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";

// @dev - Openbands V2 contracts
import { OpenbandsV2NationalityRegistry } from "../../../src/OpenbandsV2NationalityRegistry.sol"; // @dev - on Celo
import { OpenbandsV2BadgeManager } from "../../../src/OpenbandsV2BadgeManager.sol";               // @dev - on BASE


/**
 * @title - The script for the Openbands V2 Hyperlane integration contract
 * @dev - Sending a message from Celo Sepolia (to Base Sepolia)
 */
contract OpenbandsV2HyperlaneIntegrationSendingMessageFromCeloScript is Script {
    using TypeCasts for bytes32;
    using TypeCasts for address;

    OpenbandsV2NationalityRegistry public openbandsV2NationalityRegistry;
    //OpenbandsV2BadgeManager public openbandsV2BadgeManager;
    ICeloSender public celoSender;
    IBaseReceiver public baseReceiver;
    address public celoMailbox; // @dev - on Celo Sepolia
    address public baseMailbox; // @dev - on Base Sepolia

    uint256 executorPrivateKey;

    address OPENBANDS_V2_NATIONALITY_REGISTRY_ADDRESS_ON_CELO_SEPOLIA;
    address IDENTITY_VERIFICATION_HUB_ADDRESS;
    address CELO_SENDER_ADDRESS;
    address BASE_RECEIVER_ADDRESS;

    uint32 constant CELO_SEPOLIA_DOMAIN = 11142220;
    uint32 constant BASE_SEPOLIA_DOMAIN = 84532;

    function setUp() public {
        /// @dev - Set a private key of the executor wallet
        executorPrivateKey = vm.envUint("PRIVATE_KEY_ON_CELO_SEPOLIA");
        vm.startBroadcast(executorPrivateKey);

        // @dev - Store the deployed contract addresses of each Mailbox on Celo Sepolia and Base Sepolia
        celoMailbox = vm.envAddress("CELO_SEPOLIA_MAILBOX_ADDRESS");
        baseMailbox = vm.envAddress("BASE_SEPOLIA_MAILBOX_ADDRESS");

        // @dev - Store the deployed contract addresses on Celo Sepolia and Base Sepolia
        CELO_SENDER_ADDRESS = vm.envAddress("CELO_SENDER_ADDRESS");
        BASE_RECEIVER_ADDRESS = vm.envAddress("BASE_RECEIVER_ADDRESS");
        celoSender = ICeloSender(payable(CELO_SENDER_ADDRESS));
        baseReceiver = IBaseReceiver(payable(BASE_RECEIVER_ADDRESS));

        // @dev - Create the Openbands V2 contracts instances on testnet
        IDENTITY_VERIFICATION_HUB_ADDRESS = 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74; // @dev - The deployed address of the IdentityVerificationHub contract on Celo Sepolia
        OPENBANDS_V2_NATIONALITY_REGISTRY_ADDRESS_ON_CELO_SEPOLIA = vm.envAddress("OPENBANDS_V2_NATIONALITY_REGISTRY_ADDRESS_ON_CELO_SEPOLIA");
        //address OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA = vm.envAddress("OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA");
        openbandsV2NationalityRegistry = OpenbandsV2NationalityRegistry(OPENBANDS_V2_NATIONALITY_REGISTRY_ADDRESS_ON_CELO_SEPOLIA);
        //openbandsV2BadgeManager = OpenbandsV2BadgeManager(OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA);
    }

    /**
     * @notice - Send a message from Celo Sepolia (to Base Sepolia) via Hyperlane
     * @dev - This is just testing the existing Hyperlane CeloSender contract
     */
    function run() public returns (bytes32 _messageId) {
        bytes memory message = "Cross-chain message from Celo to Base";

        // @dev - Get quote for the message cost from Celo Sepolia (to Base Sepolia, which domain ID is 84532)
        uint256 quotedFee = IMailbox(celoMailbox).quoteDispatch(
            BASE_SEPOLIA_DOMAIN, // @dev - Base Sepolia domain
            address(baseReceiver).addressToBytes32(),
            message
        );
        console.log("Quoted fee (in $CELO on Celo Sepolia):", quotedFee);

        // @dev - Add some buffer to the quoted fee (10% extra)
        uint256 totalFee = quotedFee + (quotedFee / 10);
        console.log("Total fee with buffer (in $CELO on Celo Sepolia):", totalFee);

        // @dev - Send from Celo with proper value
        bytes32 messageId = celoSender.sendToBase{value: totalFee}(address(baseReceiver), message);

        console.logBytes32(messageId);

        return messageId;
    }

}