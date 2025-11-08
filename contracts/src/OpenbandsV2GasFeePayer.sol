// SPDX-License-Identifier: MIT
//pragma solidity >=0.8.19;
pragma solidity ^0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice - The OpenbandsV2 Gas Fee Payer contract
 */
contract OpenbandsV2GasFeePayer is Ownable {

    constructor() Ownable(_msgSender()) {}

    function topUpGasFeeFromOpenbandsV2GasFeePayer(address payable to, uint256 estimatedGasFeeAmount) external payable {
        require(address(this).balance >= estimatedGasFeeAmount, "Insufficient balance to cover the estimated gas fee in the OpenbandsV2GasFeePayer contract");
        (bool success, ) = to.call{value: estimatedGasFeeAmount}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice - Withdraw native tokens from the contract
     * @param to - The address to send the tokens to
     * @param amount - The amount of tokens to send
     */
    function withdrawNativeTokens(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice - Get the native token balance of the contract
     */
    function getNativeTokenBalanceOfOpenbandsV2GasFeePayerContract() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice - Receive Ether function to receive native tokens ($CELO)
     */
    receive() external payable {
        emit NativeTokenReceived(msg.sender, msg.value);
    }

    event NativeTokenReceived(address indexed from, uint256 amount);
}