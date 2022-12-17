import { ethers } from "ethers";
import { ContractConfig } from "../../../contractConfig";
import {
  calculateGasMargin,
  ISetOpenDisputeState,
} from "../../../shared/helper";
import Router from "../../../../artifacts/src/contracts/PalindromeRouter.sol/PalindromeRouter.json";

export class PalindromeAdmin {
  static ttl = 60 * 20;

  static setOpenDisputeState = async (args: ISetOpenDisputeState) => {
    if (
      args.from !== undefined &&
      args.orderBookUID !== undefined &&
      args.orderID !== undefined &&
      args.status !== undefined &&
      args.signer !== undefined
    ) {
      try {
        const routerContract = new ethers.Contract(
          ContractConfig.ROUTER_ADDRESS,
          Router.abi,
          args.signer
        );

        const argsPass = [
          args.from,
          args.orderBookUID,
          args.orderID,
          args.status,
        ];

        const gasLimit = await routerContract
          .connect(args.signer)
          .estimateGas.setState(...argsPass);

        const tx = await routerContract
          .connect(args.signer)
          .setState(...argsPass, {
            gasLimit: calculateGasMargin(gasLimit),
          });

        await tx.wait(1);
        return true;
      } catch (err: any) {
        console.log(err);
        return false;
      }
    } else {
      console.log("init: Params is undefined..");
      return false;
    }
  };
}
