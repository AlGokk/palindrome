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

// network.provider.send("hardhat_reset");
async function main() {
  let Token: any, token: any;
  let WETH: any, weth: any;
  let PalindromeRouter: any, palindromeRouter: any;
  let PalindromeFactory: any, palindromeFactory: any;
  let PalindromeERC20: any, palindromeERC20: any;
  let PalindromeLibrary: any, palindromeLibrary: any;
  const owner = { address: "0xE90482941F4344bC3583af88279b2fF06Ed19a95" };
  const feeTo = "0x5A87e71335b2Fdd0CAecc66a62FE75b751ce1249";
  const merchantID = "9955678";
  Token = await ethers.getContractFactory("TokenA");
  token = await Token.deploy();
  await token.deployed();

  WETH = await ethers.getContractFactory("WETH");
  weth = await WETH.deploy();
  await weth.deployed();

  PalindromeFactory = await ethers.getContractFactory("PalindromeFactory");
  palindromeFactory = await PalindromeFactory.deploy(feeTo, weth.address);
  await palindromeFactory.deployed();

  PalindromeERC20 = await ethers.getContractFactory("PalindromeERC20");
  palindromeERC20 = await PalindromeERC20.deploy();
  await palindromeERC20.deployed();

  PalindromeLibrary = await ethers.getContractFactory("PalindromeLibrary");
  palindromeLibrary = await PalindromeLibrary.deploy();
  await palindromeLibrary.deployed();

  PalindromeRouter = await ethers.getContractFactory("PalindromeRouter");
  palindromeRouter = await PalindromeRouter.deploy(
    palindromeFactory.address,
    weth.address
  );
  await palindromeRouter.deployed();

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
      palindromeFactory.address,
      owner.address,
      merchantID,
      INIT_HASH_PAYMENT_SYSTEM
    );

    const orderBookUID = await computeOrderBookAddress(
      palindromeFactory.address,
      owner.address, //msg.sender
      paymentSystemUID,
      INIT_HASH_ORDERBOOK
    );

    return [paymentSystemUID, orderBookUID];
  };

  const [paymentSystemUID, orderBookUID] = await generateUIDS();

  const tx = await palindromeRouter.createPaymentSystem();
  await tx.wait(1);

  console.log(`Factory deployed to ${palindromeFactory.address}`);
  console.log(`Router deployed to ${palindromeRouter.address}`);
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
