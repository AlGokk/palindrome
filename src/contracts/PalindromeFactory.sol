//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./interfaces/IPalindromeFactory.sol";
import "./interfaces/IPalindromeSystem.sol";
import "./PalindromeSystem.sol";
import "./PalindromeOrderBook.sol";

contract PalindromeFactory is IPalindromeFactory {
    address public override feeTo;
    address public immutable WETH;
    address public override mediator;
    address public feeToSetter;
    uint256 private _paymentID = 9955678;

    bytes32 public constant override initCodeHashMerchant =
        keccak256(abi.encodePacked(type(PalindromeSystem).creationCode));

    bytes32 public constant override initCodeHashOrderBook =
        keccak256(abi.encodePacked(type(PalindromeOrderBook).creationCode));
    mapping(address => mapping(uint256 => address)) public getPaymentSystem;
    mapping(address => address) public override getOrderBook;
    uint256 public countMerchants = 0;

    event PaymentSystemCreated(
        address indexed _paymentSystemOwner,
        address indexed _paymentSystemUID,
        uint256
    );

    event OrderBookCreated(
        address indexed _paymentSystemOwner,
        address indexed _paymentSystemUID,
        address orderBookUID
    );

    constructor(address _feeTo, address _WETH) {
        feeTo = _feeTo;
        WETH = _WETH;
        mediator = msg.sender;
        feeToSetter = msg.sender;
    }

    function createPaymentSystem(address paymentSystemOwner)
        public
        override
        returns (address paymentSystemUID, address orderBookUID)
    {
        // CREATE MERCHANT
        bytes memory bytecodeMerchant = type(PalindromeSystem).creationCode;
        bytes32 saltPayment = keccak256(
            abi.encodePacked(paymentSystemOwner, _paymentID)
        );
        assembly {
            paymentSystemUID := create2(
                0,
                add(bytecodeMerchant, 32),
                mload(bytecodeMerchant),
                saltPayment
            )
        }
        require(
            paymentSystemUID != address(0) &&
                getOrderBook[paymentSystemOwner] == address(0),
            "BPF::Order already exists!"
        );

        getPaymentSystem[paymentSystemOwner][_paymentID] = address(
            paymentSystemUID
        );

        countMerchants += 1;
        require(
            getOrderBook[paymentSystemOwner] == address(0),
            "BPF::OrderBook already exists!"
        );
        (orderBookUID) = createOrderBook(paymentSystemOwner, paymentSystemUID); //create order book
        emit PaymentSystemCreated(
            paymentSystemOwner,
            paymentSystemUID,
            countMerchants
        );
    }

    function createOrderBook(
        address _paymentSystemOwner,
        address paymentSystemUID
    ) internal returns (address orderBookUID) {
        require(
            _paymentSystemOwner != address(0),
            "BPF::createMerchant ZERO_ADDRESS"
        );

        // CREATE OrderBook
        bytes memory bytecodeOrderBook = type(PalindromeOrderBook).creationCode;
        bytes32 saltOrderBook = keccak256(
            abi.encodePacked(_paymentSystemOwner, paymentSystemUID)
        );
        assembly {
            orderBookUID := create2(
                0,
                add(bytecodeOrderBook, 32),
                mload(bytecodeOrderBook),
                saltOrderBook
            )
        }
        IPalindromeSystem(paymentSystemUID).initializePaymentSystem(
            paymentSystemUID,
            WETH,
            orderBookUID,
            msg.sender,
            mediator,
            feeTo
        );

        IPalindromeOrderBook(orderBookUID).initializeOrderBook(
            paymentSystemUID,
            mediator
        );

        getOrderBook[_paymentSystemOwner] = address(orderBookUID);

        emit OrderBookCreated(
            _paymentSystemOwner,
            paymentSystemUID,
            orderBookUID
        );
    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeToSetter, "BPF::setFeeTo FORBIDDEN");
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external override {
        require(msg.sender == feeToSetter, "BPF::setFeeToSetter FORBIDDEN");
        feeToSetter = _feeToSetter;
    }

    function setMediator(address _mediator) external override {
        require(msg.sender == _mediator, "BPF::setMediator FORBIDDEN");
        mediator = _mediator;
    }

    function getPaymentDetails()
        external
        view
        override
        returns (address paymentSystemUID, address orderBookUID)
    {
        if (getPaymentSystem[msg.sender][_paymentID] != address(0)) {
            (paymentSystemUID) = getPaymentSystem[msg.sender][_paymentID];
            (orderBookUID) = getOrderBook[msg.sender];
        } else {
            (paymentSystemUID) = address(0);
            (orderBookUID) = address(0);
        }
    }
}
