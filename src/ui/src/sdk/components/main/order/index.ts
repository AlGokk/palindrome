import { getAddress } from "@ethersproject/address";
import { ethers } from "ethers";
import { ContractConfig } from "../../../contractConfig";
import {
  toWei,
  calculateGasMargin,
  ICancel,
  IOpenDispute,
  IGetOrderStatus,
  IConfirmReceiptTheCustomer,
  ICreateOrderArgs,
  ICreateOrderArgsPass,
} from "../../../shared/helper";
import Router from "../../../../artifacts/src/contracts/PalindromeRouter.sol/PalindromeRouter.json";
import { IPFSClient } from "../../../components/ipfs";

export class PalindromeOrder {
  static ttl = 60 * 20;
  static preTestHash0 = ethers.utils.formatBytes32String(
    "bafybeie2bpl25wxuif2r6zlsq4l7"
  );
  static preTestHash1 = ethers.utils.formatBytes32String(
    "7h2jbldscr2yn3jz7iy4pqdd725fau"
  );

  static addDataIPFS = async (title: string, file?: any) => {
    const cid = await IPFSClient.storeData(title, file);
    return cid;
  };

  static getDataFromIPFS = async (cid: string) => {
    const jsonData = await IPFSClient.getStoredData(cid);
    return jsonData;
  };

  static createOrder = async (args: ICreateOrderArgs) => {
    if (
      args.token !== undefined &&
      args.orderBookUID !== undefined &&
      args.to !== undefined &&
      args.amount !== undefined &&
      args.title !== undefined &&
      args.signer !== undefined
    ) {
      try {
        console.log(args.token);
        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const title = [this.preTestHash0, this.preTestHash1];
        const maturityTime = args.maturityTime || 0;

        const argsPassPre = [
          args.token,
          args.orderBookUID,
          args.to,
          toWei(args.amount),
          title,
          maturityTime,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.createOrder(...argsPassPre);

        let firstData0: any, secondData1: any;
        const dataEncrypted = await this.addDataIPFS(args.title, args.file);
        if (dataEncrypted !== undefined) {
          firstData0 = dataEncrypted.toString().split("").slice(0, 31).join("");
          secondData1 = dataEncrypted.toString().split("").slice(31).join("");
        }

        const argsPass: ICreateOrderArgsPass = {
          token: getAddress(args.token),
          orderBookUID: getAddress(args.orderBookUID),
          to: getAddress(args.to),
          amount: toWei(args.amount),
          title: [
            ethers.utils.formatBytes32String(firstData0),
            ethers.utils.formatBytes32String(secondData1),
          ],
          maturityTime,
        };

        const argsPassPost = [
          argsPass.token,
          argsPass.orderBookUID,
          argsPass.to,
          argsPass.amount,
          argsPass.title,
          argsPass.maturityTime,
        ];

        const tx = await routerContract
          .connect(args.signer)
          .createOrder(...argsPassPost, {
            gasLimit: calculateGasMargin(gasLimit),
          });

        await tx.wait(1);
        return { status: true, tx: tx };
      } catch (e: any) {
        console.log(e);
        return { status: false, tx: "" };
      }
    }
  };

  static cancelOrder = async (args: ICancel) => {
    if (
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

        const argsPass = [args.orderBookUID, args.orderID];
        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.cancelOrder(...argsPass);

        const tx = await routerContract
          .connect(args.signer)
          .cancelOrder(...argsPass, {
            gasLimit: calculateGasMargin(gasLimit),
          });
        await tx.wait(1);
        return { status: true, tx: tx };
      } catch (e: any) {
        console.log(e);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Params is undefined..");
      return { status: false, tx: "" };
    }
  };

  static openDispute = async (args: IOpenDispute) => {
    if (
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

        const argsPass = [args.orderBookUID, args.orderID];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.openDispute(...argsPass);

        const tx = await routerContract
          .connect(args.signer)
          .openDispute(...argsPass, {
            gasLimit: calculateGasMargin(gasLimit),
          });
        await tx.wait(1);
        return { status: true, tx };
      } catch (e: any) {
        console.log(e);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Params is undefined..");
      return { status: false, tx: "" };
    }
  };

  static getOrderStatus = async (args: IGetOrderStatus) => {
    if (
      args.orderBookUID !== undefined &&
      args.orderID !== undefined &&
      args.provider !== undefined
    ) {
      const argsPass: any = [getAddress(args.orderBookUID), args.orderID];

      try {
        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.provider
        );

        const status = await routerContract
          .connect(args.provider)
          .getOrderStatus(...argsPass);

        return status;
      } catch (e: any) {
        return { status: false, tx: "" };
      }
    }
  };

  static confirmReceiptTheCustomer = async (
    args: IConfirmReceiptTheCustomer
  ) => {
    if (
      args.orderBookUID !== undefined &&
      args.orderID !== undefined &&
      args.signer !== undefined
    ) {
      if (args?.signer) {
        try {
          const routerContract = new ethers.Contract(
            ContractConfig.ROUTER_ADDRESS,
            Router.abi,
            args.signer
          );

          const gasLimit = await routerContract
            .connect(args.signer)
            .estimateGas.confirmReceiptTheCustomer(
              args.orderBookUID,
              args.orderID
            );

          const tx = await routerContract
            .connect(args.signer)
            .confirmReceiptTheCustomer(args.orderBookUID, args.orderID, {
              gasLimit: calculateGasMargin(gasLimit),
            });
          await tx.wait(1);
          return true;
        } catch (err: any) {
          console.log(err);
          return false;
        }
      } else {
        console.log("Not logged in..");
        return false;
      }
    } else {
      console.log("Params is undefined..");
      return false;
    }
  };
}
