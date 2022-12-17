import { ethers } from "ethers";
import { getAddress } from "@ethersproject/address";
import Router from "../../../../artifacts/src/contracts/PalindromeRouter.sol/PalindromeRouter.json";
import ERC20 from "../../../../artifacts/src/contracts/ERC20.sol/ERC20.json";
import { IPFSClient } from "../../../components/ipfs";
import { ContractConfig } from "../../../contractConfig";
import {
  calculateGasMargin,
  ISendBNBToSellerWithEscrow,
  ISendBNBToSellerWithEscrowPass,
  ISentDirect,
  ISendTokenToSellerWithEscrow,
  ISendTokenWithoutEscrow,
  toWei,
  ISentDirectBNBPass,
  ISentDirectTokenPass,
} from "../../../shared/helper";

export class PalindromeSend {
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

  static sendTokenToSellerWithEscrow = async (
    args: ISendTokenToSellerWithEscrow
  ) => {
    console.log("sendTokenToSellerWithEscrow...");
    if (
      args.token !== undefined &&
      args.to !== undefined &&
      args.paymentSystemUID !== undefined &&
      args.amount !== undefined &&
      args.title !== undefined &&
      args.signer !== undefined
    ) {
      try {
        const deadline = Math.floor(Date.now() / 1000) + this.ttl;

        const token = new ethers.Contract(args.token, ERC20.abi, args.signer);

        const gasLimitApprove = await token
          .connect(args.signer)
          .estimateGas.approve(
            ContractConfig.ROUTER_ADDRESS,
            toWei(args.amount)
          );

        const tx0 = await token.approve(
          ContractConfig.ROUTER_ADDRESS,
          toWei(args.amount),
          {
            gasLimit: calculateGasMargin(gasLimitApprove),
          }
        );
        await tx0.wait(1);

        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsSendPre = [
          args.token,
          args.to,
          args.paymentSystemUID,
          toWei(args.amount),
          [this.preTestHash0, this.preTestHash1],
          deadline,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.sendTokenToSellerWithEscrow(...argsSendPre);

        let firstData0: any, secondData1: any;
        let argsPass: any;
        if (args.title !== "") {
          const dataEncrypted = await this.addDataIPFS(args.title);
          if (dataEncrypted !== undefined) {
            firstData0 = dataEncrypted
              .toString()
              .split("")
              .slice(0, 31)
              .join("");
            secondData1 = dataEncrypted.toString().split("").slice(31).join("");
          }

          argsPass = {
            token: getAddress(args.token),
            to: getAddress(args.to),
            paymentSystemUID: getAddress(args.paymentSystemUID),
            amount: toWei(args.amount),
            title: [
              ethers.utils.formatBytes32String(firstData0),
              ethers.utils.formatBytes32String(secondData1),
            ],
          };
        } else {
          argsPass = {
            token: getAddress(args.token),
            to: getAddress(args.to),
            paymentSystemUID: getAddress(args.paymentSystemUID),
            amount: toWei(args.amount),
            title: [
              ethers.utils.formatBytes32String(""),
              ethers.utils.formatBytes32String(""),
            ],
          };
        }

        const argsSendPost = [
          argsPass.token,
          argsPass.to,
          argsPass.paymentSystemUID,
          argsPass.amount,
          argsPass.title,
          deadline,
        ];

        const tx1 = await routerContract
          .connect(args.signer)
          .sendTokenToSellerWithEscrow(...argsSendPost, {
            gasLimit: calculateGasMargin(gasLimit),
          });
        await tx1.wait(1);
        return { status: true, tx: tx1 };
      } catch (err: any) {
        console.log(err);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Not logged in - params are undefined");
      return { status: false, tx: "" };
    }
  };

  static sendBNBToSellerWithEscrow = async (
    args: ISendBNBToSellerWithEscrow
  ) => {
    if (
      args.token !== undefined &&
      args.to !== undefined &&
      args.paymentSystemUID !== undefined &&
      args.orderID !== undefined &&
      args.amount !== undefined &&
      args.title !== undefined &&
      args.signer !== undefined
    ) {
      try {
        const deadline = Math.floor(Date.now() / 1000) + this.ttl;

        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsSendPre = [
          getAddress(args.token),
          args.to,
          args.paymentSystemUID,
          args.orderID,
          [this.preTestHash0, this.preTestHash1],
          deadline,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.sendBNBToSellerWithEscrow(...argsSendPre, {
            value: toWei(args.amount),
          });

        let firstData0: any, secondData1: any;
        let argsPass: ISendBNBToSellerWithEscrowPass;
        if (args.title !== "") {
          const dataEncrypted = await this.addDataIPFS(args.title);
          if (dataEncrypted !== undefined) {
            firstData0 = dataEncrypted
              .toString()
              .split("")
              .slice(0, 31)
              .join("");
            secondData1 = dataEncrypted.toString().split("").slice(31).join("");
          }

          argsPass = {
            token: getAddress(args.token),
            to: getAddress(args.to),
            paymentSystemUID: getAddress(args.paymentSystemUID),
            title: [
              ethers.utils.formatBytes32String(firstData0),
              ethers.utils.formatBytes32String(secondData1),
            ],
          };
        } else {
          argsPass = {
            token: getAddress(args.token),
            to: getAddress(args.to),
            paymentSystemUID: getAddress(args.paymentSystemUID),
            title: [
              ethers.utils.formatBytes32String(""),
              ethers.utils.formatBytes32String(""),
            ],
          };
        }

        const argsSendPost = [
          argsPass.token,
          argsPass.to,
          argsPass.paymentSystemUID,
          args.orderID,
          argsPass.title,
          deadline,
        ];

        const tx1 = await routerContract
          .connect(args.signer)
          .sendBNBToSellerWithEscrow(...argsSendPost, {
            value: toWei(args.amount),
            gasLimit: calculateGasMargin(gasLimit),
          });
        await tx1.wait(1);
        return { status: true, tx: tx1 };
      } catch (err: any) {
        console.log(err);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Not logged in - params are undefined");
      return { status: true, tx: "" };
    }
  };

  static sendTokenWithoutEscrow = async (args: ISendTokenWithoutEscrow) => {
    if (
      args.token !== undefined &&
      args.to !== undefined &&
      args.orderBookUID !== undefined &&
      args.amount !== undefined &&
      args.title !== undefined &&
      args.signer !== undefined
    ) {
      try {
        console.log("sendTokenWithoutEscrow..");
        const deadline = Math.floor(Date.now() / 1000) + this.ttl;

        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsSendPre = [
          args.token,
          args.to,
          args.orderBookUID,
          toWei(args.amount),
          [this.preTestHash0, this.preTestHash1],
          deadline,
        ];

        const token = new ethers.Contract(args.token, ERC20.abi, args.signer);

        const gasLimitApprove = await token
          .connect(args.signer)
          .estimateGas.approve(
            ContractConfig.ROUTER_ADDRESS,
            toWei(args.amount)
          );

        const tx0 = await token.approve(
          ContractConfig.ROUTER_ADDRESS,
          toWei(args.amount),
          {
            gasLimit: calculateGasMargin(gasLimitApprove),
          }
        );
        await tx0.wait(1);

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.sendTokenWithoutEscrow(...argsSendPre);

        let firstData0: any, secondData1: any;
        let argsPass: ISentDirectTokenPass;
        if (args.title !== "") {
          const dataEncrypted = await this.addDataIPFS(args.title);
          if (dataEncrypted !== undefined) {
            firstData0 = dataEncrypted
              .toString()
              .split("")
              .slice(0, 31)
              .join("");
            secondData1 = dataEncrypted.toString().split("").slice(31).join("");
          }
          argsPass = {
            token: getAddress(args.token),
            to: getAddress(args.to),
            orderBookUID: getAddress(args.orderBookUID),
            amount: toWei(args.amount),
            title: [
              ethers.utils.formatBytes32String(firstData0),
              ethers.utils.formatBytes32String(secondData1),
            ],
          };
        } else {
          argsPass = {
            token: getAddress(args.token),
            to: getAddress(args.to),
            orderBookUID: getAddress(args.orderBookUID),
            amount: toWei(args.amount),
            title: [
              ethers.utils.formatBytes32String(""),
              ethers.utils.formatBytes32String(""),
            ],
          };
        }

        const argsSendPost = [
          argsPass.token,
          argsPass.to,
          argsPass.orderBookUID,
          argsPass.amount,
          argsPass.title,
          deadline,
        ];

        const tx1 = await routerContract
          .connect(args.signer)
          .sendTokenWithoutEscrow(...argsSendPost, {
            gasLimit: calculateGasMargin(gasLimit),
          });

        await tx1.wait(1);
        return { status: true, tx: tx1 };
      } catch (err: any) {
        console.log(err);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Not logged in - params are undefined");
      return { status: true, tx: "" };
    }
  };

  static sendBNBToSellerWithoutEscrow = async (args: ISentDirect) => {
    if (
      args.token !== undefined &&
      args.to !== undefined &&
      args.orderBookUID !== undefined &&
      args.amount !== undefined &&
      args.title !== undefined &&
      args.signer !== undefined
    ) {
      try {
        console.log("sendBNBToSellerWithoutEscrow..");
        const deadline = Math.floor(Date.now() / 1000) + this.ttl;

        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsSendPre = [
          args.token,
          args.to,
          args.orderBookUID,
          [this.preTestHash0, this.preTestHash1],
          deadline,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.sendBNBWithoutEscrow(...argsSendPre, {
            value: toWei(args.amount),
          });

        let firstData0: any, secondData1: any;
        let argsPass: ISentDirectBNBPass;
        if (args.title !== "") {
          const dataEncrypted = await this.addDataIPFS(args.title);
          if (dataEncrypted !== undefined) {
            firstData0 = dataEncrypted
              .toString()
              .split("")
              .slice(0, 31)
              .join("");
            secondData1 = dataEncrypted.toString().split("").slice(31).join("");
          }
          argsPass = {
            token: getAddress(args.token),
            to: getAddress(args.to),
            orderBookUID: getAddress(args.orderBookUID),
            title: [
              ethers.utils.formatBytes32String(firstData0),
              ethers.utils.formatBytes32String(secondData1),
            ],
          };
        } else {
          argsPass = {
            token: getAddress(args.token),
            to: getAddress(args.to),
            orderBookUID: getAddress(args.orderBookUID),
            title: [
              ethers.utils.formatBytes32String(""),
              ethers.utils.formatBytes32String(""),
            ],
          };
        }

        const argsSendPost = [
          argsPass.token,
          argsPass.to,
          argsPass.orderBookUID,
          argsPass.title,
          deadline,
        ];

        const tx1 = await routerContract
          .connect(args.signer)
          .sendBNBWithoutEscrow(...argsSendPost, {
            value: toWei(args.amount),
            gasLimit: calculateGasMargin(gasLimit),
          });

        await tx1.wait(1);
        return { status: true, tx: tx1 };
      } catch (err: any) {
        console.log(err);
        return { status: false, tx: "" };
      }
    } else {
      console.log("Not logged in - params are undefined");
      return { status: true, tx: "" };
    }
  };
}
