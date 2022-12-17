import { ethers, waffle } from "hardhat";
import { constants } from "ethers";
import { expect } from "chai";
import { getCreate2Address } from "@ethersproject/address";
import { pack, keccak256 } from "@ethersproject/solidity";
import Merchant from "../ui/src/artifacts/src/contracts/PalindromeSystem.sol/PalindromeSystem.json";
import OrderBook from "../ui/src/artifacts/src/contracts/PalindromeOrderBook.sol/PalindromeOrderBook.json";
import moment from "moment";

const toWei = (value: any) => ethers.utils.parseEther(value.toString());
const getBalance = ethers.provider.getBalance;
const fromWei = (value: any) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );

const getChecksum = (addr: any) => {
  return ethers.utils.getAddress(addr);
};

let paymentSystemOwner: any,
  seller0: any,
  seller1: any,
  customer0: any,
  customer1: any,
  feeTo: any;
let Token: any, token: any;
let WETH: any, weth: any;
let PalindromeRouter: any, PalindromeRouter: any;
let PalindromeFactory: any, PalindromeFactory: any;
let PalindromeERC20: any, PalindromeERC20: any;
let PalindromeLibrary: any, PalindromeLibrary: any;

let provider: any;
let initCodeHashMerchant: any;

const overrides = {
  gasLimit: 9999999,
};

enum Status {
  InProgress,
  Paid,
  Delivered,
  Completed,
  Canceled,
  OpenDispute,
  CanceledOpenDispute,
  CompletedOpenDispute,
}
const ttl = 60 * 20;

const delay = (milisec: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, milisec);
  });
};
let paymentSystemUID: any;
let orderBookUID: any;
const paymentSystemID: string = "9955678"; // process.env.PAYMENTSYSTEM_ID
const generateUIDS = async () => {
  const INIT_HASH_PAYMENT_SYSTEM = keccak256(["bytes"], [Merchant.bytecode]);
  const INIT_HASH_ORDERBOOK = keccak256(["bytes"], [OrderBook.bytecode]);

  const paymentSystemUID = await computeMerchantAddress(
    PalindromeFactory.address,
    paymentSystemOwner.address,
    paymentSystemID,
    INIT_HASH_PAYMENT_SYSTEM
  );

  const orderBookUID = await computeOrderBookAddress(
    PalindromeFactory.address,
    paymentSystemOwner.address, //msg.sender
    paymentSystemUID,
    INIT_HASH_ORDERBOOK
  );

  return [paymentSystemUID, orderBookUID];
};

before(async () => {
  [paymentSystemOwner, seller0, seller1, customer0, customer1, feeTo] =
    await ethers.getSigners();
  provider = waffle.provider;
  Token = await ethers.getContractFactory("TokenA");
  token = await Token.deploy();
  await token.deployed();

  WETH = await ethers.getContractFactory("WETH");
  weth = await WETH.deploy();
  await weth.deployed();

  PalindromeFactory = await ethers.getContractFactory("PalindromeFactory");
  PalindromeFactory = await PalindromeFactory.deploy(
    feeTo.address,
    weth.address
  );
  await PalindromeFactory.deployed();

  PalindromeERC20 = await ethers.getContractFactory("PalindromeERC20");
  PalindromeERC20 = await PalindromeERC20.deploy();
  await PalindromeERC20.deployed();

  PalindromeLibrary = await ethers.getContractFactory("PalindromeLibrary");
  PalindromeLibrary = await PalindromeLibrary.deploy();
  await PalindromeLibrary.deployed();

  PalindromeRouter = await ethers.getContractFactory("PalindromeRouter");
  PalindromeRouter = await PalindromeRouter.deploy(
    PalindromeFactory.address,
    weth.address
  );
  await PalindromeRouter.deployed();

  [paymentSystemUID, orderBookUID] = await generateUIDS();

  console.log("********************************************************");
  console.log(`Router deployed to ${PalindromeRouter.address}`);
  console.log(`Token deployed to ${token.address}`);
  console.log(`PaymentSytemUID is ${paymentSystemUID}`);
  console.log(`OrderBookUID is  ${orderBookUID}`);
  console.log(`PaymentSytemID is ${paymentSystemUID}`);
  console.log("********************************************************");
});

