// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfVerificationRoot} from "@selfxyz/contracts/abstract/SelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title OpenbandsV2AgeRegistry
 * @notice Registry contract for storing Self.xyz age verification data
 * @dev Inherits from SelfVerificationRoot V2 for automatic proof verification via Self.xyz Hub
 *      Age verification (18+) is disclosed as a public output from the ZK proof and stored on-chain
 */
contract OpenbandsV2AgeRegistry is SelfVerificationRoot, Ownable {
    
    // ====================================================
    // Storage Variables
    // ====================================================
    
    /// @notice Age verification record for a verified user
    struct AgeRecord {
        bool isAgeVerified;         // Whether user is verified to be 18+
        uint256 verifiedAt;         // Timestamp of verification
        bool isActive;              // Whether record is still active
    }
    
    /// @notice Mapping from user address to their age record
    mapping(address => AgeRecord) public ageRecords;
    
    /// @notice Array of all verified user addresses (for enumeration)
    address[] public verifiedUsers;
    
    /// @notice Total count of active verifications
    uint256 public totalActiveVerifications;
    
    /// @notice Verification configuration stored in wire format
    SelfStructs.VerificationConfigV2 public verificationConfig;
    
    /// @notice Verification config ID for identity verification
    bytes32 public verificationConfigId;
    
    // ====================================================
    // Errors
    // ====================================================
    
    error InvalidAgeVerification();
    error UserNotVerified();
    error InvalidUserIdentifier();
    
    // ====================================================
    // Events
    // ====================================================
    
    event AgeVerificationStored(
        address indexed user,
        bool isAgeVerified,
        uint256 verifiedAt,
        bool isActive
    );
    
    event RecordRevoked(address indexed user, uint256 timestamp);
    
    // ====================================================
    // Constructor
    // ====================================================
    
    /**
     * @notice Constructor for OpenbandsV2AgeRegistry
     * @param identityVerificationHubAddress The address of the Identity Verification Hub V2
     * @param scopeSeed The scope seed string (e.g., "openbands-age-v2")
     */
    constructor(
        address identityVerificationHubAddress,
        string memory scopeSeed
    ) SelfVerificationRoot(identityVerificationHubAddress, scopeSeed) Ownable(_msgSender()) {
        
        // Create unformatted config (human-readable)
        string[] memory forbiddenCountries = new string[](0); // No country restrictions
        SelfUtils.UnformattedVerificationConfigV2 memory rawConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,              // Require age 18+ verification
            forbiddenCountries: forbiddenCountries,  // Allow all countries
            ofacEnabled: false          // Disable OFAC for age verification
        });
        
        // Format the config into wire format
        verificationConfig = SelfUtils.formatVerificationConfigV2(rawConfig);
        
        // Register the verification config with the Hub
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubAddress).setVerificationConfigV2(verificationConfig);
    }
    
    // ====================================================
    // View Functions
    // ====================================================
    
    /**
     * @notice Sets the verification config ID
     * @dev Only callable by the contract owner
     * @param configId The verification config ID to set
     */
    function setConfigId(bytes32 configId) external onlyOwner {
        verificationConfigId = configId;
    }
    
    /**
     * @notice Generates a configId for the user
     * @dev Override of the SelfVerificationRoot virtual function
     * @return The stored verification config ID
     */
    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }
    
    /**
     * @notice Get age record for a specific user
     * @param _user Address of the user
     * @return The age record struct
     */
    function getAgeRecord(address _user) external view returns (AgeRecord memory) {
        return ageRecords[_user];
    }
    
    /**
     * @notice Check if a user has verified age (18+)
     * @param _user Address of the user
     * @return True if user is verified to be 18+
     */
    function isUserAgeVerified(address _user) external view returns (bool) {
        return ageRecords[_user].isActive && ageRecords[_user].isAgeVerified;
    }
    
    /**
     * @notice Get all verified user addresses
     * @return Array of verified user addresses
     */
    function getAllVerifiedUsers() external view returns (address[] memory) {
        return verifiedUsers;
    }
    
    /**
     * @notice Retrieves the expected proof scope
     * @return The scope value used for verification
     */
    function getScope() external view returns (uint256) {
        return _scope;
    }
    
    // ====================================================
    // Admin Functions
    // ====================================================
    
    /**
     * @notice Revoke a user's age verification (emergency only)
     * @param _user Address of the user to revoke
     */
    function revokeVerification(address _user) external onlyOwner {
        require(ageRecords[_user].isActive, "User not active");
        
        ageRecords[_user].isActive = false;
        totalActiveVerifications--;
        
        emit RecordRevoked(_user, block.timestamp);
    }
    
    // ====================================================
    // Override Functions from SelfVerificationRoot
    // ====================================================
    
    /**
     * @notice Hook called after successful verification - handles age registration
     * @dev Validates conditions and registers the user's age verification from the ZK proof
     * @param output The verification output containing age verification data
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /* userData */
    ) internal override {
        // Convert userIdentifier (uint256) to address
        // The userIdentifier from Self.xyz is the user's wallet address encoded as uint256
        address user = address(uint160(output.userIdentifier));
        
        // Check if user identifier is valid
        if (output.userIdentifier == 0) {
            revert InvalidUserIdentifier();
        }
        
        // Extract age verification from disclosed attributes
        // The olderThan field indicates if user is 18+ (true) or not (false)
        // Note: olderThan is uint256 in the struct, so we check if it's >= 18
        bool isAgeVerified = output.olderThan >= 18;
        
        // Validate age verification
        if (!isAgeVerified) {
            revert InvalidAgeVerification();
        }
        
        // Check if this is a new user (first verification)
        bool isNewUser = !ageRecords[user].isActive;
        
        // Store the age record (allows re-verification / updates)
        ageRecords[user] = AgeRecord({
            isAgeVerified: isAgeVerified,
            verifiedAt: block.timestamp,
            isActive: true
        });
        
        // Add to verified users array if new user
        if (isNewUser) {
            verifiedUsers.push(user);
            totalActiveVerifications++;
        }
        
        // Emit event for the stored verification
        emit AgeVerificationStored(
            user,
            isAgeVerified,
            block.timestamp,
            true
        );
    }
}
