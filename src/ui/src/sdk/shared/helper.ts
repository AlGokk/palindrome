import { BigNumber, ethers } from "ethers";

export enum States {
  Pending,
  Shipped,
  Canceled,
  Completed,
  NotDelivered,
}

export interface IConnect {
  rpc?: { [chainId: number]: string };
  chainId: number;
}

export const toWei = (value: any) => ethers.utils.parseEther(value.toString());

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

export interface ISendBNBToSellerWithEscrowPass {
  token: string;
  to: string;
  paymentSystemUID: string;
  title: [string, string];
}

export interface ISendTokenWithoutEscrow {
  token: string;
  to: string;
  orderBookUID: string;
  amount: string;
  title: string;
  signer: any;
}
export interface ISendTokenWithEscrowPassBlockchain {
  token: string;
  to: string;
  orderBookUID: string;
  amount: string;
  title: [string, string];
}

export interface ISendBNBToSellerWithoutEscrow {
  token: string;
  from: string;
  to: string;
  orderBookUID: string;
  amount: string;
  title: string;
  signer: any;
}

export interface IAuthInstance {
  account: string;
  provider: any;
  signer: any;
}

export interface IInit {
  signer: any;
}
export class IGetPaymentDetails {
  constructor(
    public readonly paymentSystemUID: string,
    public readonly orderBookUID: string
  ) {}
}

export interface ISentDirect {
  token: string;
  to: string;
  orderBookUID: string;
  amount: string;
  title: string;
  signer: any;
}
export interface ISentDirectBNBPass {
  token: string;
  to: string;
  orderBookUID: string;
  title: [string, string];
}

export interface ISentDirectTokenPass {
  token: string;
  to: string;
  orderBookUID: string;
  amount: string | BigNumber;
  title: [string, string];
}

export interface ISetOpenDisputeState {
  from: string;
  orderBookUID: string;
  orderID: any;
  status: number;
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

export interface ICreateOrderArgsPass {
  token: string;
  orderBookUID: string;
  to: string;
  amount: BigNumber;
  title: [string, string];
  maturityTime?: number;
  file?: Object;
}

export interface ICancel {
  orderBookUID: string;
  orderID: string;
  signer: any;
}

export interface IConfirmReceiptTheCustomer {
  orderBookUID: string;
  orderID: string;
  signer: any;
}

export interface IOpenDispute {
  orderBookUID: string;
  orderID: string;
  signer: any;
}

export interface IGetOrderStatus {
  orderBookUID: string;
  orderID: number;
  provider: any;
}

export interface IConfirmShipmentFromMerchant {
  merchantID: string;
  orderID: string;
  state: States;
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