async function computeMerchantAddress(
  factoryAddress: any,
  paymentSystemOwner: any,
  paymentSystemID: any,
  initHash: any
) {
  return getCreate2Address(
    factoryAddress,
    keccak256(
      ["bytes"],
      [pack(["address", "uint256"], [paymentSystemOwner, paymentSystemID])]
    ),
    initHash
  );
}

async function computeOrderBookAddress(
  factoryAddress: any,
  paymentSystemOwner: any,
  paymentUID: any,
  initHash: any
) {
  return getCreate2Address(
    factoryAddress,
    keccak256(
      ["bytes"],
      [pack(["address", "address"], [paymentSystemOwner, paymentUID])]
    ),
    initHash
  );
}

/**
 *
 * First Customer0
 */
describe("Should create Payment System", async () => {
  it("Should check initCodeHashMerchant", async () => {
    const COMPUTED_INIT_CODE_HASH = keccak256(["bytes"], [Merchant.bytecode]);
    initCodeHashMerchant = await PalindromeFactory.initCodeHashMerchant();
    expect(initCodeHashMerchant).eq(COMPUTED_INIT_CODE_HASH);
  });

  it("Should check initCodeHashMerchant with PalindromeLibrary", async () => {
    const initHash_Library = await PalindromeLibrary.getInitHashMerchant();
    initCodeHashMerchant = await PalindromeFactory.initCodeHashMerchant();
    console.log(`ìnitHash: ${initCodeHashMerchant}`);
    expect(initCodeHashMerchant).eq(initHash_Library);
  });

  it("should check before creating payment", async () => {
    const { paymentSystemUID, orderBookUID } =
      await PalindromeFactory.getPaymentDetails();

    console.log("------------------------------");
    console.log(paymentSystemUID, orderBookUID);
    console.log("------------------------------");
  });

  it("Should createPaymentSystem & compare calculatedMerchantAdress & merchantAddress", async () => {
    await PalindromeRouter.createPaymentSystem();
    const initCodeHashMerchant = await PalindromeFactory.initCodeHashMerchant();

    const { paymentSystemUID, orderBookUID } =
      await PalindromeFactory.getPaymentDetails();

    const calcMerchantUID = await computeMerchantAddress(
      PalindromeFactory.address,
      paymentSystemOwner.address,
      paymentSystemID,
      initCodeHashMerchant
    );
    expect(paymentSystemUID).eq(calcMerchantUID);
  });

  it("Should comparing calculatedOrderBookAdress & orderBookAddress", async () => {
    const initCodeHashOrderBook =
      await PalindromeFactory.initCodeHashOrderBook();
    const orderBookAddress = await PalindromeFactory.getOrderBook(
      paymentSystemOwner.address
    );

    const orderBookUID = await computeOrderBookAddress(
      PalindromeFactory.address,
      paymentSystemOwner.address,
      paymentSystemUID,
      initCodeHashOrderBook
    );

    expect(orderBookAddress).eq(orderBookUID);
  });
});

describe("check account balances and addresses", async () => {
  // Customer0
  it("Should check token balance & address of customer0", async () => {
    const balance = await token.balanceOf(customer0.address);
    expect(balance).eq(toWei(50));
    expect(customer0.address).eq(
      getChecksum("0x90f79bf6eb2c4f870365e785982e1f101e93b906")
    );
  });

  // seller0
  it("Should check token balance & address of seller0", async () => {
    const balance = await token.balanceOf(seller0.address);
    expect(balance).eq(toWei(50));
    expect(seller0.address).eq(
      getChecksum("0x70997970c51812dc3a010c7d01b50e0d17dc79c8")
    );
  });
});

/**
 *  _mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 50 ether); // seller0
    _mint(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 50 ether); // seller1
    _mint(0x90F79bf6EB2c4f870365E785982E1f101E93b906, 50 ether); // customre0
    _mint(0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65, 50 ether); // customer 1
 */

