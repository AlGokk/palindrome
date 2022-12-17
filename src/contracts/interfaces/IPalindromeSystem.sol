// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./IPalindromeOrderBook.sol";

interface IPalindromeSystem {
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Transfer(address indexed from, address indexed to, uint256 value);

    function name() external pure returns (string memory);

    function symbol() external pure returns (string memory);

    function decimals() external pure returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    function PERMIT_TYPEHASH() external pure returns (bytes32);

    function nonces(address owner) external view returns (uint256);

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function factory() external view returns (address);

    function WETH() external view returns (address);

    function token() external view returns (address);

    function paymentSystemOwner() external view returns (address);

    function paymentSystemUID() external view returns (address);

    function orderBookUID() external view returns (address);

    function paymentSystemActive() external view returns (bool);

    function initializePaymentSystem(
        address _paymentSystemUID,
        address _WETH,
        address _orderUID,
        address _mediator,
        address _paymentSystemOwner,
        address _feeTo
    ) external;

    function mint(
        address _token,
        address _from,
        address _to,
        uint256 _amountIn,
        uint256 _orderID,
        bytes32[2] memory _title
    ) external;

    function burnCustomer(
        address _token,
        address _customer,
        address _seller,
        uint256 _orderID,
        uint256 _orderAmount
    ) external returns (bool);

    function burnCustomerBNB(
        address _customer,
        address _seller,
        uint256 _orderID,
        uint256 _orderAmount
    ) external returns (bool);

    function burnSeller(
        address _token,
        address _from,
        uint256 _orderID,
        uint256 _orderAmount
    ) external returns (bool);

    function burnSellerBNB(
        address _from,
        uint256 _orderID,
        uint256 _orderAmount
    ) external returns (bool status);

    function burnFees(address _token, uint256 _feeAmount)
        external
        returns (bool);

    function burnFeesBNB(uint256 _feeAmount) external returns (bool);

    function setPaymentSystemState(address _from, bool _state)
        external
        returns (bool);
}
