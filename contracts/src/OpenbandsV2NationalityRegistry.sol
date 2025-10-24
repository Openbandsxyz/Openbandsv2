// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title OpenbandsV2NationalityRegistry
 * @notice Registry contract for storing Self.xyz nationality verification data
 * @dev This contract stores the RESULT of off-chain ZK proof verification
 *      The actual ZK-SNARK proof verification happens off-chain via Self.xyz backend
 *      to save gas costs (on-chain ZK verification costs $50-200+ per transaction)
 */
contract OpenbandsV2NationalityRegistry {
    
    // ============ Structs ============
    
    struct NationalityRecord {
        address userAddress;           // Wallet address of verified user
        string nationality;            // ISO 3166-1 alpha-3 country code (e.g., "USA", "GBR", "IND")
        bool isAboveMinimumAge;       // Whether user meets minimum age requirement (18+)
        bool isValidNationality;      // Whether nationality was successfully verified
        uint256 verifiedAt;           // Timestamp of verification
        bool isActive;                // Whether record is still active (for revocations)
    }
    
    // ============ State Variables ============
    
    /// @notice Mapping from user address to their nationality record
    mapping(address => NationalityRecord) public nationalityRecords;
    
    /// @notice Array of all verified user addresses (for enumeration)
    address[] public verifiedUsers;
    
    /// @notice Mapping to track if user is in verifiedUsers array
    mapping(address => bool) private isUserIndexed;
    
    /// @notice Total count of active verifications
    uint256 public totalActiveVerifications;
    
    /// @notice Contract owner (for emergency functions)
    address public owner;
    
    // ============ Events ============
    
    event NationalityVerified(
        address indexed user,
        string nationality,
        bool isAboveMinimumAge,
        uint256 timestamp
    );
    
    event RecordRevoked(address indexed user, uint256 timestamp);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ Main Functions ============
    
    /**
     * @notice Store nationality verification data for the caller
     * @dev This function is called AFTER off-chain ZK proof verification succeeds
     * @param _nationality ISO 3166-1 alpha-3 country code (e.g., "USA", "GBR", "IND")
     * @param _isAboveMinimumAge Whether user meets minimum age requirement
     * @param _isValidNationality Whether nationality was successfully verified
     */
    function storeNationalityVerification(
        string memory _nationality,
        bool _isAboveMinimumAge,
        bool _isValidNationality
    ) external {
        require(_isValidNationality, "Nationality verification failed");
        require(bytes(_nationality).length > 0, "Nationality cannot be empty");
        require(bytes(_nationality).length <= 3, "Nationality must be 3-letter ISO code");
        
        address user = msg.sender;
        
        // Check if this is a new verification
        bool isNewUser = !isUserIndexed[user];
        bool wasActive = nationalityRecords[user].isActive;
        
        // Store the record
        nationalityRecords[user] = NationalityRecord({
            userAddress: user,
            nationality: _nationality,
            isAboveMinimumAge: _isAboveMinimumAge,
            isValidNationality: _isValidNationality,
            verifiedAt: block.timestamp,
            isActive: true
        });
        
        // Add to verified users array if new
        if (isNewUser) {
            verifiedUsers.push(user);
            isUserIndexed[user] = true;
        }
        
        // Update total count
        if (!wasActive) {
            totalActiveVerifications++;
        }
        
        emit NationalityVerified(user, _nationality, _isAboveMinimumAge, block.timestamp);
    }
    
    // ============ View Functions ============
    
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
     * @notice Get total count of verified users
     * @return uint256 Total count
     */
    function getTotalVerifiedUsers() external view returns (uint256) {
        return verifiedUsers.length;
    }
    
    // ============ Admin Functions ============
    
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
    
    /**
     * @notice Transfer ownership to a new address
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}

