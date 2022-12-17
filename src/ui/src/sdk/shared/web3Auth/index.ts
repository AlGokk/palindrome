import { ethers } from "ethers";
import { AuthInstances, IConnect } from "../helper";
import { ConnectToWalletConnect } from "../walletConnect";

declare var window: any;

const AVALANCHE_PARAMS_TEST = {
  chainId: "0xA869",
  chainName: "BNB TEST",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "BNB", // 2-6 characters long
    decimals: 18,
  },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
};
const AVALANCHE_PARAMS_PROD = {
  chainId: "0xA86A",
  chainName: "BNB C-Chain",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "BNB", // 2-6 characters long
    decimals: 18,
  },
  rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
};

const ETH_PARAMS_PROD = {
  chainId: "0x1",
  chainName: "Ethereum Mainnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH", // 2-6 characters long
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.infura.io/v3/"],
};

const BSC_PARAMS_PROD = {
  chainId: "0x38",
  chainName: "Smart Chain",
  nativeCurrency: {
    name: "Binance Smart Chain",
    symbol: "BSC", // 2-6 characters long
    decimals: 18,
  },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
};

export class Web3Auth {
  static account: any;
  static provider: any;
  static signer: any;

  static checkNetworks = async (chainId: any) => {
    switch (chainId) {
      case "43113":
      case "0xa869":
        await this.addNetworkBNBTest();
        break;
      // case "43114":
      // case "0xa86a":
      //   await this.addNetworkBNBProd();
      //   break;
      // case "0x1":
      //   await this.addNetworkETHProd();
      //   break;
      // case "56":
      // case "0x38":
      //   await this.addNetworkBSCProd();
      //   break;
      default:
        alert("Network not supported yet..Only BNB Fuji Testnetwork");
        await this.addNetworkBNBTest();
        break;
    }
  };
  //TEST NETWORK
  static addNetworkBNBTest = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA869" }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [AVALANCHE_PARAMS_TEST],
          });
        } catch (err: any) {
          console.log(err);
        }
      }
    }
  };

  static addNetworkBNBProd = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA86A" }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [AVALANCHE_PARAMS_PROD],
          });
        } catch (err: any) {
          console.log(err);
        }
      }
    }
  };
  static addNetworkETHProd = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ETH_PARAMS_PROD],
          });
        } catch (err: any) {
          console.log(err);
        }
      }
    }
  };
  static addNetworkBSCProd = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [BSC_PARAMS_PROD],
          });
        } catch (err: any) {
          console.log(err);
        }
      }
    }
  };

  static connectWalletConnect = async (opt: IConnect) => {
    try {
      const provider: any = await ConnectToWalletConnect(opt);
      this.account = provider.accounts[0];
      this.provider = new ethers.providers.Web3Provider(provider);
      this.signer = this.provider.getSigner();
      const auth = new AuthInstances(this.account, this.provider, this.signer);
      return auth;
    } catch (err: any) {
      console.log(err);
    }
  };

  static connectMetamask = async (chainId: number) => {
    if (typeof window !== "undefined") {
      try {
        await this.checkNetworks(chainId);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        this.account = accounts[0];
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        const auth = new AuthInstances(
          this.account,
          this.provider,
          this.signer
        );
        return auth;
      } catch (err: any) {
        console.log(err);
        if (err.code === -32002) {
          alert("Request already sent. Open your metamask..");
        }
      }
    }
  };
}
