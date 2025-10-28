// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;
//pragma solidity 0.8.28;

import { DataType } from "./dataType/DataType.sol";

// @dev - Hyperlane wrapper contracts
import { CeloSender } from "./hyperlane/CeloSender.sol";
import { BaseReceiver } from "./hyperlane/BaseReceiver.sol";

/**
 * @notice - The OpenbandsV2 Badge Manager contract on BASE mainnet that store the verification data, which is verified on BASE and other chains
 * @dev - This contract will be deployed on BASE mainnet
 */
contract OpenbandsV2BadgeManager {

    CeloSender public celoSender;
    BaseReceiver public baseReceiver;

    /// @notice Celo mainnet domain ID
    uint32 public constant CELO_DOMAIN = 42220;

    // @dev - Storage to store an verified nationality record via Self.xyz on Celo.
    mapping (address => DataType.NationalityRecordViaSelf) public nationalityRecordViaSelfs;

    constructor(
        CeloSender _celoSender,
        BaseReceiver _baseReceiver
    ) {
        celoSender = _celoSender;
        baseReceiver = _baseReceiver;
    }

    /**
     * @notice - Receive a nationality record data-verified via Self.xyz, which is bridged from Celo to BASE.
     */
    function receiveNationalityRecordViaSelf(bytes memory nationalityRecordViaSelfInBytes) external {
        // @dev - Only allow calls from the trusted CeloSender contract
        require(msg.sender == address(celoSender), "Unauthorized sender");

        // @dev - Handle the received message
        baseReceiver.handle(CELO_DOMAIN, address(celoSender), nationalityRecordViaSelf);

        // @dev - Store the nationality record
        DataType.NationalityRecordViaSelf memory nationalityRecordViaSelf = abi.decode(encodedNationalityRecordViaSelf, (nationalityRecordViaSelfInBytes));
        nationalityRecordViaSelfs[nationalityRecordViaSelf.userAddress] = nationalityRecordViaSelf;
    }
}