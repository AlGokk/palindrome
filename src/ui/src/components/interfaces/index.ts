import { ITokenData, Activity } from "../helper";

export interface IDashboardStates {
  auth: any;
  magiar: string;
  account: string;
  sidebarOpen: boolean;
  provider: any;
  signer: any;
  shortenAccount: string;
  effect: boolean;
  cards: Array<any>;
  tokenData: ITokenData[];
  selectedToken: string;
  selectedTokenData: ITokenData;
  allTransactions: Activity[];
  transactions: Activity[];
  taskButton: any;
  open: boolean;
  openSendDirect: boolean;
  openTokenList: boolean;
  shortenAddress(account: string): Promise<string>;
  checkIfSendingToYourSelf(account: string, to: string): void;
  loading: boolean;
  loadingMain: boolean;
  txSucceed: boolean;
  tx: string;
  shortenHash: string;
  maxPageNumber: number;
  pageNumber: number;
  prevCount: number;
  nextCount: number;
  isMobile: boolean;
}
