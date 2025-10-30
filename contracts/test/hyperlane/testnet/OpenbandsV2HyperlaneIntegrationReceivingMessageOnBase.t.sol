// SPDX-License-Identifier: MIT
//pragma solidity >=0.8.19;
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {CeloSender} from "../../../src/hyperlane/CeloSender.sol";
import {BaseReceiver} from "../../../src/hyperlane/BaseReceiver.sol";
import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import {IInterchainSecurityModule} from "@hyperlane-xyz/core/contracts/interfaces/IInterchainSecurityModule.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";

// @dev - Openbands V2 contracts
import { OpenbandsV2NationalityRegistry } from "../../../src/OpenbandsV2NationalityRegistry.sol"; // @dev - on Celo
import { OpenbandsV2BadgeManager } from "../../../src/OpenbandsV2BadgeManager.sol";               // @dev - on BASE

/**
 * @title OpenbandsV2 Hyperlane integration test, which is messaging from Celo Sepolia to Base Sepolia
 * @notice Tests for Celo -> Base cross-chain messaging
 */
contract OpenbandsV2HyperlaneIntegrationReceivingMessageOnBaseTest is Test {
    using TypeCasts for address;

    OpenbandsV2NationalityRegistry public openbandsV2NationalityRegistry;
    OpenbandsV2BadgeManager public openbandsV2BadgeManager;
    CeloSender public celoSender;
    BaseReceiver public baseReceiver;

    address public celoMailbox; // @dev - on Celo Sepolia
    address public baseMailbox; // @dev - on Base Sepolia
    //address public mockCeloMailbox;
    //address public mockBaseMailbox;

    address public owner = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    uint32 constant CELO_SEPOLIA_DOMAIN = 11142220;
    uint32 constant BASE_SEPOLIA_DOMAIN = 84532;

    event MessageDispatched(
        bytes32 indexed messageId,
        address indexed recipient,
        bytes message
    );

    event MessageReceived(
        bytes32 indexed messageId,
        uint32 indexed origin,
        bytes32 indexed sender,
        bytes message
    );

    function setUp() public {
        // Deploy mock mailboxes
        //mockCeloMailbox = address(new MockMailbox(CELO_SEPOLIA_DOMAIN));
        //mockBaseMailbox = address(new MockMailbox(BASE_SEPOLIA_DOMAIN));

        // @dev - Store the deployed contract addresses of each Mailbox on Celo Sepolia and Base Sepolia
        celoMailbox = vm.envAddress("CELO_SEPOLIA_MAILBOX_ADDRESS");
        baseMailbox = vm.envAddress("BASE_SEPOLIA_MAILBOX_ADDRESS");

        // Deploy contracts
        //celoSender = new CeloSender(mockCeloMailbox);
        //baseReceiver = new BaseReceiver(mockBaseMailbox);

        // @dev - Store the deployed contract addresses on Celo Sepolia and Base Sepolia
        address CELO_SENDER_ADDRESS = vm.envAddress("CELO_SENDER_ADDRESS");
        address BASE_RECEIVER_ADDRESS = vm.envAddress("BASE_RECEIVER_ADDRESS");
        celoSender = CeloSender(payable(CELO_SENDER_ADDRESS));
        baseReceiver = BaseReceiver(payable(BASE_RECEIVER_ADDRESS));

        // @dev - Create the Openbands V2 contracts instances on testnet
        address IDENTITY_VERIFICATION_HUB_ADDRESS = 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74; // @dev - The deployed address of the IdentityVerificationHub contract on Celo Sepolia
        address OPENBANDS_V2_NATIONALITY_REGISTRY_ADDRESS_ON_CELO_SEPOLIA = vm.envAddress("OPENBANDS_V2_NATIONALITY_REGISTRY_ADDRESS_ON_CELO_SEPOLIA");
        address OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA = vm.envAddress("OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA");
        openbandsV2NationalityRegistry = OpenbandsV2NationalityRegistry(OPENBANDS_V2_NATIONALITY_REGISTRY_ADDRESS_ON_CELO_SEPOLIA);
        openbandsV2BadgeManager = OpenbandsV2BadgeManager(OPENBANDS_V2_BADGE_MANAGER_ADDRESS_ON_BASE_SEPOLIA);

        //vm.label(mockCeloMailbox, "CeloMailbox");
        //vm.label(mockBaseMailbox, "BaseMailbox");
        vm.label(address(celoSender), "CeloSender");
        vm.label(address(baseReceiver), "BaseReceiver");
    }


    // ============ CeloSender Tests ============

    // function test_CeloSender_SendStringToBase() public {
    //     string memory message = "Hello Base!";

    //     bytes32 messageId = celoSender.sendStringToBase(address(baseReceiver), message);

    //     assertEq(messageId, bytes32(uint256(1)));
    // }


    // ============ BaseReceiver Tests ============

    function test_BaseReceiver_HandleMessage() public {
        bytes memory message = "Hello from Celo!";
        bytes32 sender = address(celoSender).addressToBytes32();

        // Simulate mailbox calling handle
        vm.prank(baseMailbox);
        //vm.prank(mockBaseMailbox);
        baseReceiver.handle(CELO_SEPOLIA_DOMAIN, sender, message);

        assertEq(baseReceiver.messageCount(), 1);
    }

    function test_BaseReceiver_GetMessage() public {
        bytes memory message = "Test message";
        bytes32 sender = address(celoSender).addressToBytes32();

        vm.prank(baseMailbox);
        //vm.prank(mockBaseMailbox);
        baseReceiver.handle(CELO_SEPOLIA_DOMAIN, sender, message);

        bytes32 messageId = keccak256(abi.encodePacked(CELO_SEPOLIA_DOMAIN, sender, uint256(0), message));

        BaseReceiver.ReceivedMessage memory received = baseReceiver.getMessage(messageId);
        assertEq(received.origin, CELO_SEPOLIA_DOMAIN);
        assertEq(received.sender, sender);
        assertEq(received.message, message);
        assertTrue(received.exists);
    }

    function test_BaseReceiver_GetMessageAsString() public {
        string memory originalMessage = "Hello Base!";
        bytes memory message = bytes(originalMessage);
        bytes32 sender = address(celoSender).addressToBytes32();

        vm.prank(baseMailbox);
        //vm.prank(mockBaseMailbox);
        baseReceiver.handle(CELO_SEPOLIA_DOMAIN, sender, message);

        bytes32 messageId = keccak256(abi.encodePacked(CELO_SEPOLIA_DOMAIN, sender, uint256(0), message));

        string memory decoded = baseReceiver.getMessageAsString(messageId);
        assertEq(decoded, originalMessage);
    }

    function test_BaseReceiver_GetSenderAddress() public {
        bytes memory message = "test";

        vm.prank(baseMailbox);
        //vm.prank(mockBaseMailbox);
        baseReceiver.handle(CELO_SEPOLIA_DOMAIN, alice.addressToBytes32(), message);

        bytes32 messageId = keccak256(abi.encodePacked(CELO_SEPOLIA_DOMAIN, alice.addressToBytes32(), uint256(0), message));

        address senderAddr = baseReceiver.getSenderAddress(messageId);
        assertEq(senderAddr, alice);
    }

    // ============ Integration Tests ============

    // function test_Integration_CeloToBaseFlow() public {
    //     bytes memory message = "Cross-chain message from Celo to Base";

    //     // Step 1: Send from Celo
    //     bytes32 messageId = celoSender.sendToBase(address(baseReceiver), message);
    //     assertEq(messageId, bytes32(uint256(1)));

    //     // Step 2: Simulate Hyperlane delivery to Base
    //     bytes32 sender = address(celoSender).addressToBytes32();
    //     vm.prank(mockBaseMailbox);
    //     baseReceiver.handle(CELO_SEPOLIA_DOMAIN, sender, message);

    //     // Step 3: Verify message received
    //     assertEq(baseReceiver.messageCount(), 1);

    //     bytes32 receivedMsgId = keccak256(
    //         abi.encodePacked(CELO_SEPOLIA_DOMAIN, sender, uint256(0), message)
    //     );

    //     BaseReceiver.ReceivedMessage memory received = baseReceiver.getMessage(receivedMsgId);
    //     assertEq(received.message, message);
    //     assertTrue(received.exists);
    // }

}

