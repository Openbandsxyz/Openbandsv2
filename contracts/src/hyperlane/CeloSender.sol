// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IMailboxV3} from "./IMailboxV3.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";

/**
 * @title CeloSender
 * @notice Sends cross-chain messages from Celo to Base via Hyperlane
 * @dev Deployed on Celo Mainnet (Chain ID: 42220)
 * @dev Verified mailbox: 0x50da3B3907A08a24fe4999F4Dcf337E8dC7954bb
 */
contract CeloSender {
    using TypeCasts for address;

    // ============ Constants ============

    /// @notice Base mainnet domain ID
    uint32 public constant BASE_DOMAIN = 8453;

    /// @notice Hyperlane Mailbox on Celo Mainnet
    IMailboxV3 public immutable MAILBOX;

    // ============ Events ============

    /**
     * @notice Emitted when a message is dispatched to Base
     * @param messageId Hyperlane message ID
     * @param recipient Recipient address on Base
     * @param message Message body sent
     */
    event MessageDispatched(
        bytes32 indexed messageId,
        address indexed recipient,
        bytes message
    );

    // ============ Errors ============

    error ZeroAddressRecipient();
    error EmptyMessage();
    error ZeroAddressMailbox();

    // ============ Constructor ============

    /**
     * @notice Initialize the CeloSender contract
     * @param _mailbox Address of the Hyperlane Mailbox on Celo Mainnet
     *                 Must be: 0x50da3B3907A08a24fe4999F4Dcf337E8dC7954bb
     */
    constructor(address _mailbox) {
        if (_mailbox == address(0)) revert ZeroAddressMailbox();
        MAILBOX = IMailboxV3(_mailbox);
    }

    /**
     * @notice Receive function to accept refunds from Hyperlane hooks
     * @dev Mailbox hooks refund excess msg.value after paying fees
     */
    receive() external payable {}

    // ============ External Functions ============

    /**
     * @notice Send a message to a recipient on Base
     * @param recipient Address of the recipient on Base
     * @param message Arbitrary message bytes to send
     * @return messageId Hyperlane message identifier
     * @dev The recipient should implement IMessageRecipient.handle()
     */
    function sendToBase(
        address recipient,
        bytes calldata message
    ) public payable returns (bytes32 messageId) {
        if (recipient == address(0)) revert ZeroAddressRecipient();
        if (message.length == 0) revert EmptyMessage();

        // Convert recipient address to bytes32 for Hyperlane
        bytes32 recipientBytes32 = recipient.addressToBytes32();

        // Dispatch message via Hyperlane Mailbox (V3 payable for hook fees)
        messageId = MAILBOX.dispatch{value: msg.value}(
            BASE_DOMAIN,
            recipientBytes32,
            message
        );

        emit MessageDispatched(messageId, recipient, message);
    }

    /**
     * @notice Send a simple string message to Base
     * @param recipient Address of the recipient on Base
     * @param message String message to send
     * @return messageId Hyperlane message identifier
     */
    function sendStringToBase(
        address recipient,
        string calldata message
    ) external payable returns (bytes32 messageId) {
        return sendToBase(recipient, bytes(message));
    }

    // ============ View Functions ============

    /**
     * @notice Get the local domain (chain) ID
     * @return Local domain identifier (should be 42220 for Celo Mainnet)
     */
    function localDomain() external view returns (uint32) {
        return MAILBOX.localDomain();
    }

    /**
     * @notice Check if a message has been delivered
     * @param messageId The message ID to check
     * @return True if delivered, false otherwise
     */
    function isDelivered(bytes32 messageId) external view returns (bool) {
        return MAILBOX.delivered(messageId);
    }
}
