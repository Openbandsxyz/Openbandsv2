// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Script, console } from "forge-std/Script.sol";
import "forge-std/console.sol";
//import {console2} from "forge-std/console2.sol";
import {ICeloSender} from "../../../../src/hyperlane/interfaces/ICeloSender.sol";
import {IBaseReceiver} from "../../../../src/hyperlane/interfaces/IBaseReceiver.sol";
import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";

// @dev - Openbands V2 contracts
import { OpenbandsV2NationalityRegistry } from "../../../../src/OpenbandsV2NationalityRegistry.sol"; // @dev - on Celo
import { OpenbandsV2BadgeManager } from "../../../../src/OpenbandsV2BadgeManager.sol";               // @dev - on BASE

// @dev - DataType
import { DataType } from "../../../../src/dataType/DataType.sol";

/**
 * @title - The script for the Openbands V2 Hyperlane integration contract
 * @dev - Receiving a message on Base Sepolia (from Celo Sepolia)
 */
contract OpenbandsV2HyperlaneIntegrationReceivingMessageOnBaseScript is Script {
    using TypeCasts for bytes32;
    using TypeCasts for address;

    OpenbandsV2BadgeManager public openbandsV2BadgeManager;
    OpenbandsV2NationalityRegistry public openbandsV2NationalityRegistry;
    //OpenbandsV2BadgeManager public openbandsV2BadgeManager;
    ICeloSender public celoSender;
    IBaseReceiver public baseReceiver;
    address public celoMailbox; // @dev - on Celo Sepolia
    address public baseMailbox; // @dev - on Base Sepolia

    uint256 callerPrivateKey;

    address OPENBANDS_V2_BADGE_MANAGER_ON_BASE_MAINNET;
    address OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET;
    address IDENTITY_VERIFICATION_HUB_ON_CELO_MAINNET;
    address CELO_SENDER_ON_CELO_MAINNET;
    address BASE_RECEIVER_ON_BASE_MAINNET;

    uint32 constant CELO_MAINNET_DOMAIN = 42220;
    uint32 constant BASE_MAINNET_DOMAIN = 8453;

    function setUp() public {
        /// @dev - Set a private key of the caller wallet
        callerPrivateKey = vm.envUint("PRIVATE_KEY_EXAMPLE_USER_1_ON_CELO_SEPOLIA");
        vm.startBroadcast(callerPrivateKey);

        // @dev - Store the deployed contract addresses of each Mailbox on Celo Sepolia and Base Sepolia
        celoMailbox = vm.envAddress("CELO_SEPOLIA_MAILBOX_ADDRESS");
        baseMailbox = vm.envAddress("BASE_SEPOLIA_MAILBOX_ADDRESS");

        // @dev - Store the deployed contract addresses on Celo Sepolia and Base Sepolia
        CELO_SENDER_ON_CELO_MAINNET = vm.envAddress("CELO_SENDER_ON_CELO_MAINNET");
        BASE_RECEIVER_ON_BASE_MAINNET = vm.envAddress("BASE_RECEIVER_ON_BASE_MAINNET");
        celoSender = ICeloSender(payable(CELO_SENDER_ON_CELO_MAINNET));
        baseReceiver = IBaseReceiver(payable(BASE_RECEIVER_ON_BASE_MAINNET));

        // @dev - Create the Openbands V2 contracts instances on testnet
        IDENTITY_VERIFICATION_HUB_ON_CELO_MAINNET = 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF;  // @dev - The deployed address of the IdentityVerificationHub contract on Celo Mainnet
        OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET = vm.envAddress("OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET");
        //address OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA = vm.envAddress("OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA");
        openbandsV2NationalityRegistry = OpenbandsV2NationalityRegistry(payable(OPENBANDS_V2_NATIONALITY_REGISTRY_ON_CELO_MAINNET));
        //openbandsV2BadgeManager = OpenbandsV2BadgeManager(OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA);
    
        // @dev - Create the Openbands V2 Badge Manager instance on Base Sepolia
        OPENBANDS_V2_BADGE_MANAGER_ON_BASE_MAINNET = vm.envAddress("OPENBANDS_V2_BADGE_MANAGER_ON_BASE_MAINNET");
        openbandsV2BadgeManager = OpenbandsV2BadgeManager(OPENBANDS_V2_BADGE_MANAGER_ON_BASE_MAINNET);
    }

    /**
     * @notice - Receive a message, which was sent from Celo Sepolia (to Base Sepolia) via Hyperlane
     * @dev - This is testing the "OpenbandsV2NationalityRegistry" contract including the BaseReceiver integration using Hyperlane.
     */
    function run() public returns (bool) {
        // @dev - [TODO]: Implement the receiving message logic on Base Sepolia via Hyperlane
        bytes memory nationalityRecordViaSelfInBytes; // [TODO]:
        openbandsV2BadgeManager.receiveNationalityRecordViaSelf(nationalityRecordViaSelfInBytes);

        // @dev - Retrieve the nationality record stored in the OpenbandsV2BadgeManager on Base Sepolia
        address userAddress; // @dev - [TODO]: Assign an actual user address
        DataType.NationalityRecordViaSelf memory nationalityRecordViaSelf = openbandsV2BadgeManager.getNationalityRecordViaSelf(userAddress);
        console.log("Nationality Record for user:", nationalityRecordViaSelf.nationality);
    }

}