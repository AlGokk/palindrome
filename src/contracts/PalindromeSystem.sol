// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./PalindromeERC20.sol";
import "./interfaces/IPalindromeOrderBook.sol";
import "./interfaces/IPalindromeSystem.sol";
import "./interfaces/IPalindromeFactory.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IWETH.sol";
import "./libraries/TransferHelper.sol";
import "./libraries/PalindromeLibrary.sol";
import "./SafeERC20.sol";

contract PalindromeSystem is PalindromeERC20 {
    using SafeERC20 for IERC20;
    address public immutable factory;
    address public paymentSystemOwner;
    address public paymentSystemUID;
    address public WETH;
    address public orderBookUID;
    address public mediator;
    address public feeTo;
    bool public paymentSystemActive = true;
    uint256 private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "BPS:lock LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    modifier onlySeller(address _from, uint256 _orderID) {
        IPalindromeOrderBook.Order memory order = IPalindromeOrderBook(
            orderBookUID
        ).getOrderData(_from, _orderID);
        require(order.seller == _from, "BPS::Only Seller allowed");
        _;
    }

    constructor() {
        factory = msg.sender;
    }

    receive() external payable {
        assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    event Burn(
        address indexed _to,
        uint256 _orderAmount,
        uint256 indexed _orderID
    );

    event Mint(
        address indexed _to,
        uint256 _orderAmount,
        uint256 indexed _orderID
    );

    event PaymentSystemInitialised(
        address indexed _paymentSystemUID,
        address indexed orderBookUID,
        address paymentSystemOwner
    );

    function initializePaymentSystem(
        address _paymentSystemUID,
        address _WETH,
        address _orderUID,
        address _mediator,
        address _paymentSystemOwner,
        address _feeTo
    ) external {
        require(msg.sender == factory, "BPS::initialize FORBIDDEN");
        require(
            _paymentSystemUID != address(0),
            "BPS::_paymentSystemUID address is 0"
        );
        require(_WETH != address(0), "BPS::_WETH address is 0");
        require(_orderUID != address(0), "BPS::_orderUID address is 0");
        require(
            _paymentSystemOwner != address(0),
            "BPS::_paymentSystemOwner address is 0"
        );
        require(_feeTo != address(0), "BPS::_feeTo address is 0");
        require(_mediator != address(0), "BPS::_mediator address is 0");
        paymentSystemUID = _paymentSystemUID;
        WETH = _WETH;
        orderBookUID = _orderUID;
        mediator = _mediator;
        paymentSystemOwner = _paymentSystemOwner;
        feeTo = _feeTo;
        emit PaymentSystemInitialised(
            address(this),
            orderBookUID,
            paymentSystemOwner
        );
    }

    function mintFee(uint256 feeAmount) private {
        require(feeAmount > 0, "BPS::mintFee FEE AMOUNT IS 0");
        _mint(feeTo, feeAmount);
    }

    function mint(
        address _token,
        address _from,
        address _to,
        uint256 _amountIn,
        uint256 _orderID,
        bytes32[2] memory _title
    ) external lock {
        address usedToken = IPalindromeOrderBook(orderBookUID).getOrderToken(
            _from,
            _orderID
        );
        require(_token == usedToken, "BPS::mint wrong token");
        uint256 _amountInMinusFee = PalindromeLibrary.getAmountOut(_amountIn);
        uint256 _fee = _amountIn - _amountInMinusFee;
        _mint(_to, _amountInMinusFee);
        emit Mint(_to, _amountInMinusFee, _orderID);
        mintFee(_fee);
        bool success = IPalindromeOrderBook(orderBookUID).updateOrCreateOrder(
            _token,
            _to,
            _from,
            _amountIn,
            _orderID,
            _title,
            IPalindromeOrderBook.Status.Paid
        );
        require(success, "BPS::updateOrder failed");
    }

    function burnCustomer(
        address _token,
        address _customer,
        address _seller,
        uint256 _orderID,
        uint256 _orderAmount
    ) external lock returns (bool) {
        IERC20 token = IERC20(_token);
        IPalindromeOrderBook.Order memory order = IPalindromeOrderBook(
            orderBookUID
        ).getOrderData(_customer, _orderID);
        require(order.customer == _customer, "BPS::Only Customer allowed");
        require(
            order.status == IPalindromeOrderBook.Status.CanceledOpenDispute,
            "BPS::OrderState Not expected status"
        );
        _burn(_seller, _orderAmount);
        emit Burn(_seller, _orderAmount, _orderID);
        bool successDO = IPalindromeOrderBook(orderBookUID).deleteOrder(
            _customer,
            _orderID,
            IPalindromeOrderBook.Status.Completed
        );
        require(successDO, "BPS::burnCustomer failed");
        token.safeTransfer(_customer, _orderAmount);
        return true;
    }

    function burnCustomerBNB(
        address _seller,
        address _customer,
        uint256 _orderID,
        uint256 _orderAmount
    ) external lock returns (bool) {
        IPalindromeOrderBook.Order memory order = IPalindromeOrderBook(
            orderBookUID
        ).getOrderData(_customer, _orderID);
        require(order.customer == _customer, "BPS::Only Customer allowed");
        require(
            order.status == IPalindromeOrderBook.Status.CanceledOpenDispute,
            "BPS::burnCustomerBNB - Not expected status"
        );
        _burn(_seller, _orderAmount);
        emit Burn(_seller, _orderAmount, _orderID);
        bool successDO = IPalindromeOrderBook(orderBookUID).deleteOrder(
            _customer,
            _orderID,
            IPalindromeOrderBook.Status.Completed
        );
        require(successDO, "BPS::burnCustomerBNB failed");
        IWETH(WETH).withdraw(_orderAmount);
        TransferHelper.safeTransferETH(_customer, _orderAmount);
        return true;
    }

    function burnSeller(
        address _token,
        address _from,
        uint256 _orderID,
        uint256 _orderAmount
    ) external lock onlySeller(_from, _orderID) returns (bool) {
        IERC20 token = IERC20(_token);
        IPalindromeOrderBook.Order memory order = IPalindromeOrderBook(
            orderBookUID
        ).getOrderData(_from, _orderID);
        require(
            ((order.status == IPalindromeOrderBook.Status.Paid) &&
                (block.timestamp >= order.openingTime &&
                    order.closingTime <= block.timestamp)) ||
                (order.status == IPalindromeOrderBook.Status.Delivered) ||
                (order.status ==
                    IPalindromeOrderBook.Status.CompletedOpenDispute),
            "BPS::burnSeller - Not expected status or time"
        );
        _burn(_from, _orderAmount);
        emit Burn(_from, _orderAmount, _orderID);
        bool successDO = IPalindromeOrderBook(orderBookUID).deleteOrder(
            _from,
            _orderID,
            IPalindromeOrderBook.Status.Completed
        );
        require(successDO, "BPS::burnSeller failed");
        token.safeTransfer(_from, _orderAmount);
        return true;
    }

    function burnSellerBNB(
        address _from,
        uint256 _orderID,
        uint256 _orderAmount
    ) external onlySeller(_from, _orderID) lock returns (bool status) {
        IPalindromeOrderBook.Order memory order = IPalindromeOrderBook(
            orderBookUID
        ).getOrderData(_from, _orderID);
        require(
            ((order.status == IPalindromeOrderBook.Status.Paid) &&
                (block.timestamp >= order.openingTime &&
                    order.closingTime <= block.timestamp)) ||
                (order.status == IPalindromeOrderBook.Status.Delivered) ||
                (order.status ==
                    IPalindromeOrderBook.Status.CompletedOpenDispute),
            "BPS::burnSellerBNB - Not expected status or time"
        );
        _burn(_from, _orderAmount);
        emit Burn(_from, _orderAmount, _orderID);
        bool successDO = IPalindromeOrderBook(orderBookUID).deleteOrder(
            _from,
            _orderID,
            IPalindromeOrderBook.Status.Completed
        );
        require(successDO, "BPS::burnSellerBNB failed");
        IWETH(WETH).withdraw(_orderAmount);
        TransferHelper.safeTransferETH(_from, _orderAmount);
        return true;
    }

    function burnFees(address _token, uint256 _feeAmount)
        external
        lock
        returns (bool)
    {
        _burn(feeTo, _feeAmount);
        IERC20 token = IERC20(_token);
        token.safeTransfer(feeTo, _feeAmount);
        return true;
    }

    function burnFeesBNB(uint256 _feeAmount) external lock returns (bool) {
        _burn(feeTo, _feeAmount);
        IWETH(WETH).withdraw(_feeAmount);
        TransferHelper.safeTransferETH(feeTo, _feeAmount);
        return true;
    }
}
