// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title ISelfVerificationRoot
 * @notice Interface for Self.xyz verification root contract
 */
interface ISelfVerificationRoot {
    /**
     * @notice Generic disclosure output structure from Self.xyz V2 proofs
     * @param userIdentifier The user's unique identifier (wallet address as uint256)
     * @param nullifier Unique nullifier to prevent duplicate verifications
     * @param nationality The disclosed nationality (ISO 3166-1 alpha-3 code)
     * @param minimumAge The minimum age disclosed from the proof
     */
    struct GenericDiscloseOutputV2 {
        uint256 userIdentifier;
        uint256 nullifier;
        string nationality;
        uint256 minimumAge;
    }
    
    /**
     * @notice Verify and process a Self.xyz proof
     * @param proof The ZK proof data
     * @param userData Additional user-defined data
     */
    function verify(bytes calldata proof, bytes calldata userData) external;
}

