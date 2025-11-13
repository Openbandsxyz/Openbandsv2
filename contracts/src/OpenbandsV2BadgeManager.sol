// SPDX-License-Identifier: MIT
//pragma solidity >=0.8.19;
pragma solidity ^0.8.28;

import { DataType } from "./dataType/DataType.sol";
import { Converter } from "./dataType/converters/Converter.sol";

// @dev - Hyperlane wrapper contracts
import { ICeloSender } from "./hyperlane/interfaces/ICeloSender.sol";
import { IBaseReceiver } from "./hyperlane/interfaces/IBaseReceiver.sol";

/**
 * @notice - The OpenbandsV2 Badge Manager contract on BASE mainnet that store the verification data, which is verified on BASE and other chains
 * @dev - This contract will be deployed on BASE mainnet
 */
contract OpenbandsV2BadgeManager {

    ICeloSender public celoSender;
    IBaseReceiver public baseReceiver;

    /// @notice Celo mainnet domain ID
    uint32 public constant CELO_DOMAIN = 42220;

    // @dev - Storage to store an verified nationality record via Self.xyz on Celo.
    mapping (address => DataType.NationalityRecordViaSelf) public nationalityRecordViaSelfs;

    constructor(
        ICeloSender _celoSender,
        IBaseReceiver _baseReceiver
    ) {
        celoSender = _celoSender;
        baseReceiver = _baseReceiver;
    }

    /**
     * @notice - Receive a nationality record data-verified via Self.xyz, which is bridged from Celo to BASE.
     * @dev - The handle() must be called by the Hyperlane Mailbox (msg.sender != address(MAILBOX))
     *      - => Should I implement the own Mailbox contract on BASE? (And should the own own Mailbox coontract calls the handle())
     *      - => However, as long as I check the setup() in the CeloToBase.t.sol, the Mailbox contract is the BaseReceiver cntract.
     * @param nationalityRecordViaSelfInBytes - a message, which the NationalityRecord struct data is encoded.
     */
    function receiveNationalityRecordViaSelf(bytes memory nationalityRecordViaSelfInBytes) external {
        // @dev - Handle the received message
        // @dev - The handle() must be called by the Hyperlane Mailbox (msg.sender != address(MAILBOX))
        bytes32 celoSenderInBytes = Converter.addressToBytes32(address(celoSender));
        baseReceiver.handle(CELO_DOMAIN, celoSenderInBytes, nationalityRecordViaSelfInBytes); // [NOTE]: The caller must be the Hyperlane Mailbox

        /////////////////////////////////////////////////////////////////////////////////// 
        // @dev - Example from the CeloToBase.t.sol: Simulate mailbox calling handle
        // vm.prank(mockBaseMailbox);
        // baseReceiver.handle(CELO_SEPOLIA_DOMAIN, sender, message);
        ////////////////////////////////////////////////////////////////////////////////////


        // @dev - Decode a given message (nationalityRecordViaSelfInBytes)
        DataType.NationalityRecordViaSelf memory nationalityRecordViaSelf = abi.decode(nationalityRecordViaSelfInBytes, (DataType.NationalityRecordViaSelf));

        // @dev - Only allow calls from the trusted CeloSender contract
        require(msg.sender == nationalityRecordViaSelf.userAddress, "A caller must be an user address when a nationality was verified via Self.xyz on Celo");
        //require(msg.sender == address(celoSender), "Unauthorized sender");

        // @dev - Store the nationality record
        nationalityRecordViaSelfs[nationalityRecordViaSelf.userAddress] = nationalityRecordViaSelf;
    }

    /**
     * @notice - Get the nationality record data-verified via Self.xyz for a user address.
     */
    function getNationalityRecordViaSelf(address userAddress) external view returns (DataType.NationalityRecordViaSelf memory) {
        return nationalityRecordViaSelfs[userAddress];
    }
}