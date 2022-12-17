// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IPalindromeOrderBook {
    // Returns uint
    // InProgress,  0
    // Paid,        1
    // Delivered,   2
    // Completed    3
    // Canceled,    4
    // OpenDispute,  5
    // CanceledOpenDispute, 6
    // CompletedOpenDispute, 7

    enum Status {
        InProgress,
        Paid,
        Delivered,
        Completed,
        Canceled,
        OpenDispute,
        CanceledOpenDispute,
        CompletedOpenDispute
    }

    struct Order {
        address token;
        address seller;
        address customer;
        uint256 orderID;
        Status status;
        uint256 amount;
        bytes32 _title0;
        bytes32 _title1;
        uint256 openingTime;
        uint256 closingTime;
        uint256 maturityTime;
    }

    event OrderUpdated(
        address orderBookUID,
        address _seller,
        address _customer,
        uint256 indexed _orderID,
        Status indexed _status,
        address _token,
        uint256 _amount,
        bytes32 _title0,
        bytes32 _title1,
        uint256 openingTime,
        uint256 closingTime,
        uint256 maturityTime
    );
    event OrderCreated(
        address orderBookUID,
        address _seller,
        address _customer,
        uint256 indexed _orderID,
        Status indexed _status,
        address _token,
        uint256 _amount,
        bytes32 _title0,
        bytes32 _title1,
        uint256 openingTime,
        uint256 closeTime,
        uint256 maturityTime
    );

    event OrderBookInitialised(
        address indexed paymentSystemUID,
        address indexed orderBookUID,
        address mediator
    );

    function factory() external view returns (address);

    function mediator() external view returns (address);

    function paymentSystemUID() external view returns (address);

    function getOrderIDCount() external view returns (uint256);

    function initializeOrderBook(address _paymentSystemUID, address _mediator)
        external;

    function updateOrCreateOrder(
        address _token,
        address _from,
        address _to,
        uint256 _amount,
        uint256 _orderID,
        bytes32[2] memory _title,
        Status _status
    ) external returns (bool status);

    function createOrder(
        address _token,
        address _seller,
        address _customer,
        uint256 _amount,
        bytes32[2] memory _title,
        uint256 _maturitiyTime
    ) external returns (bool status);

    function deleteOrder(
        address _from,
        uint256 _orderID,
        Status _status
    ) external returns (bool status);

    function getOrderAmount(address _from, uint256 _orderID)
        external
        view
        returns (uint256);

    function getOrderData(address _from, uint256 _orderID)
        external
        view
        returns (Order memory);

    function cancelOrder(address _orderBookUID, uint256 _orderID)
        external
        returns (bool);

    function openDispute(address _from, uint256 _orderID)
        external
        returns (bool);

    function confirmReceiptTheCustomer(address _from, uint256 _orderID)
        external
        returns (bool);

    function setState(
        address _owner,
        address _seller,
        uint256 _orderID,
        Status _status
    ) external returns (bool);

    function keepTrackOrderCreated(
        address _token,
        address _from,
        address _to,
        uint256 _orderID,
        uint256 _amount,
        bytes32[2] memory _title
    ) external;

    function getOrderStatus(address _from, uint256 _orderID)
        external
        view
        returns (Status status);

    function getOrderToken(address _from, uint256 _orderID)
        external
        view
        returns (address token);
}