describe("Should create first order", async () => {
  const order0 = "0";
  const orderName = "First order";
  const deadline = Math.floor(Date.now() / 1000) + ttl;

  it("should add first order - seller0", async () => {
    const maturityTime = 2;
    const title = [
      ethers.utils.formatBytes32String(orderName),
      ethers.utils.formatBytes32String(orderName),
    ];
    const args = [
      token.address,
      orderBookUID,
      customer0.address, // customer need to pay
      toWei(5),
      title,
      maturityTime,
    ];

    await PalindromeRouter.connect(seller0).createOrder(...args);
  });
  it("should check of orders is ceated - seller0 & customer0", async () => {
    // Seller
    const orderStatusSeller = await PalindromeRouter.connect(
      seller0
    ).getOrderStatus(orderBookUID, order0);
    // Customer
    const orderStatusCustomer = await PalindromeRouter.connect(
      customer0
    ).getOrderStatus(orderBookUID, order0);

    expect(orderStatusSeller).eq(Status.InProgress);
    expect(orderStatusCustomer).eq(Status.InProgress);
  });
  it("should pay the added order - customer0", async () => {
    await token
      .connect(customer0)
      .approve(PalindromeRouter.address, constants.MaxUint256);

    const args2 = [
      token.address,
      seller0.address, // receiver can be withdrawn if condition met
      paymentSystemUID, // sends token to contract
      toWei(5),
      order0,
      [
        ethers.utils.formatBytes32String(orderName),
        ethers.utils.formatBytes32String(orderName),
      ],
      deadline,
    ];
    await PalindromeRouter.connect(customer0).sendTokenToSellerWithEscrow(
      ...args2
    );
  });

  it("should check of order is updated - seller0/customer0", async () => {
    // Seller
    const orderStatusSeller = await PalindromeRouter.connect(
      seller0
    ).getOrderStatus(orderBookUID, order0);
    // Customer
    const orderStatusCustomer = await PalindromeRouter.connect(
      customer0
    ).getOrderStatus(orderBookUID, order0);

    expect(orderStatusSeller).eq(Status.Paid);
    expect(orderStatusCustomer).eq(Status.Paid);
  });

  it("should try withdraw token - seller0", async () => {
    const args = [
      token.address,
      paymentSystemUID,
      orderBookUID,
      order0,
      deadline,
    ];
    expect(
      PalindromeRouter.connect(customer0).withDrawSeller(...args)
    ).to.be.revertedWith("BPS::Only Seller allowed");
  });

  it("Should check balance of paymentSystemUID contract BEFORE withdraw - owner", async () => {
    const PaymentContract = new ethers.Contract(
      paymentSystemUID,
      Merchant.abi,
      ethers.provider
    );
    const tokenBalance = await token.balanceOf(PaymentContract.address);
    expect(tokenBalance).eq(toWei(5));
  });

  it("Should check balance of seller0 BEFORE withdraw - owner", async () => {
    const tokenBalance = await token.balanceOf(seller0.address);
    expect(tokenBalance).eq(toWei(50));
  });

  it("should withdraw token - seller0", async () => {
    const args = [
      token.address,
      paymentSystemUID,
      orderBookUID,
      order0,
      deadline,
    ];

    await expect(
      PalindromeRouter.connect(seller0).withDrawSeller(...args)
    ).to.be.revertedWith("BPS::burnSeller - Not expected status or time");
  });

  it("Should check balance of paymentSystemUID", async () => {
    const PaymentContract = new ethers.Contract(
      paymentSystemUID,
      Merchant.abi,
      ethers.provider
    );
    const tokenBalance = await token.balanceOf(PaymentContract.address);
    expect(tokenBalance).eq(toWei(5));
  });
});

