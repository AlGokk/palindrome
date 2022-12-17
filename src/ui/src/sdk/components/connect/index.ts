import { IConnect } from "../../shared/helper";
import { Web3Auth } from "../../shared/web3Auth";

export class PalindromeConnect {
  static connectWalletConnect = async (opt: IConnect) => {
    const auth: any = await Web3Auth.connectWalletConnect(opt);
    return auth;
  };
  static connectMetamask = async (opt: IConnect) => {
    const auth: any = await Web3Auth.connectMetamask(opt.chainId);
    return auth;
  };
}
