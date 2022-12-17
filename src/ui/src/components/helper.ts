import { BigNumber, ethers } from "ethers";
import { IPFSClient } from "./../sdk/components/ipfs";
import ERC20 from "../artifacts/src/contracts/ERC20.sol/ERC20.json";

export enum Status {
  InProgress,
  Paid,
  Delivered,
  Completed,
  Canceled,
  OpenDispute,
  CanceledOpenDispute,
  CompletedOpenDispute,
}

export interface ITx {
  hash: string;
}

export interface IStatus {
  status: boolean;
  tx: ITx;
}

export interface ITokenData {
  id: number;
  address: string;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
}

export interface ISendTokenToSellerWithEscrow {
  token: string;
  to: string;
  paymentSystemUID: string;
  amount: string | BigNumber;
  orderID: string;
  title: string;
  signer: any;
}

export interface ISendBNBToSellerWithEscrow {
  token: string;
  to: string;
  paymentSystemUID: string;
  orderID: string;
  amount: string | BigNumber;
  title: string;
  signer: any;
}

export interface IConnect {
  rpc?: { [chainId: number]: string };
  chainId: number;
}

export interface IAuthInstance {
  account: string;
  provider: any;
  signer: any;
}

export interface IInit {
  signer: any;
}

export interface ISentDirect {
  token: string;
  to: string;
  orderBookUID: string;
  amount: string;
  title: [string, string];
  signer: any;
}

export interface ISetOpenDisputeState {
  from: string;
  orderBookUID: string;
  orderID: string;
  status: number;
  signer: any;
}

export type IAddOrderMongo = {
  paymentSystemUID: string;
  orderBookUID: string;
  title: string;
  from: string;
  to: string;
  amount: string;
  selectedToken: string;
  currency: string;
  status: number;
  maturityTime: number;
};

export interface IAddOrder {
  token: string;
  orderBookUID: string;
  to: string;
  amount: BigNumber;
  title: string;
  status: number;
  maturityTime: number;
  signer: any;
}

export interface IWithDrawSeller {
  paymentSystemUID: string;
  orderBookUID: string;
  orderID: string;
  signer: any;
}

export interface IWithDrawCustomer {
  seller: string;
  paymentSystemUID: string;
  orderBookUID: string;
  orderID: string;
  signer: any;
}

export interface IConfirmShipmentFromMerchant {
  merchantID: string;
  status: number;
}

export interface IConfirmReceiptTheCustomer {
  orderBookUID: string;
  orderID: string;
  signer: any;
}

export interface IGetTransactions {
  maxPageNumber: number;
  allTransactions: any[];
  transactions: any[];
  cards: Object;
}

export class GetTransactions {
  constructor(
    public readonly maxPageNumber: number,
    public readonly allTransactions: any[],
    public readonly transactions: any[],
    public readonly cards: any[]
  ) {}
}
export class GetAllData {
  constructor(
    public readonly maxPageNumber: number,
    public readonly allTransactions: any[],
    public readonly transactions: any[],
    public readonly cards: any[]
  ) {}

  length = () => {
    if (this.transactions.length) {
      return true;
    }
    return false;
  };
}

export class AuthInstances {
  constructor(
    public readonly account: string,
    public readonly provider: any,
    public readonly signer: any
  ) {}
}

export class ConnectionInstance {
  constructor(
    public readonly status: boolean,
    public readonly auth?: IAuthInstance
  ) {}
}

export const calculateGasMargin = (value: BigNumber) => {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
};

export const toWei = (value: any) => ethers.utils.parseEther(value.toString());
export const fromWei = (value: any) => {
  return ethers.utils.formatUnits(
    typeof value === "string" ? value : value.toString()
  );
};
export const getAddress = (account: string) => {
  return ethers.utils.getAddress(account);
};

export class Activity {
  constructor(
    public id: string,
    public title: string,
    public paymentInfo: string,
    public file: any,
    public fileType: string,
    public from: string,
    public to: string,
    public shortenAddressFrom: string,
    public shortenAddressTo: string,
    public href: string,
    public amount: string,
    public token: string,
    public currency: string,
    public status: number,
    public withDrawdate: string,
    public isPayment: boolean,
    public maturityTime?: number
  ) {}
}

export interface IActivity {
  _txHash: string;
  _title0: string;
  _title1: string;
  _from: string;
  _to: string;
  _orderID: string;
  _status: any;
  _token: string;
  _amount: BigNumber;
  _closeTime: string;
}
export type ICreateOrder = {
  recipient: string;
  title: string;
  amount: BigNumber;
  selectedToken: string;
  maturityTime: number;
  file: Object;
};

export type ICreateOrderArgs = {
  token: string;
  orderBookUID: string;
  to: string;
  amount: string | BigNumber;
  title: string;
  maturityTime?: number;
  file?: any;
  signer: any;
};

export type ISendDirect = {
  recipient: string;
  title: string;
  amount: BigNumber;
  selectedToken: string;
  currency: string;
};

export interface ICancel {
  orderBookUID: string;
  orderID: string;
  signer: any;
}
export interface IOpenDispute {
  orderBookUID: string;
  orderID: string;
  signer: any;
}

const shortenAddress = (account: string) => {
  if (account) {
    const len = account.length;
    let accountFirstShorten = account.slice(0, 5);
    let accountSecondShorten = account.slice(len - 4, len);
    let shortenAccount = `${accountFirstShorten}...${accountSecondShorten}`;
    return shortenAccount;
  }
};

const getStoredData = async (cid: string) => {
  const dataJson = await IPFSClient.getStoredData(cid);
  return JSON.parse(dataJson!);
};

export const recentActivities = async (data: any, auth: IAuthInstance) => {
  const res = data.map(async (item: IActivity) => {
    const tokenERC20 = new ethers.Contract(
      item._token,
      ERC20.abi,
      auth.provider
    );
    const _currency = await tokenERC20.symbol();
    const currency = _currency === "WETH" ? "BNB" : _currency;
    const _title0 = ethers.utils.parseBytes32String(item._title0);
    const _title1 = ethers.utils.parseBytes32String(item._title1);
    const cid = _title0 + _title1;

    const decryptedData = await getStoredData(cid);
    const title = decryptedData.title;
    const file = decryptedData.doc;
    const fileType = decryptedData.fileType;
    const amount = fromWei(item._amount);

    const isPayment =
      getAddress(auth.account) === getAddress(item._from) ? false : true;

    const paymentTo = `Sent to ${shortenAddress(item._to)}`;
    const paymentToOpen = `Open Payment to ${shortenAddress(item._from)}`;
    const paymentFrom = `Received from ${shortenAddress(item._from)}`;
    const productFor = `Product for ${shortenAddress(item._to)}`;

    const sellProductInfo = isPayment ? paymentToOpen : productFor;
    const sendDirectInfo = isPayment ? paymentFrom : paymentTo;

    const paymentInfo = file === "" ? sendDirectInfo : sellProductInfo;

    return new Activity(
      item._orderID,
      title,
      paymentInfo,
      file,
      fileType,
      item._from,
      item._to,
      shortenAddress(item._from)!,
      shortenAddress(item._to)!,
      `https://testnet.snowtrace.io/tx/${item._txHash}`,
      amount,
      item._token,
      currency,
      item._status,
      item._closeTime,
      isPayment
    );
  });
  const result = await Promise.all(res);
  return result;
};