describe("Should create second order", async () => {
  const order0 = "1";
  const orderName = "Second order";
  const deadline = Math.floor(Date.now() / 1000) + ttl;

  it("should add second order - seller1", async () => {
    const maturityTime = moment().add(1, "minutes").unix();
    const args = [
      token.address,
      orderBookUID,
      customer1.address, // customer need to pay
      toWei(5),
      [
        ethers.utils.formatBytes32String(orderName),
        ethers.utils.formatBytes32String(orderName),
      ],
      maturityTime,
    ];
    await PalindromeRouter.connect(seller1).createOrder(...args);
  });

  it("should createOrder - seller1", async () => {
    const maturityTime = moment().add(1, "minutes").unix();
    const args = [
      token.address,
      orderBookUID,
      customer1.address, // customer need to pay
      toWei(5),
      [
        ethers.utils.formatBytes32String(orderName),
        ethers.utils.formatBytes32String(orderName),
      ],
      maturityTime,
    ];

    await PalindromeRouter.connect(seller1).createOrder(...args);
  });

  it("should withdraw token - seller1", async () => {
    const args = [
      token.address,
      paymentSystemUID,
      orderBookUID,
      order0,
      deadline,
    ];
    await expect(
      PalindromeRouter.connect(seller1).withDrawSeller(...args)
    ).to.be.revertedWith("BPS::burnSeller - Not expected status");
  });

  it("should try to confirmReceiptTheCustomer - customer1", async () => {
    const args = [orderBookUID, order0];

    await expect(
      PalindromeRouter.connect(customer1).confirmReceiptTheCustomer(...args)
    ).to.be.revertedWith("BPOB::onlyExpectedState - Not expected status");
  });

  it("should setState - owner", async () => {
    const args = [seller1.address, orderBookUID, order0, Status.Paid];

    await PalindromeRouter.connect(paymentSystemOwner).setState(...args);
  });

  it("should try to confirmReceiptTheCustomer - customer1", async () => {
    const args = [orderBookUID, order0];
    await PalindromeRouter.connect(customer1).confirmReceiptTheCustomer(
      ...args
    );
  });
});

