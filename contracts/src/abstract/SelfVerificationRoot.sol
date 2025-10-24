// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ISelfVerificationRoot} from "../interfaces/ISelfVerificationRoot.sol";

/**
 * @title SelfVerificationRoot
 * @notice Abstract contract for Self.xyz verification integration
 * @dev This is a simplified version - for production, use Self.xyz's official contracts
 */
abstract contract SelfVerificationRoot {
    
    /// @notice The scope value for this contract's verifications
    uint256 internal _scope;
    
    /// @notice Address of the Self.xyz Identity Verification Hub
    address public immutable identityVerificationHub;
    
    /**
     * @notice Constructor
     * @param _identityVerificationHubAddress Address of Self.xyz Identity Verification Hub V2
     * @param _scopeSeed Scope seed string to be hashed with contract address
     */
    constructor(address _identityVerificationHubAddress, string memory _scopeSeed) {
        identityVerificationHub = _identityVerificationHubAddress;
        // Generate scope by hashing contract address with scope seed
        _scope = uint256(keccak256(abi.encodePacked(address(this), _scopeSeed)));
    }
    
    /**
     * @notice Get the config ID for verification
     * @dev This must be overridden by inheriting contracts
     * @return The verification config ID
     */
    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view virtual returns (bytes32);
    
    /**
     * @notice Custom verification hook to be implemented by inheriting contracts
     * @dev Called after successful verification to handle business logic
     * @param output The verification output containing user data
     * @param userData Additional user-defined data
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual;
    
    /**
     * @notice Verify a Self.xyz proof
     * @dev In production, this would call the Identity Verification Hub
     *      For now, this is a placeholder that calls the custom hook directly
     * @param proof The ZK proof data (contains nationality in disclosed outputs)
     * @param userData Additional user-defined data
     */
    function verify(bytes calldata proof, bytes calldata userData) external {
        // In production, this would:
        // 1. Call IdentityVerificationHub.verify(proof)
        // 2. Hub verifies the ZK-SNARK proof on-chain
        // 3. Hub extracts disclosed outputs (nationality, age, etc.)
        // 4. Hub calls back to this contract's customVerificationHook
        
        // For now, we expect the frontend/backend to handle verification
        // and call customVerificationHook through storeNationalityVerification
        // This will be replaced when integrating Self.xyz Hub contracts
        
        revert("Use Self.xyz Identity Verification Hub for proof verification");
    }
}

