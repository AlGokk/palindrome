// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./IPalindromeOrderBook.sol";

interface IPalindromeRouter {
    function factory() external view returns (address);

    function WETH() external view returns (address);

    event Transfer(address indexed from, address to, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    event Deposit(address indexed from, uint256 amount);

    function createPaymentSystem()
        external
        returns (address paymentUID, address orderBookUID);

    function createOrder(
        address _token,
        address _orderBookUID,
        address _to,
        uint256 _amount,
        bytes32[2] memory _title,
        uint256 _maturityTime
    ) external;

    function sendBNBToSellerWithEscrow(
        address _token,
        address _to,
        address _paymentSystemUID,
        uint256 _orderID,
        bytes32[2] memory _title,
        uint256 _deadline
    ) external payable;

    function sendTokenWithoutEscrow(
        address _token,
        address _to,
        address _orderBookUID,
        uint256 _amount,
        bytes32[2] memory _title,
        uint256 _deadline
    ) external returns (bool status);

    function sendBNBWithoutEscrow(
        address _token,
        address payable _to,
        address _orderBookUID,
        bytes32[2] memory _title,
        uint256 _deadline
    ) external payable;

    function sendTokenToSellerWithEscrow(
        address _token,
        address _to,
        address _paymentSystemUID,
        uint256 _orderID,
        uint256 _amount,
        bytes32[2] memory _title,
        uint256 _deadline
    ) external;

    function withDrawSellerBNB(
        address _paymentSystemUID,
        address _orderBookUID,
        uint256 _orderID,
        uint256 _deadline
    ) external;

    function withDrawCustomerBNB(
        address _seller,
        address _paymentSystemUID,
        address _orderBookUID,
        uint256 _orderID,
        uint256 _deadline
    ) external;

    function withDrawCustomer(
        address _token,
        address _seller,
        address _paymentSystemUID,
        address _orderBookUID,
        uint256 _orderID,
        uint256 _deadline
    ) external;

    function withDrawSeller(
        address _token,
        address _paymentSystemUID,
        address _orderBookUID,
        uint256 _orderID,
        uint256 _deadline
    ) external;

    function confirmReceiptTheCustomer(address _orderBookUID, uint256 _orderID)
        external
        returns (bool);

    function cancelOrder(address _orderBookUID, uint256 _orderID)
        external
        returns (bool status);

    function openDispute(address _orderBookUID, uint256 _orderID)
        external
        returns (bool success);

    function getOrderStatus(address _orderBookUID, uint256 _orderID)
        external
        view
        returns (IPalindromeOrderBook.Status status);
}
