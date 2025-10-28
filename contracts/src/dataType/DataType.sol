pragma solidity >=0.8.19;

library DataType {

    // // @dev - 
    // struct ProofOfHumanRecordViaSelf {
    //     bytes32 verificationConfigId;
    //     uint256 chainId; 
    //     address userAddress;     // @dev - User ID in Self.xyz
    //     bool isAboveMinimumAge;
    //     bool isValidNationality;
    //     uint256 nullifier;     // @dev - The nullifier of the GenericDiscloseOutputV2 struct should be stored into here.
    //     uint256 createdAt;
    // }

    // @dev - Tentative definition for storing the nationality record, which is retrieved via Self.xyz on Celo mainnet
    struct NationalityRecordViaSelf {
        string nationality;            // ISO 3166-1 alpha-3 country code (e.g., "USA", "GBR", "JPN")
        bool isValidNationality;      // Whether nationality was successfully verified
        uint256 verifiedAt;           // Timestamp of verification
        bool isActive;                // Whether record is still active
        //uint256 nullifier;
        uint256 chainId; 
        address userAddress;   // @dev - User ID in Self.xyz on Celo mainnet
    }

    /// @notice Nationality record for a verified user
    // struct NationalityRecord {
    //     string nationality;            // ISO 3166-1 alpha-3 country code (e.g., "USA", "GBR", "JPN")
    //     bool isValidNationality;      // Whether nationality was successfully verified
    //     uint256 verifiedAt;           // Timestamp of verification
    //     bool isActive;                // Whether record is still active
    // }

}