describe("Should create first order BNB", async () => {
  const order0 = "3";
  const orderName = "First order BNB";
  const deadline = Math.floor(Date.now() / 1000) + ttl;

  it("should add first order avax without maturity time - seller0", async () => {
    const maturityTime = 0;
    const title = [
      ethers.utils.formatBytes32String(orderName),
      ethers.utils.formatBytes32String(orderName),
    ];
    const args = [
      weth.address,
      orderBookUID,
      customer0.address, // customer need to pay
      toWei(5),
      title,
      maturityTime,
    ];

    await PalindromeRouter.connect(seller0).createOrder(...args);
  });
  it("should check of orders is ceated - seller0 & customer0", async () => {
    // Seller
    const orderStatusSeller = await PalindromeRouter.connect(
      seller0
    ).getOrderStatus(orderBookUID, order0);
    // Customer
    const orderStatusCustomer = await PalindromeRouter.connect(
      customer0
    ).getOrderStatus(orderBookUID, order0);
    expect(orderStatusSeller).eq(Status.InProgress);
    expect(orderStatusCustomer).eq(Status.InProgress);
  });
  it("should pay the added order with avax - customer0", async () => {
    await token
      .connect(customer0)
      .approve(PalindromeRouter.address, constants.MaxUint256);

    const args2 = [
      weth.address,
      seller0.address, // receiver can be withdrawn if condition met
      paymentSystemUID, // sends token to contract
      order0,
      [
        ethers.utils.formatBytes32String(orderName),
        ethers.utils.formatBytes32String(orderName),
      ],
      deadline,
    ];
    await PalindromeRouter.connect(customer0).sendBNBToSellerWithEscrow(
      ...args2,
      {
        value: toWei(5),
      }
    );
  });
  it("should pay the added order with avax wrong token - customer0", async () => {
    await token
      .connect(customer0)
      .approve(PalindromeRouter.address, constants.MaxUint256);

    const args2 = [
      token.address,
      seller0.address, // receiver can be withdrawn if condition met
      paymentSystemUID, // sends token to contract
      order0,
      [
        ethers.utils.formatBytes32String(orderName),
        ethers.utils.formatBytes32String(orderName),
      ],
      deadline,
    ];
    await expect(
      PalindromeRouter.connect(customer0).sendBNBToSellerWithEscrow(...args2, {
        value: toWei(5),
      })
    ).revertedWith("BPS::mint wrong token");
  });

  it("should check of order is updated - seller0/customer0", async () => {
    // Seller
    const orderStatusSeller = await PalindromeRouter.connect(
      seller0
    ).getOrderStatus(orderBookUID, order0);
    // Customer
    const orderStatusCustomer = await PalindromeRouter.connect(
      customer0
    ).getOrderStatus(orderBookUID, order0);

    expect(orderStatusSeller).eq(Status.Paid);
    expect(orderStatusCustomer).eq(Status.Paid);
  });

  it("should try withdraw token - seller0", async () => {
    const args = [paymentSystemUID, orderBookUID, order0, deadline];
    await expect(
      PalindromeRouter.connect(customer0).withDrawSellerBNB(...args)
    ).to.be.revertedWith("BPS::Only Seller allowed");
  });

  it("Should check balance of paymentSystemUID contract BEFORE withdraw - owner", async () => {
    const PaymentContract = new ethers.Contract(
      paymentSystemUID,
      Merchant.abi,
      ethers.provider
    );
    const tokenBalance = await weth.balanceOf(PaymentContract.address);
    expect(tokenBalance).eq(toWei(5));
  });

  it("Should check balance of seller0 BEFORE withdraw - owner", async () => {
    const tokenBalance = await weth.balanceOf(seller0.address);
    expect(tokenBalance).eq(toWei(0));
  });

  it("Should check balance of paymentSystemUID before withdraw", async () => {
    const PaymentContract = new ethers.Contract(
      paymentSystemUID,
      Merchant.abi,
      ethers.provider
    );
    const tokenBalance = await weth.balanceOf(PaymentContract.address);
    expect(tokenBalance).eq(toWei(5));
  });

  it("Should check balance of customer0 before withdraw", async () => {
    const tokenBalance = await getBalance(seller0.address);
    expect(Number.parseFloat(fromWei(tokenBalance)).toFixed(3)).eq("9999.999");
  });

  it("should confirm receipt", async () => {
    const args = [orderBookUID, order0];

    await expect(
      PalindromeRouter.connect(seller0).confirmReceiptTheCustomer(...args)
    ).to.be.revertedWith(
      "BPO::confirmReceiptTheCustomer only customer allowed"
    );

    await PalindromeRouter.connect(customer0).confirmReceiptTheCustomer(
      ...args
    );
  });

  it("should TRY withdraw avax customer0 ", async () => {
    const args = [paymentSystemUID, orderBookUID, order0, deadline];
    await expect(
      PalindromeRouter.connect(customer0).withDrawSellerBNB(...args)
    ).to.be.revertedWith("BPS::Only Seller allowed");
  });

  it("should withdraw avax seller0 ", async () => {
    const args = [paymentSystemUID, orderBookUID, order0, deadline];

    await PalindromeRouter.connect(seller0).withDrawSellerBNB(...args);
  });

  it("Should check balance of paymentSystemUID after withdraw", async () => {
    const PaymentContract = new ethers.Contract(
      paymentSystemUID,
      Merchant.abi,
      ethers.provider
    );
    const tokenBalance = await weth.balanceOf(PaymentContract.address);
    //These are only the rest fees
    expect(tokenBalance).eq(toWei(0.05));
  });

  it("Should check balance of seller0 after withdraw", async () => {
    console.log(seller0.address, customer0.address);
    const tokenBalance = await getBalance(seller0.address);
    console.log(Number.parseFloat(fromWei(tokenBalance)).toFixed(3));
    expect(Number.parseFloat(fromWei(tokenBalance)).toFixed(3)).eq("10004.949");
  });
});
describe("Should create second order BNB", async () => {
  const order0 = "4";
  const orderName = "Second order BNB";
  const deadline = Math.floor(Date.now() / 1000) + ttl;

  it("should add first order avax without maturity time - seller0", async () => {
    const maturityTime = 0;
    const title = [
      ethers.utils.formatBytes32String(orderName),
      ethers.utils.formatBytes32String(orderName),
    ];
    const args = [
      weth.address,
      orderBookUID,
      customer0.address, // customer need to pay
      toWei(5),
      title,
      maturityTime,
    ];

    await PalindromeRouter.connect(seller0).createOrder(...args);
  });
  it("should check of orders is ceated - seller0 & customer0", async () => {
    // Seller
    const orderStatusSeller = await PalindromeRouter.connect(
      seller0
    ).getOrderStatus(orderBookUID, order0);
    // Customer
    const orderStatusCustomer = await PalindromeRouter.connect(
      customer0
    ).getOrderStatus(orderBookUID, order0);
    expect(orderStatusSeller).eq(Status.InProgress);
    expect(orderStatusCustomer).eq(Status.InProgress);
  });
  it("should cancel order - customer0", async () => {
    const args2 = [orderBookUID, order0];
    await PalindromeRouter.connect(customer0).cancelOrder(...args2);
  });

  it("should check of orders is ceated - seller0 & customer0", async () => {
    // Seller
    const orderStatusSeller = await PalindromeRouter.connect(
      seller0
    ).getOrderStatus(orderBookUID, order0);
    // Customer
    const orderStatusCustomer = await PalindromeRouter.connect(
      customer0
    ).getOrderStatus(orderBookUID, order0);

    expect(orderStatusSeller).eq(Status.Canceled);
    expect(orderStatusCustomer).eq(Status.Canceled);
  });
});

