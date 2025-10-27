// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { DataType } from "./dataType/DataType.sol";

/**
 * @notice - The OpenbandsV2 Badge Manager contract on BASE mainnet that store the verification data, which is verified on BASE and other chains
 * @dev - This contract will be deployed on BASE mainnet
 */
contract OpenbandsV2BadgeManager {

    // @dev - Storage to store an verified nationality record via Self.xyz on Celo.
    mapping (address => DataType.NationalityRecordViaSelf) public nationalityRecordViaSelfs;

    constructor() {
        // TODO:
    }

}