// ============ Mock Contracts ============

// contract MockMailbox is IMailbox {
//     uint32 public immutable _localDomain;
//     uint32 private _messageCount;
//     mapping(bytes32 => bool) private _delivered;

//     constructor(uint32 domain) {
//         _localDomain = domain;
//     }

//     function localDomain() external view returns (uint32) {
//         return _localDomain;
//     }

//     function dispatch(
//         uint32,
//         bytes32,
//         bytes calldata
//     ) external returns (bytes32) {
//         _messageCount++;
//         return bytes32(uint256(_messageCount));
//     }

//     function delivered(bytes32 messageId) external view returns (bool) {
//         return _delivered[messageId];
//     }

//     function defaultIsm() external pure returns (IInterchainSecurityModule) {
//         return IInterchainSecurityModule(address(0));
//     }

//     function process(bytes calldata, bytes calldata) external pure {
//         revert("Not implemented");
//     }

//     function count() external view returns (uint32) {
//         return _messageCount;
//     }

//     function root() external pure returns (bytes32) {
//         return bytes32(0);
//     }

//     function latestCheckpoint() external pure returns (bytes32, uint32) {
//         return (bytes32(0), 0);
//     }

//     function recipientIsm(address) external pure returns (IInterchainSecurityModule) {
//         return IInterchainSecurityModule(address(0));
//     }
// }
