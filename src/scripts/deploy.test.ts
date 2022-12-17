// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from "hardhat";
import { getCreate2Address } from "@ethersproject/address";
import { pack, keccak256 } from "@ethersproject/solidity";
import Merchant from "../ui/src/artifacts/src/contracts/PalindromeSystem.sol/PalindromeSystem.json";
import OrderBook from "../ui/src/artifacts/src/contracts/PalindromeOrderBook.sol/PalindromeOrderBook.json";

network.provider.send("hardhat_reset");
async function main() {
  let merchant0: any,
    merchant1: any,
    customer0: any,
    customer1: any,
    feeTo: any;
  let Token: any, token: any;
  let WETH: any, weth: any;
  let PalindromeRouter: any, palindromePayRouter: any;
  let PalindromeFactory: any, palindromePayFactory: any;
  let PalindromeERC20: any, palindromePayERC20: any;
  let PalindromeLibrary: any, palindromePayLibrary: any;

  [merchant0, merchant1, customer0, customer1, feeTo] =
    await ethers.getSigners();
  const merchantID = "455689";
  Token = await ethers.getContractFactory("TokenA");
  token = await Token.deploy();
  await token.deployed();

  WETH = await ethers.getContractFactory("WETH");
  weth = await WETH.deploy();
  await weth.deployed();

  PalindromeFactory = await ethers.getContractFactory("PalindromeFactory");
  palindromePayFactory = await PalindromeFactory.deploy(
    feeTo.address,
    weth.address
  );
  await palindromePayFactory.deployed();

  PalindromeERC20 = await ethers.getContractFactory("PalindromeERC20");
  palindromePayERC20 = await PalindromeERC20.deploy();
  await palindromePayERC20.deployed();

  PalindromeLibrary = await ethers.getContractFactory("PalindromeLibrary");
  palindromePayLibrary = await PalindromeLibrary.deploy();
  await palindromePayLibrary.deployed();

  PalindromeRouter = await ethers.getContractFactory("PalindromeRouter");
  palindromePayRouter = await PalindromeRouter.deploy(
    palindromePayFactory.address,
    weth.address
  );
  await palindromePayRouter.deployed();

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

  const generateUIDS = async () => {
    const INIT_HASH_PAYMENT_SYSTEM = keccak256(["bytes"], [Merchant.bytecode]);
    const INIT_HASH_ORDERBOOK = keccak256(["bytes"], [OrderBook.bytecode]);

    const paymentSystemUID = await computeMerchantAddress(
      palindromePayFactory.address,
      merchant0.address,
      "455689",
      INIT_HASH_PAYMENT_SYSTEM
    );

    const orderBookUID = await computeOrderBookAddress(
      palindromePayFactory.address,
      merchant0.address, //msg.sender
      paymentSystemUID,
      INIT_HASH_ORDERBOOK
    );

    return [paymentSystemUID, orderBookUID];
  };

  const [paymentSystemUID, orderBookUID] = await generateUIDS();

  const tx = await palindromePayRouter.createPaymentSystem(
    merchant0.address,
    merchantID
  );
  await tx.wait(1);

  console.log(`Factory deployed to ${palindromePayFactory.address}`);
  console.log(`Router deployed to ${palindromePayRouter.address}`);
  console.log(`Token deployed to ${token.address}`);
  console.log(`PaymentUID is ${paymentSystemUID}`);
  console.log(`OrderUID is ${orderBookUID}`);
  console.log(`WETH is ${weth.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
