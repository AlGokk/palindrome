//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

interface IPalindromeFactory {
    function initCodeHashMerchant() external returns (bytes32);

    function initCodeHashOrderBook() external returns (bytes32);

    function getPaymentDetails()
        external
        view
        returns (address paymentSystemUID, address orderBookUID);

    function getOrderBook(address _merchant)
        external
        returns (address orderBookUID);

    function createPaymentSystem(address paymentSystemOwner)
        external
        returns (address paymentSystemUID, address orderBookUID);

    function setFeeTo(address _feeTo) external;

    function setFeeToSetter(address _feeToSetter) external;

    function setMediator(address _mediator) external;

    function feeTo() external returns (address _feeTo);

    function mediator() external returns (address);
}
