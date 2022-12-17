//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./../PalindromeSystem.sol";
import "./../PalindromeOrderBook.sol";

library PalindromeLibrary {
    function getInitHashMerchant() public pure returns (bytes32 hash) {
        return keccak256(abi.encodePacked(type(PalindromeSystem).creationCode));
    }

    function getInitHashOrderBook() public pure returns (bytes32 hash) {
        return
            keccak256(abi.encodePacked(type(PalindromeOrderBook).creationCode));
    }

    function sellerFor(
        address factory,
        address seller,
        uint256 merchantId
    ) internal pure returns (address merchantUID) {
        merchantUID = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex"ff",
                            factory,
                            keccak256(abi.encodePacked(seller, merchantId)),
                            getInitHashMerchant() // init code hash
                        )
                    )
                )
            )
        );
    }

    function orderBookFor(
        address factory,
        address merchant,
        address merchantUID
    ) internal pure returns (address orderBookUID) {
        orderBookUID = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex"ff",
                            factory,
                            keccak256(abi.encodePacked(merchant, merchantUID)),
                            getInitHashOrderBook() // init code hash
                        )
                    )
                )
            )
        );
    }

    // collects the fees 1%
    function getAmountOut(uint256 _amountIn)
        internal
        pure
        returns (uint256 amountOut)
    {
        require(_amountIn > 0, "AmountOut: INSUFFICIENT_AMOUNT");
        uint256 amountInWithFee = _amountIn * (990);
        return amountInWithFee / 1000;
    }
}
