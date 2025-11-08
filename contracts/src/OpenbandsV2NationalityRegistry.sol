// SPDX-License-Identifier: MIT
//pragma solidity >=0.8.19;
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfVerificationRoot} from "@selfxyz/contracts/abstract/SelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/interfaces/IIdentityVerificationHubV2.sol";

// @dev - Hyperlane wrapper contracts
import { ICeloSender } from "./hyperlane/interfaces/ICeloSender.sol";
import { IBaseReceiver } from "./hyperlane/interfaces/IBaseReceiver.sol";


/**
 * @title OpenbandsV2NationalityRegistry
 * @notice Registry contract for storing Self.xyz nationality verification data
 * @dev Inherits from SelfVerificationRoot V2 for automatic proof verification via Self.xyz Hub
 *      Nationality is disclosed as a public output from the ZK proof and stored on-chain
 */
contract OpenbandsV2NationalityRegistry is SelfVerificationRoot, Ownable {
    
    ICeloSender public celoSender;
    IBaseReceiver public baseReceiver;

    // ====================================================
    // Storage Variables
    // ====================================================
    
    /// @notice Nationality record for a verified user
    struct NationalityRecord {
        string nationality;            // ISO 3166-1 alpha-3 country code (e.g., "USA", "GBR", "JPN")
        bool isValidNationality;      // Whether nationality was successfully verified
        uint256 verifiedAt;           // Timestamp of verification
        bool isActive;                // Whether record is still active
        uint256 chainId; 
        address userAddress;   // @dev - User ID in Self.xyz on Celo main
    }
    
    /// @notice Mapping from user address to their nationality record
    mapping(address => NationalityRecord) public nationalityRecords;
    
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
    
    error InvalidNationality();
    error InvalidUserIdentifier();
    
    // ====================================================
    // Events
    // ====================================================
    
    event NationalityVerified(
        address indexed user,
        string nationality,
        //bytes message,      // @dev - a message via Hyperlane to bridge from Celo to Base
        uint256 timestamp
    );
    
    event RecordRevoked(address indexed user, uint256 timestamp);

    event NativeTokenReceived(address indexed user, uint256 amount); // @dev - Event for receiving native tokens ($CELO)


    // ====================================================
    // Constructor
    // ====================================================
    
    /**
     * @notice Constructor for OpenbandsV2NationalityRegistry
     * @param identityVerificationHubAddress The address of the Identity Verification Hub V2
     * @param scopeSeed The scope seed string (e.g., "openbands-v2")
     */
    constructor(
        address identityVerificationHubAddress,
        string memory scopeSeed,
        ICeloSender _celoSender,
        IBaseReceiver _baseReceiver
    ) SelfVerificationRoot(identityVerificationHubAddress, scopeSeed) Ownable(_msgSender()) {
        celoSender = _celoSender;
        baseReceiver = _baseReceiver;

        // Create unformatted config (human-readable)
        string[] memory forbiddenCountries = new string[](0); // No country restrictions
        SelfUtils.UnformattedVerificationConfigV2 memory rawConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 0,               // No age verification required
            forbiddenCountries: forbiddenCountries,  // Allow all countries
            ofacEnabled: false          // Disable OFAC for nationality verification
        });
        
        // Format the config into wire format
        verificationConfig = SelfUtils.formatVerificationConfigV2(rawConfig);
        
        // Register config with Hub and get the config ID
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubAddress)
            .setVerificationConfigV2(verificationConfig);
    }
    
    // ====================================================
    // External/Public Functions
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
     * @notice Get nationality record for a specific user
     * @param _user Address of the user
     * @return The nationality record struct
     */
    function getNationalityRecord(address _user) external view returns (NationalityRecord memory) {
        return nationalityRecords[_user];
    }
    
    /**
     * @notice Check if a user has an active nationality verification
     * @param _user Address of the user
     * @return bool True if user has active verification
     */
    function isUserVerified(address _user) external view returns (bool) {
        return nationalityRecords[_user].isActive && nationalityRecords[_user].isValidNationality;
    }
    
    /**
     * @notice Get nationality for a specific user
     * @param _user Address of the user
     * @return string The nationality (3-letter ISO code)
     */
    function getUserNationality(address _user) external view returns (string memory) {
        require(nationalityRecords[_user].isActive, "User not verified");
        return nationalityRecords[_user].nationality;
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
     * @notice Revoke a user's nationality verification (emergency only)
     * @param _user Address of the user to revoke
     */
    function revokeVerification(address _user) external onlyOwner {
        require(nationalityRecords[_user].isActive, "User not active");
        
        nationalityRecords[_user].isActive = false;
        totalActiveVerifications--;
        
        emit RecordRevoked(_user, block.timestamp);
    }
    
    // ====================================================
    // Override Functions from SelfVerificationRoot
    // ====================================================
    
    /**
     * @notice Hook called after successful verification - handles nationality registration
     * @dev Validates conditions and registers the user's nationality from the ZK proof
     * @param output The verification output containing nationality and user data
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
        
        // Extract nationality from disclosed attributes
        // The nationality is disclosed as part of the ZK proof
        string memory nationality = output.nationality;
        
        // Validate nationality
        if (bytes(nationality).length == 0 || bytes(nationality).length > 3) {
            revert InvalidNationality();
        }
        
        // Check if this is a new user (first verification)
        bool isNewUser = !nationalityRecords[user].isActive;
        bool wasActive = nationalityRecords[user].isActive;
        
        // Store the nationality record (allows re-verification / updates)
        nationalityRecords[user] = NationalityRecord({
            nationality: nationality,
            isValidNationality: true,
            verifiedAt: block.timestamp,
            isActive: true,
            userAddress: user,
            chainId: block.chainid
        });

        // // @dev - Send a message from Celo mainnet to BASE mainnet via Hyperlane
        // //bytes memory message = "test";
        // bytes memory message = abi.encode(nationalityRecords[user]);
        // celoSender.sendToBase(address(baseReceiver), message); // @dev - TODO: Replace the SC address (of the Badge Manager contract) with the actual address

        // Add to verified users array if new
        if (isNewUser) {
            verifiedUsers.push(user);
        }
        
        // Update total count
        if (!wasActive) {
            totalActiveVerifications++;
        }
        
        emit NationalityVerified(
            user,
            nationality,
            //message,      // @dev - a message via Hyperlane to bridge from Celo to Base
            block.timestamp
        );
    }

    /**
     * @notice - Receive Ether function to receive native tokens ($CELO)
     */
    receive() external payable {
        emit NativeTokenReceived(msg.sender, msg.value);
    }
}
