//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

interface IPalindromeLibrary {
    function getInitHash() external;

    function sellerFor(
        address factory,
        address seller,
        uint256 sellerId
    ) external returns (address merchanUID);

    function getAmountOut(uint256 amountIn) external;
}
