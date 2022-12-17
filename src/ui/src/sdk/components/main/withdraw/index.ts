import { ethers } from "ethers";
import Router from "../../../../artifacts/src/contracts/PalindromeRouter.sol/PalindromeRouter.json";
import { ContractConfig } from "../../../contractConfig";
import {
  IWithDrawSeller,
  calculateGasMargin,
  IWithDrawCustomer,
} from "../../../shared/helper";

export class PalindromeWithdraw {
  static ttl = 60 * 20;

  static start = async () => {
    console.log("Start Palindrome");
  };

  static withDrawSeller = async (args: IWithDrawSeller) => {
    const deadline = Math.floor(Date.now() / 1000) + this.ttl;
    if (
      args.paymentSystemUID !== undefined &&
      args.orderBookUID !== undefined &&
      args.orderID !== undefined &&
      args.signer !== undefined
    ) {
      try {
        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsPass = [
          args.paymentSystemUID,
          args.orderBookUID,
          args.orderID,
          deadline,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.withDrawSeller(...argsPass);

        const tx = await routerContract
          .connect(args.signer)
          .withDrawSeller(...argsPass, {
            gasLimit: calculateGasMargin(gasLimit),
          });
        await tx.wait(1);
        return { status: true, tx: tx };
      } catch (err: any) {
        console.log(err);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Params are undefined..");
      return { status: false, tx: "" };
    }
  };

  static withDrawCustomer = async (args: IWithDrawCustomer) => {
    const deadline = Math.floor(Date.now() / 1000) + this.ttl;
    if (
      args.seller !== undefined &&
      args.paymentSystemUID !== undefined &&
      args.orderBookUID !== undefined &&
      args.orderID !== undefined &&
      args.signer !== undefined
    ) {
      try {
        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsPass = [
          args.paymentSystemUID,
          args.orderBookUID,
          args.orderID,
          deadline,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.withDrawCustomer(...argsPass);

        const tx = await routerContract
          .connect(args.signer)
          .withDrawCustomer(...argsPass, {
            gasLimit: calculateGasMargin(gasLimit),
          });
        await tx.wait(1);
        return { status: true, tx: tx };
      } catch (err: any) {
        console.log(err);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Params are undefined..");
      return { status: false, tx: "" };
    }
  };

  static withDrawSellerBNB = async (args: IWithDrawSeller) => {
    const deadline = Math.floor(Date.now() / 1000) + this.ttl;
    if (
      args.paymentSystemUID !== undefined &&
      args.orderBookUID !== undefined &&
      args.orderID !== undefined &&
      args.signer !== undefined
    ) {
      try {
        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsPass = [
          args.paymentSystemUID,
          args.orderBookUID,
          args.orderID,
          deadline,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.withDrawSellerBNB(...argsPass);

        const tx = await routerContract
          .connect(args.signer)
          .withDrawSellerBNB(...argsPass, {
            gasLimit: calculateGasMargin(gasLimit),
          });
        await tx.wait(1);
        return { status: true, tx: tx };
      } catch (err: any) {
        console.log(err);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Params are undefined..");
      return { status: false, tx: "" };
    }
  };

  static withDrawCustomerBNB = async (args: IWithDrawCustomer) => {
    const deadline = Math.floor(Date.now() / 1000) + this.ttl;
    if (
      args.seller !== undefined &&
      args.paymentSystemUID !== undefined &&
      args.orderBookUID !== undefined &&
      args.orderID !== undefined &&
      args.signer !== undefined
    ) {
      try {
        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsPass = [
          args.seller,
          args.paymentSystemUID,
          args.orderBookUID,
          args.orderID,
          deadline,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.withDrawCustomerBNB(...argsPass);

        const tx = await routerContract
          .connect(args.signer)
          .withDrawCustomerBNB(...argsPass, {
            gasLimit: calculateGasMargin(gasLimit),
          });
        await tx.wait(1);
        return { status: true, tx: tx };
      } catch (err: any) {
        console.log(err);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Params are undefined..");
      return { status: false, tx: "" };
    }
  };
}
