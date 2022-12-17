import { ethers } from "ethers";
import { ContractConfig } from "../../../contractConfig";
import {
  calculateGasMargin,
  IGetPaymentDetails,
  IInit,
} from "../../../shared/helper";
import Router from "../../../../artifacts/src/contracts/PalindromeRouter.sol/PalindromeRouter.json";
import Factory from "../../../../artifacts/src/contracts/PalindromeFactory.sol/PalindromeFactory.json";

export class PalindromeCreatePayment {
  static ttl = 60 * 20;
  static defaultAddress = "0x0000000000000000000000000000000000000000";

  static init = async (args: IInit) => {
    if (args.signer !== undefined) {
      if (args.signer) {
        try {
          const routerContract = new ethers.Contract(
            ContractConfig.ROUTER_ADDRESS,
            Router.abi,
            args.signer
          );

          const gasLimit = await routerContract
            .connect(args.signer)
            .estimateGas.createPaymentSystem();

          const tx = await routerContract
            .connect(args.signer)
            .createPaymentSystem({
              gasLimit: calculateGasMargin(gasLimit),
            });

          await tx.wait(1);
          return true;
        } catch (err: any) {
          console.log(err);
          return false;
        }
      } else {
        console.log("init: Not logged in..");
        return false;
      }
    } else {
      console.log("init: Params is undefined..");
      return false;
    }
  };

  static getPaymentDetails = async (args: any) => {
    if (args.signer) {
      try {
        const factoryContract = new ethers.Contract(
          ContractConfig.FACTORY_ADDRESS,
          Factory.abi,
          args.signer
        );

        const { paymentSystemUID, orderBookUID } = await factoryContract
          .connect(args.signer)
          .getPaymentDetails();

        if (
          paymentSystemUID !== this.defaultAddress &&
          orderBookUID !== this.defaultAddress
        ) {
          return new IGetPaymentDetails(paymentSystemUID, orderBookUID);
        } else {
          return new IGetPaymentDetails(
            this.defaultAddress,
            this.defaultAddress
          );
        }
      } catch (err: any) {
        console.log(err);
        return new IGetPaymentDetails(this.defaultAddress, this.defaultAddress);
      }
    } else {
      console.log("init: Not logged in..");
      return new IGetPaymentDetails(this.defaultAddress, this.defaultAddress);
    }
  };
}
