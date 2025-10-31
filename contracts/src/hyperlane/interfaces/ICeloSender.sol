// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IMailboxV3} from "./IMailboxV3.sol";


/**
 * @title - Interface of the CeloSender contract
 * @notice Sends cross-chain messages from Celo Sepolia to Base Sepolia via Hyperlane
 * @dev Deployed on Celo Sepolia (Chain ID: 11142220)
 * @dev Verified mailbox: 0xD0680F80F4f947968206806C2598Cbc5b6FE5b03
 */
contract ICeloSender {
    using TypeCasts for address;

    // ============ Constants ============

    /// @notice Base Sepolia domain ID
    uint32 public constant BASE_SEPOLIA_DOMAIN = 84532;

    /// @notice Hyperlane Mailbox on Celo Sepolia
    IMailboxV3 public immutable MAILBOX;

    // ============ Events ============

    /**
     * @notice Emitted when a message is dispatched to Base Sepolia
     * @param messageId Hyperlane message ID
     * @param recipient Recipient address on Base Sepolia
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

    /**
     * @notice Receive function to accept refunds from Hyperlane hooks
     * @dev Mailbox hooks refund excess msg.value after paying fees
     */
    receive() external payable {}

    // ============ External Functions ============

    /**
     * @notice Send a message to a recipient on Base Sepolia
     * @param recipient Address of the recipient on Base Sepolia
     * @param message Arbitrary message bytes to send
     * @return messageId Hyperlane message identifier
     * @dev The recipient should implement IMessageRecipient.handle()
     */
    function sendToBase(
        address recipient,
        bytes calldata message
    ) external payable returns (bytes32 messageId);

    /**
     * @notice Send a simple string message to Base Sepolia
     * @param recipient Address of the recipient on Base Sepolia
     * @param message String message to send
     * @return messageId Hyperlane message identifier
     */
    function sendStringToBase(
        address recipient,
        string calldata message
    ) external payable returns (bytes32 messageId);

    // ============ View Functions ============

    /**
     * @notice Get the local domain (chain) ID
     * @return Local domain identifier (should be 11142220 for Celo Sepolia)
     */
    function localDomain() external view returns (uint32);

    /**
     * @notice Check if a message has been delivered
     * @param messageId The message ID to check
     * @return True if delivered, false otherwise
     */
    function isDelivered(bytes32 messageId) external view returns (bool);
}
