pragma solidity 0.8.28;

library DataType {

    struct WorldIDVerifierRecord {
        //bytes32 verificationConfigId;
        uint256 nullifier; // @dev - The nullifier of xxx struct should be stored into here.
        address walletAddress;
        uint256 createdAt;
    }

}