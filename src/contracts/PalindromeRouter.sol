// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interfaces/IPalindromeSystem.sol";
import "./interfaces/IPalindromeOrderBook.sol";
import "./interfaces/IPalindromeRouter.sol";
import "./interfaces/IPalindromeLibrary.sol";
import "./interfaces/IWETH.sol";
import "./libraries/PalindromeLibrary.sol";
import "./PalindromeSystem.sol";
import "./SafeERC20.sol";

contract PalindromeRouter is IPalindromeRouter {
    using PalindromeLibrary for IPalindromeLibrary;
    using SafeERC20 for IERC20;
    address public immutable override factory;
    address public immutable override WETH;
    uint256 private orderIDCount;

    constructor(address _factory, address _WETH) {
        require(_factory != address(0), "BPR::_factory address is 0");
        require(_WETH != address(0), "BPR::_WETH address is 0");
        factory = _factory;
        WETH = _WETH;
    }

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "BPR::ensure EXPIRED");
        _;
    }

    uint256 private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "BPS::lock LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    function createPaymentSystem()
        external
        override
        returns (address paymentSystemUID, address orderBookUID)
    {
        (paymentSystemUID, orderBookUID) = IPalindromeFactory(factory)
            .createPaymentSystem(msg.sender);
    }

    function sendTokenToSellerWithEscrow(
        address _token,
        address _to,
        address _paymentSystemUID,
        uint256 _amount,
        uint256 _orderID,
        bytes32[2] memory _title,
        uint256 _deadline
    ) external override ensure(_deadline) {
        IERC20 token = IERC20(_token);
        require(msg.sender != _to, "BPR::Now allowed to send yourself");
        IPalindromeSystem(_paymentSystemUID).mint(
            _token,
            msg.sender,
            _to,
            _amount,
            _orderID,
            _title
        );
        token.safeTransferFrom(msg.sender, _paymentSystemUID, _amount);
    }

    function _depositTokens(address _token, uint256 _amount) internal {
        IERC20 token = IERC20(_token);
        token.safeTransferFrom(msg.sender, address(this), _amount);
    }

    function _transfer(
        address _token,
        address to,
        uint256 amount
    ) internal {
        IERC20 token = IERC20(_token);
        token.safeTransfer(to, amount);
    }

    function sendTokenWithoutEscrow(
        address _token,
        address _to,
        address _orderBookUID,
        uint256 _amount,
        bytes32[2] memory _title,
        uint256 _deadline
    ) external override lock ensure(_deadline) returns (bool) {
        require(msg.sender != _to, "BPR::Now allowed send yourself");
        uint256 _amountInMinusFee = PalindromeLibrary.getAmountOut(_amount);
        _depositTokens(_token, _amount);
        _transfer(_token, _to, _amountInMinusFee);
        uint256 _orderID = IPalindromeOrderBook(_orderBookUID)
            .getOrderIDCount();
        IPalindromeOrderBook(_orderBookUID).keepTrackOrderCreated(
            _token,
            msg.sender,
            _to,
            _orderID,
            _amount,
            _title
        );
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function sendBNBWithoutEscrow(
        address _token,
        address payable _to,
        address _orderBookUID,
        bytes32[2] memory _title,
        uint256 _deadline
    ) external payable override lock ensure(_deadline) {
        require(msg.sender != _to, "BPR::Now allowed send yourself");
        uint256 _amountInMinusFee = PalindromeLibrary.getAmountOut(msg.value);
        uint256 _orderID = IPalindromeOrderBook(_orderBookUID)
            .getOrderIDCount();
        _to.transfer(_amountInMinusFee);
        IPalindromeOrderBook(_orderBookUID).keepTrackOrderCreated(
            _token,
            msg.sender,
            _to,
            _orderID,
            msg.value,
            _title
        );
        emit Transfer(msg.sender, _to, msg.value);
    }

    function sendBNBToSellerWithEscrow(
        address _token,
        address _to,
        address _paymentSystemUID,
        uint256 _orderID,
        bytes32[2] memory _title,
        uint256 _deadline
    ) external payable override ensure(_deadline) {
        require(msg.sender != _to, "BPR::Not allowed to send yourself");
        IPalindromeSystem(_paymentSystemUID).mint(
            _token,
            msg.sender,
            _to,
            msg.value,
            _orderID,
            _title
        );
        IWETH(WETH).deposit{value: msg.value}();
        emit Deposit(msg.sender, msg.value);
        assert(IWETH(WETH).transfer(_paymentSystemUID, msg.value));
    }

    function withDrawCustomerBNB(
        address _seller,
        address _paymentSystemUID,
        address _orderBookUID,
        uint256 _orderID,
        uint256 _deadline
    ) external override ensure(_deadline) {
        require(msg.sender != address(0), "BPR::withDraw Addrress is zero");
        uint256 _orderAmount = IPalindromeOrderBook(_orderBookUID)
            .getOrderAmount(msg.sender, _orderID);
        bool success = IPalindromeSystem(_paymentSystemUID).burnCustomerBNB(
            _seller,
            msg.sender,
            _orderID,
            _orderAmount
        );
        require(success, "BPR::_withDrawCustomerBNB failed");
        emit Withdrawal(msg.sender, _orderAmount);
    }

    function withDrawSellerBNB(
        address _paymentSystemUID,
        address _orderBookUID,
        uint256 _orderID,
        uint256 _deadline
    ) external override ensure(_deadline) {
        require(msg.sender != address(0), "BPR::withDraw Addrress is zero");
        uint256 orderAmount = IPalindromeOrderBook(_orderBookUID)
            .getOrderAmount(msg.sender, _orderID);
        uint256 _orderAmount = PalindromeLibrary.getAmountOut(orderAmount);
        bool success = IPalindromeSystem(_paymentSystemUID).burnSellerBNB(
            msg.sender,
            _orderID,
            _orderAmount
        );
        require(success, "BPR::_withDrawSellerBNB failed");
        emit Withdrawal(msg.sender, _orderAmount);
    }

    function withDrawCustomer(
        address _token,
        address _seller,
        address _paymentSystemUID,
        address _orderBookUID,
        uint256 _orderID,
        uint256 _deadline
    ) external override ensure(_deadline) {
        require(msg.sender != address(0), "BPR::Addrress zero not allowed");
        uint256 _orderAmount = IPalindromeOrderBook(_orderBookUID)
            .getOrderAmount(msg.sender, _orderID);
        bool success = IPalindromeSystem(_paymentSystemUID).burnCustomer(
            _token,
            msg.sender,
            _seller,
            _orderID,
            _orderAmount
        );
        require(success, "BPR::_withDrawCustomer failed");
        emit Withdrawal(msg.sender, _orderAmount);
    }

    function withDrawSeller(
        address _token,
        address _paymentSystemUID,
        address _orderBookUID,
        uint256 _orderID,
        uint256 _deadline
    ) external override ensure(_deadline) {
        require(msg.sender != address(0), "BPR::withDraw Addrress is zero");
        uint256 _orderAmount = IPalindromeOrderBook(_orderBookUID)
            .getOrderAmount(msg.sender, _orderID);

        bool success = IPalindromeSystem(_paymentSystemUID).burnSeller(
            _token,
            msg.sender,
            _orderID,
            _orderAmount
        );
        require(success, "BPR::_withDrawSeller failed");
        emit Withdrawal(msg.sender, _orderAmount);
    }

    function createOrder(
        address _token,
        address _orderBookUID,
        address _to,
        uint256 _amount,
        bytes32[2] memory _title,
        uint256 _maturityTime
    ) external override {
        require(
            msg.sender != _to,
            "BPR::createOrder - Not allowed to send yourself"
        );
        bool orderAdded = IPalindromeOrderBook(_orderBookUID).createOrder(
            _token,
            msg.sender,
            _to,
            _amount,
            _title,
            _maturityTime
        );
        require(orderAdded, "BPR::Order not added");
    }

    function cancelOrder(address _orderBookUID, uint256 _orderID)
        external
        override
        returns (bool success)
    {
        success = IPalindromeOrderBook(_orderBookUID).cancelOrder(
            msg.sender,
            _orderID
        );
        require(success, "BPR::Could not set Status");
        return success;
    }

    function openDispute(address _orderBookUID, uint256 _orderID)
        external
        override
        returns (bool success)
    {
        success = IPalindromeOrderBook(_orderBookUID).openDispute(
            msg.sender,
            _orderID
        );
        require(success, "BPR::Could not set Status");
        return success;
    }

    function confirmReceiptTheCustomer(address _orderBookUID, uint256 _orderID)
        external
        override
        returns (bool success)
    {
        success = IPalindromeOrderBook(_orderBookUID).confirmReceiptTheCustomer(
                msg.sender,
                _orderID
            );
        require(success, "BPR::Could not set Status");
        return success;
    }

    function getOrderStatus(address _orderBookUID, uint256 _orderID)
        external
        view
        override
        returns (IPalindromeOrderBook.Status status)
    {
        status = IPalindromeOrderBook(_orderBookUID).getOrderStatus(
            msg.sender,
            _orderID
        );
        return status;
    }

    function setState(
        address _from,
        address _orderBookUID,
        uint256 _orderID,
        IPalindromeOrderBook.Status _state
    ) external returns (bool success) {
        success = IPalindromeOrderBook(_orderBookUID).setState(
            msg.sender,
            _from,
            _orderID,
            _state
        );
        require(success, "BPR::Could not set Status");
    }

    function withdraw() external {
        address feeTo = IPalindromeFactory(factory).feeTo();
        require(msg.sender == feeTo, "BPR: Only feeTo allowed");
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawToken(address _token, uint256 _amount) external {
        address feeTo = IPalindromeFactory(factory).feeTo();
        require(msg.sender == feeTo, "BPR: Only feeTo allowed");
        IERC20 tokenContract = IERC20(_token);
        tokenContract.safeTransfer(msg.sender, _amount);
    }

    function withDrawFeesBNB(
        address _paymentSystemUID,
        uint256 _feeAmount,
        uint256 _deadline
    ) external ensure(_deadline) {
        require(msg.sender != address(0), "BPR::withDrawFees Addrress is zero");
        _withDrawFeesBNB(_paymentSystemUID, _feeAmount);
    }

    function _withDrawFeesBNB(address _paymentSystemUID, uint256 _feeAmount)
        internal
    {
        bool success = IPalindromeSystem(_paymentSystemUID).burnFeesBNB(
            _feeAmount
        );
        require(success, "BPR::_withDrawFeesBNB");
    }

    function withDrawFees(
        address _token,
        address _paymentSystemUID,
        uint256 _feeAmount,
        uint256 _deadline
    ) external ensure(_deadline) {
        require(msg.sender != address(0), "BPR::withDrawFees Addrress is zero");
        address feeTo = IPalindromeFactory(factory).feeTo();
        require(msg.sender == feeTo, "BPR::withDrawFees Not owner");
        _withDrawFees(_token, _paymentSystemUID, _feeAmount);
    }

    function _withDrawFees(
        address _token,
        address _paymentSystemUID,
        uint256 _feeAmount
    ) internal {
        bool success = IPalindromeSystem(_paymentSystemUID).burnFees(
            _token,
            _feeAmount
        );
        require(success, "BPR::_withDrawFees failed");
    }
}
