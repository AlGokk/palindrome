import WalletConnectProvider from "@walletconnect/web3-provider";

interface IWalletConnectConnectorOptions {
  infuraId?: string;
  rpc?: { [chainId: number]: string };
  chainId: number;
  bridge?: string;
  qrcode?: boolean;
  qrcodeModalOptions?: { mobileLinks?: string[] };
}

export const ConnectToWalletConnect = async (
  opts: IWalletConnectConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    let bridge = "https://bridge.walletconnect.org";
    let qrcode = true;
    let infuraId = "";
    let rpc = undefined;
    let chainId = 1;
    let qrcodeModalOptions = undefined;

    if (opts) {
      bridge = opts.bridge || bridge;
      qrcode = true;
      infuraId = opts.infuraId || "";
      rpc = opts.rpc || undefined;
      chainId = opts.chainId;
      qrcodeModalOptions = {
        mobileLinks: ["metamask", "trust"],
      };
    }

    const provider = new WalletConnectProvider({
      bridge,
      qrcode,
      infuraId,
      rpc,
      chainId,
      qrcodeModalOptions,
    });
    try {
      await provider.enable();
      resolve(provider);
    } catch (e) {
      reject(e);
    }
  });
};
