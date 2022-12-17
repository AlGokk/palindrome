// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./libraries/TransferHelper.sol";
import "./interfaces/IPalindromeOrderBook.sol";

contract PalindromeOrderBook is IPalindromeOrderBook {
    address public immutable override factory;
    address public override paymentSystemUID;
    address public override mediator;
    uint256 private _maturityTimeMultiplicand = 1 minutes;
    uint256 public orderIDCount = 0;

    constructor() {
        factory = msg.sender;
    }

    uint256 private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "BPS::lock LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    mapping(address => mapping(uint256 => Order)) public getOrder;

    modifier onlyMediator(address _from) {
        require(_from == mediator, "BPOB::Only Mediator allowed");
        _;
    }

    modifier onlyExpectedState(
        address _from,
        uint256 orderID,
        Status expected_state
    ) {
        require(
            getOrder[_from][orderID].status == expected_state,
            "BPOB::onlyExpectedState - Not expected status"
        );
        _;
    }

    function initializeOrderBook(address _paymentSystemUID, address _mediator)
        external
        override
    {
        require(msg.sender == factory, "BPOB::initialize FORBIDDEN"); // sufficient check
        require(
            _paymentSystemUID != address(0),
            "BPOB::_paymentSystemUID address is 0"
        );
        require(_mediator != address(0), "BPOB::_mediator address is 0");

        paymentSystemUID = _paymentSystemUID;
        mediator = _mediator;
        emit OrderBookInitialised(paymentSystemUID, address(this), mediator);
    }

    function getOrderIDCount()
        external
        view
        override
        returns (uint256 orderID)
    {
        return orderIDCount;
    }

    function updateOrCreateOrder(
        address _token,
        address _from,
        address _to,
        uint256 _amount,
        uint256 _orderID,
        bytes32[2] memory _title,
        Status _status
    ) external override returns (bool success) {
        Order memory order = getOrder[_from][_orderID];
        require(order.token == _token, "BPO::updateOrCreateOrder wrong token");
        if (isExistOrder(_from, _orderID)) {
            bool successUpdate = _updateOrder(order, _orderID, _status);
            require(successUpdate, "BPOB::updateOrCreateOrder failed");
            return true;
        } else {
            // 0 maturityTime empty
            (success) = this.createOrder(
                _token,
                _from,
                _to,
                _amount,
                _title,
                0
            );
            require(success, "BPOB::Order not created");
            return true;
        }
    }

    function _updateOrder(
        Order memory order,
        uint256 _orderID,
        Status _status
    ) internal returns (bool) {
        getOrder[order.seller][_orderID].status = _status;
        getOrder[order.customer][_orderID].status = _status;

        emit OrderUpdated(
            address(this),
            order.seller,
            order.customer,
            _orderID,
            _status,
            order.token,
            order.amount,
            order._title0,
            order._title1,
            order.openingTime,
            order.closingTime,
            order.maturityTime
        );
        return true;
    }

    function createOrder(
        address _token,
        address _seller,
        address _customer,
        uint256 _amount,
        bytes32[2] memory _title,
        uint256 _maturitiyTime
    ) external override returns (bool success) {
        uint256 _orderID = this.getOrderIDCount();
        (success) = _addOrder(
            _token,
            _seller,
            _customer,
            _orderID,
            _amount,
            _title,
            Status.InProgress,
            _maturitiyTime
        );
        require(success, "BPOB::Order not created");
        orderIDCount += 1;
        emit OrderCreated(
            address(this),
            _seller,
            _customer,
            _orderID,
            Status.InProgress,
            _token,
            _amount,
            _title[0],
            _title[1],
            block.timestamp,
            block.timestamp + (_maturitiyTime * _maturityTimeMultiplicand),
            _maturitiyTime
        );
        return true;
    }

    function _addOrder(
        address _token,
        address _seller,
        address _customer,
        uint256 _orderID,
        uint256 _amount,
        bytes32[2] memory _title,
        Status _status,
        uint256 _maturitiyTime
    ) internal returns (bool) {
        getOrder[_seller][_orderID] = Order(
            _token,
            _seller,
            _customer,
            _orderID,
            _status,
            _amount,
            _title[0],
            _title[1],
            block.timestamp,
            block.timestamp + (_maturitiyTime * _maturityTimeMultiplicand),
            _maturitiyTime
        );

        getOrder[_customer][_orderID] = Order(
            _token,
            _seller,
            _customer,
            _orderID,
            _status,
            _amount,
            _title[0],
            _title[1],
            block.timestamp,
            block.timestamp + (_maturitiyTime * _maturityTimeMultiplicand),
            _maturitiyTime
        );
        return true;
    }

    function deleteOrder(
        address _from,
        uint256 _orderID,
        Status _status
    ) public override returns (bool status) {
        Order memory order = getOrder[_from][_orderID];
        bool successUpdate = _updateOrder(order, _orderID, _status);
        require(successUpdate, "BPOB::cancelOrder failed");
        delete getOrder[order.seller][_orderID];
        delete getOrder[order.customer][_orderID];
        return true;
    }

    function getOrderAmount(address _from, uint256 _orderID)
        external
        view
        override
        returns (uint256)
    {
        return getOrder[_from][_orderID].amount;
    }

    function getOrderData(address _from, uint256 _orderID)
        external
        view
        override
        returns (Order memory)
    {
        return getOrder[_from][_orderID];
    }

    function isExistOrder(address _from, uint256 _orderID)
        private
        view
        returns (bool exist)
    {
        if (getOrder[_from][_orderID].customer != address(0)) {
            return true;
        }
        return false;
    }

    function keepTrackOrderCreated(
        address _token,
        address _from,
        address _to,
        uint256 _orderID,
        uint256 _amount,
        bytes32[2] memory _title
    ) public override {
        orderIDCount += 1;
        Order memory order = getOrder[_from][_orderID];
        emit OrderCreated(
            address(this),
            _from,
            _to,
            _orderID,
            Status.Completed,
            _token,
            _amount,
            _title[0],
            _title[1],
            order.openingTime,
            order.closingTime,
            order.maturityTime
        );
    }

    function cancelOrder(address _from, uint256 _orderID)
        external
        override
        onlyExpectedState(_from, _orderID, Status.InProgress)
        returns (bool)
    {
        Order memory order = getOrder[_from][_orderID];
        require(
            order.seller == _from || order.customer == _from,
            "BPOB::Only Seller/Customer allowed"
        );

        bool successUpdate = _updateOrder(order, _orderID, Status.Canceled);
        require(successUpdate, "BPOB::cancelOrder failed");
        return true;
    }

    function openDispute(address _from, uint256 _orderID)
        external
        override
        onlyExpectedState(_from, _orderID, Status.Paid)
        returns (bool)
    {
        Order memory order = getOrder[_from][_orderID];
        require(order.customer == _from, "BPOB::Only customer allowed");

        bool successUpdate = _updateOrder(order, _orderID, Status.OpenDispute);
        require(successUpdate, "BPOB::openDispute failed");

        return true;
    }

    function confirmReceiptTheCustomer(address _from, uint256 _orderID)
        external
        override
        onlyExpectedState(_from, _orderID, Status.Paid)
        returns (bool)
    {
        Order memory order = getOrder[_from][_orderID];
        require(
            order.customer == _from,
            "BPO::confirmReceiptTheCustomer only customer allowed"
        );

        bool successUpdate = _updateOrder(order, _orderID, Status.Delivered);
        require(successUpdate, "BPOB::cancelOrder failed");
        return true;
    }

    function setState(
        address _owner,
        address _seller,
        uint256 _orderID,
        Status _status
    ) external override onlyMediator(_owner) returns (bool success) {
        Order memory order = getOrder[_seller][_orderID];
        bool successUpdate = _updateOrder(order, _orderID, _status);
        require(successUpdate, "BPOB::setState failed");
        if (_status == Status.Canceled || _status == Status.Completed) {
            deleteOrder(_seller, _orderID, _status);
        }
        return true;
    }

    function getOrderStatus(address _from, uint256 _orderID)
        external
        view
        override
        returns (Status status)
    {
        Order memory order = getOrder[_from][_orderID];
        require(
            order.seller == _from || order.customer == _from,
            "BPOB::Only Seller/Customer allowed"
        );

        return getOrder[_from][_orderID].status;
    }

    function getOrderToken(address _from, uint256 _orderID)
        external
        view
        override
        returns (address token)
    {
        return getOrder[_from][_orderID].token;
    }
}