describe("Should create third order BNB", async () => {
  const order0 = "5";
  const orderName = "First order BNB";
  const deadline = Math.floor(Date.now() / 1000) + ttl;

  it("should add first order avax without maturity time - seller0", async () => {
    const maturityTime = 0;
    const title = [
      ethers.utils.formatBytes32String(orderName),
      ethers.utils.formatBytes32String(orderName),
    ];
    const args = [
      weth.address,
      orderBookUID,
      customer0.address, // customer need to pay
      toWei(5),
      title,
      maturityTime,
    ];

    await PalindromeRouter.connect(seller0).createOrder(...args);
  });

  it("should check of orders is ceated - seller0 & customer0", async () => {
    // Seller
    const orderStatusSeller = await PalindromeRouter.connect(
      seller0
    ).getOrderStatus(orderBookUID, order0);
    // Customer
    const orderStatusCustomer = await PalindromeRouter.connect(
      customer0
    ).getOrderStatus(orderBookUID, order0);

    expect(orderStatusSeller).eq(Status.InProgress);
    expect(orderStatusCustomer).eq(Status.InProgress);
  });
  it("should pay the added order with avax - customer0", async () => {
    await token
      .connect(customer0)
      .approve(PalindromeRouter.address, constants.MaxUint256);

    const args2 = [
      weth.address,
      seller0.address, // receiver can be withdrawn if condition met
      paymentSystemUID, // sends token to contract
      order0,
      [
        ethers.utils.formatBytes32String(orderName),
        ethers.utils.formatBytes32String(orderName),
      ],
      deadline,
    ];
    await PalindromeRouter.connect(customer0).sendBNBToSellerWithEscrow(
      ...args2,
      {
        value: toWei(5),
      }
    );
  });

  it("should setState - owner", async () => {
    const args = [seller0.address, orderBookUID, order0, Status.Paid];

    await PalindromeRouter.connect(paymentSystemOwner).setState(...args);
    const status = await PalindromeRouter.connect(customer0).getOrderStatus(
      orderBookUID,
      order0
    );
    expect(status).eq(Status.Paid);
  });

  it("should openDispute customer0", async () => {
    const args = [orderBookUID, order0];
    await PalindromeRouter.connect(customer0).openDispute(...args);
    const status = await PalindromeRouter.connect(customer0).getOrderStatus(
      orderBookUID,
      order0
    );
    expect(status).eq(Status.OpenDispute);
  });

  it("should try withdraw avax - seller0", async () => {
    const args = [paymentSystemUID, orderBookUID, order0, deadline];
    await expect(
      PalindromeRouter.connect(seller0).withDrawSellerBNB(...args)
    ).to.be.revertedWith("BPS::burnSellerBNB - Not expected status or time");
  });

  it("should setState - owner", async () => {
    const args = [
      seller0.address,
      orderBookUID,
      order0,
      Status.CanceledOpenDispute,
    ];

    await PalindromeRouter.connect(paymentSystemOwner).setState(...args);
  });

  it("should try withdraw avax - customer0", async () => {
    const args = [paymentSystemUID, orderBookUID, order0, deadline];
    await expect(
      PalindromeRouter.connect(seller0).withDrawSellerBNB(...args)
    ).to.be.revertedWith("BPS::burnSellerBNB - Not expected status or time");
  });

  it("should try withdraw avax - customer0", async () => {
    const args = [
      seller0.address,
      paymentSystemUID,
      orderBookUID,
      order0,
      deadline,
    ];
    await PalindromeRouter.connect(customer0).withDrawCustomerBNB(...args);
  });
});
describe("Should create fourth order BNB", async () => {
  const order0 = "6";
  const orderName = "Fourth order BNB";
  const deadline = Math.floor(Date.now() / 1000) + ttl;

  it("should add fourth order avax without maturity time - seller0", async () => {
    const maturityTime = 0;
    const title = [
      ethers.utils.formatBytes32String(orderName),
      ethers.utils.formatBytes32String(orderName),
    ];
    const args = [
      weth.address,
      orderBookUID,
      customer0.address, // customer need to pay
      toWei(5),
      title,
      maturityTime,
    ];

    await PalindromeRouter.connect(seller0).createOrder(...args);
  });
  it("should check of orders is ceated - seller0 & customer0", async () => {
    // Seller
    const orderStatusSeller = await PalindromeRouter.connect(
      seller0
    ).getOrderStatus(orderBookUID, order0);
    // Customer
    const orderStatusCustomer = await PalindromeRouter.connect(
      customer0
    ).getOrderStatus(orderBookUID, order0);

    expect(orderStatusSeller).eq(Status.InProgress);
    expect(orderStatusCustomer).eq(Status.InProgress);
  });
  it("should pay the added order with avax - customer0", async () => {
    await token
      .connect(customer0)
      .approve(PalindromeRouter.address, constants.MaxUint256);

    const args2 = [
      weth.address,
      seller0.address, // receiver can be withdrawn if condition met
      paymentSystemUID, // sends token to contract
      order0,
      [
        ethers.utils.formatBytes32String(orderName),
        ethers.utils.formatBytes32String(orderName),
      ],
      deadline,
    ];
    await PalindromeRouter.connect(customer0).sendBNBToSellerWithEscrow(
      ...args2,
      {
        value: toWei(5),
      }
    );
  });

  it("should setState - owner", async () => {
    const args = [seller0.address, orderBookUID, order0, Status.Paid];

    await PalindromeRouter.connect(paymentSystemOwner).setState(...args);
    const status = await PalindromeRouter.connect(customer0).getOrderStatus(
      orderBookUID,
      order0
    );
    expect(status).eq(Status.Paid);
  });

  it("should openDispute customer0", async () => {
    const args = [orderBookUID, order0];
    await PalindromeRouter.connect(customer0).openDispute(...args);
    const status = await PalindromeRouter.connect(customer0).getOrderStatus(
      orderBookUID,
      order0
    );
    expect(status).eq(Status.OpenDispute);
  });

  it("should try withdraw avax - seller0", async () => {
    const args = [paymentSystemUID, orderBookUID, order0, deadline];
    await expect(
      PalindromeRouter.connect(seller0).withDrawSellerBNB(...args)
    ).to.be.revertedWith("BPS::burnSellerBNB - Not expected status or time");
  });

  it("should setState - owner", async () => {
    const args = [
      seller0.address,
      orderBookUID,
      order0,
      Status.CompletedOpenDispute,
    ];

    await PalindromeRouter.connect(paymentSystemOwner).setState(...args);
  });

  it("should try withdraw avax - customer0", async () => {
    const args = [
      seller0.address,
      paymentSystemUID,
      orderBookUID,
      order0,
      deadline,
    ];
    await expect(
      PalindromeRouter.connect(customer0).withDrawCustomerBNB(...args)
    ).to.be.revertedWith("BPS::burnCustomerBNB - Not expected status");
  });

  it("should try withdraw avax - customer0", async () => {
    const args = [paymentSystemUID, orderBookUID, order0, deadline];
    await PalindromeRouter.connect(seller0).withDrawSellerBNB(...args);
  });
});
