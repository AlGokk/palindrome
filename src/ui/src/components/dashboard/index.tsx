import React, { Component, Fragment } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import logoPalindromeCryptoEscrow from "./images/logo-palindrome-crypto-escrow.png";
import Context from "../Context";
import moment from "moment";
import { ethers } from "ethers";
import ERC20 from "../../artifacts/src/contracts/ERC20.sol/ERC20.json";
import { Tokens } from "../Tokens/index.test";
import { gql } from "@apollo/client";
import "./index.css";

import {
  ClockIcon,
  HomeIcon,
  MenuAlt1Icon,
  ScaleIcon,
  XIcon,
  SwitchHorizontalIcon,
  ChevronDownIcon,
  DotsVerticalIcon,
  BanIcon,
  DownloadIcon,
  DocumentDownloadIcon,
  LightBulbIcon,
} from "@heroicons/react/outline";
import {
  PaperAirplaneIcon,
  ChevronRightIcon,
  ClipboardCopyIcon,
  SearchIcon,
  CubeIcon,
  LinkIcon,
  ExternalLinkIcon,
  MailIcon,
} from "@heroicons/react/solid";

import {
  PalindromeOrder,
  PalindromeSend,
  PalindromeWithdraw,
  PalindromeAdmin,
} from "../../sdk";

import CreateOrder from "../createOrder";
import {
  getAddress,
  recentActivities,
  Activity,
  IAuthInstance,
  ConnectionInstance,
  fromWei,
  IWithDrawSeller,
  ITokenData,
  AuthInstances,
  GetTransactions,
  GetAllData,
  IWithDrawCustomer,
  ISendBNBToSellerWithEscrow,
  ICancel,
  IConfirmReceiptTheCustomer,
  IOpenDispute,
  ISendTokenToSellerWithEscrow,
  ISetOpenDisputeState,
  IConnect,
  IStatus,
} from "../helper";
import { PalindromeConnect } from "../../sdk/components/connect";

import TokenListModal from "../tokenModalList";
import { IDashboardStates } from "../interfaces";
import TxDialog from "../txDialog";
import { printTable } from "../jsPDF";
import SendDirect from "../sendDirect";
// import AutoTradingBot from "../autoTradingBot";
import Loading from "../loading";

declare var window: any;

const navigation = [
  { name: "Home", href: "#", icon: HomeIcon, current: true },
  {
    name: "How it works",
    href: "./palindrome_pay_crypto_escrow.png",
    icon: LightBulbIcon,
    current: false,
  },
];
const secondaryNavigation = [
  {
    name: "BSC Faucet",
    href: "https://testnet.bnbchain.org/faucet-smart",
    icon: LinkIcon,
  },
];

const enum TokenName {
  BNB = "BNB",
  DAI = "DAI",
}

const cardsData = [
  { name: "BALANCE", href: "#", icon: ScaleIcon, count: "0.0" },
  { name: "IN PROGRESS", href: "#", icon: ClockIcon, count: "0" },
  { name: "COMPLETED", href: "#", icon: PaperAirplaneIcon, count: "0" },
];

type statustylesType = {
  [key: string]: any;
};

// Returns uint
// InProgress,  0
// Paid,        1
// Delivered,   2
// Completed    3
// Canceled,    4
// OpenDispute,  5
// CanceledOpenDispute, 6
// CompletedOpenDispute, 7

enum Status {
  InProgress,
  Paid,
  Delivered,
  Completed,
  Canceled,
  OpenDispute,
  CanceledOpenDispute,
  CompletedOpenDispute,
}

const statusStyles: statustylesType = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-cyan-100 text-cyan-800",
  2: "bg-lime-100 text-lime-800",
  3: "bg-green-100 text-green-800",
  4: "bg-pink-100 text-pink-800",
  5: "bg-indigo-100 text-indigo-800",
  6: "bg-pink-100 text-pink-800",
  7: "bg-green-100 text-green-800",
};

// Returns uint
// InProgress,  0
// Paid,        1
// Delivered,   2
// Completed    3
// Canceled,    4
// OpenDispute,  5
// CanceledOpenDispute, 6
// CompletedOpenDispute, 7

const StatusData = {
  0: "InProgress",
  1: "Paid",
  2: "Delivered",
  3: "Completed",
  4: "Canceled",
  5: "OpenDispute",
  6: "CanceledOpenDispute",
  7: "CompletedOpenDispute",
};

const classNames = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

const GET_ORDERS_FROM = gql`
  query getOrders($_from: String!) {
    orders(where: { _from: $_from }) {
      id
      _txHash
      _title0
      _title1
      _from
      _to
      _orderID
      _status
      _token
      _amount
      _closeTime
    }
  }
`;

const GET_ORDERS_TO = gql`
  query getOrders($_to: String!) {
    orders(where: { _to: $_to }) {
      id
      _txHash
      _title0
      _title1
      _from
      _to
      _orderID
      _status
      _token
      _amount
      _closeTime
    }
  }
`;

interface IProps {
  client: any;
}

export default class DashboardClass extends Component<any, IDashboardStates> {
  _isMounted = false;
  provider: any;
  constructor(props: IProps) {
    super(props);
    this.state = {
      auth: {},
      magiar: process.env.REACT_APP_MEDIATOR!,
      account: "",
      sidebarOpen: false,
      provider: {},
      signer: {},
      shortenAccount: "",
      effect: false,
      cards: cardsData,
      tokenData:
        Tokens[process.env.REACT_APP_SYSTEM_STATUS as keyof typeof Tokens],
      selectedToken:
        Tokens[process.env.REACT_APP_SYSTEM_STATUS as keyof typeof Tokens][0]
          .address,
      selectedTokenData:
        Tokens[process.env.REACT_APP_SYSTEM_STATUS as keyof typeof Tokens][0],
      allTransactions: [] as Activity[],
      transactions: [] as Activity[],
      taskButton: {},
      open: false,
      openSendDirect: false,
      openTokenList: false,
      shortenAddress: this.shortenAddress,
      checkIfSendingToYourSelf: this.checkIfSendingToYourSelf,
      loading: false,
      loadingMain: false,
      txSucceed: false,
      tx: "",
      shortenHash: "",
      maxPageNumber: 1,
      pageNumber: 1,
      prevCount: 0,
      nextCount: 20,
      isMobile: false,
    };
  }

  loginMobile = async (): Promise<void> => {
    console.log("loginMobile..");
    const { status, auth } = await this.loginWalletConnect();
    if (status && auth?.account && auth.signer && auth.provider) {
      this.setState({ loadingMain: true });
      await this.getAllData(auth);
      localStorage.setItem("account", auth.account);
      this.state.provider.on("accountsChanged", (accounts: string[]) => {
        console.log(accounts);
      });

      // Subscribe to chainId change
      this.state.provider.on("chainChanged", async (chainId: number) => {
        console.log(chainId);
        localStorage.clear();
        await this.reloadPage();
      });

      // Subscribe to session disconnection
      this.state.provider.on(
        "disconnect",
        async (code: number, reason: string) => {
          console.log(code, reason);
          localStorage.clear();
          await this.reloadPage();
        }
      );
    } else {
      this.setState(null);
    }
  };

  getAllData = async (auth: AuthInstances) => {
    const cardObj = await this.getBalances(auth);
    const data = await this.getTransactions(auth);
    if (data) {
      const cards = Object.assign(cardObj, data.cards);
      const allData = new GetAllData(
        data.maxPageNumber,
        data.allTransactions,
        data.transactions,
        cards
      );
      this.setState({
        loadingMain: false,
        maxPageNumber: allData.maxPageNumber!,
        allTransactions: allData.allTransactions,
        transactions: allData.transactions,
        cards: allData.cards,
      });
    }
  };

  loginDesktop = async () => {
    console.log("loginDesktop..");
    const { status, auth } = await this.loginMetamask();
    if (status && auth?.account && auth?.signer && auth?.provider) {
      localStorage.setItem("account", auth.account);
      this.setState({ loadingMain: true });
      await this.getAllData(auth);

      window.ethereum.on("accountsChanged", async (accounts: any) => {
        if (accounts.length) {
          console.log("Account changed..");
          this.setState({ account: accounts[0] });
          localStorage.setItem("account", accounts[0]);
          window.location.reload();
        } else {
          console.log("Disconnect..");
          await this.reloadPage();
        }
      });
      window.ethereum.on("chainChanged", async (chainId: any) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        localStorage.clear();
        await this.reloadPage();
      });
      return auth;
    } else {
      this.setState(null);
    }
  };

  reloadPage = async () => {
    window.location.reload();
  };

  next = () => {
    if (this.state.maxPageNumber > this.state.pageNumber) {
      const prevCount = this.state.prevCount + 20;
      const nextCount = this.state.nextCount + 20;
      const data = this.state.allTransactions.slice(prevCount, nextCount);
      const pgNumber = this.state.pageNumber + 1;

      this.setState({
        pageNumber: pgNumber,
        transactions: data,
        prevCount,
        nextCount,
      });
    }
  };

  prev = () => {
    if (this.state.prevCount !== 0) {
      const prevCount = this.state.prevCount - 20;
      const nextCount = this.state.nextCount - 20;
      const data = this.state.allTransactions.slice(prevCount, nextCount);
      const pgNumber = this.state.pageNumber - 1;

      this.setState({
        pageNumber: pgNumber,
        transactions: data,
        prevCount,
        nextCount,
      });
    }
  };

  getTransactions = async (auth: AuthInstances) => {
    const {
      err: getOrdersFrom_Error,
      loading: getOrdersFrom_Loading,
      data: getOrdersFrom_Data,
    } = await this.props.client.query({
      query: GET_ORDERS_FROM,
      variables: { _from: auth.account },
    });

    const {
      err: getOrdersTo_Error,
      loading: getOrdersTo_Loading,
      data: getOrdersTo_Data,
    } = await this.props.client.query({
      query: GET_ORDERS_TO,
      variables: { _to: auth.account },
    });

    if (getOrdersFrom_Error) console.log(getOrdersFrom_Error);
    if (getOrdersTo_Error) console.log(getOrdersFrom_Error);

    if (!getOrdersFrom_Loading && !getOrdersTo_Loading) {
      const data = [...getOrdersFrom_Data.orders, ...getOrdersTo_Data.orders];
      data.sort((a, b) => b.id - a.id);

      if (!data.length) this.setState({ loadingMain: false });
      const activities = await recentActivities(data, auth);
      if (activities && activities.length) {
        const countInPogress = activities.filter(
          (item: any) => Number.parseInt(item.status) === Status.InProgress
        ).length;

        const countCompleted = activities.filter(
          (item: any) => Number.parseInt(item.status) === Status.Completed
        ).length;

        this.state.cards[1]["count"] = countInPogress;
        this.state.cards[2]["count"] = countCompleted;

        const cardsObj = this.state.cards;

        const maxPageNumber = Math.ceil(activities.length / 20);

        return new GetTransactions(
          maxPageNumber,
          activities,
          activities.slice(this.state.prevCount, this.state.nextCount),
          cardsObj
        );
      }
    }
  };

  async componentDidMount() {
    this._isMounted = true;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let auth: any;
    if (!isMobile) {
      auth = await this.loginDesktop();
    } else {
      auth = await this.loginMobile();
    }
    // const selectedTokenData = JSON.parse(localStorage.getItem("tokenData")!);
    // if (selectedTokenData) {
    //   this.setState({
    //     selectedTokenData,
    //     selectedToken: selectedTokenData.address,
    //   });
    // }

    const shortenAccount = await this.shortenAccount(auth);

    this.setState({
      auth,
      shortenAccount,
      account: auth?.account,
      provider: auth?.provider,
      signer: auth?.signer,
      isMobile,
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /**
   * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   * +++++++++++++++++++++SDK START++++++++++++++++++++++++++++
   * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   */

  checkNetwork = async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (currentChainId) return currentChainId;
    }
  };

  loginMetamask = async () => {
    const currentChainID = await this.checkNetwork();
    const opt: IConnect = {
      chainId: currentChainID,
    };
    const auth: IAuthInstance = await PalindromeConnect.connectMetamask(opt);
    if (!auth?.account) {
      console.log("Logged in failed...");
      return new ConnectionInstance(false);
    } else {
      console.log("Logged in succeed...");
      localStorage.setItem("account", auth.account);
      return new ConnectionInstance(true, auth);
    }
  };

  loginWalletConnect = async () => {
    const opt = {
      rpc: { 43114: "https://api.avax.network/ext/bc/C/rpc" },
      chainId: 43114,
    };
    const auth: any = await PalindromeConnect.connectWalletConnect(opt);
    if (!auth.account) {
      console.log("Logged in failed...");
      return new ConnectionInstance(false);
    } else {
      console.log("Logged in succeed...");
      localStorage.setItem("account", auth.account);
      return new ConnectionInstance(true, auth);
    }
  };

  logout = async () => {
    localStorage.clear();
  };

  checkMaturityTimeAndStatus = (transaction: Activity) => {
    const today = moment().unix();
    if (
      (today.toString() > transaction.withDrawdate &&
        Number(transaction.status) !== Status.Paid) ||
      transaction.status === Status.Delivered
    ) {
      return false;
    } else {
      return true;
    }
  };

  setCancelOpenDispute = async (e: any, transaction: Activity) => {
    e.preventDefault();
    console.log("setCancelOpenDispute..");
    try {
      const args: ISetOpenDisputeState = {
        from: transaction.from,
        orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
        orderID: transaction.id,
        status: Status.CanceledOpenDispute,
        signer: this.state.signer,
      };
      this.setState({ loading: true });
      const status = await PalindromeAdmin.setOpenDisputeState(args);
      if (status) {
        this.setState({ loading: false });
        window.location.reload();
        console.log("setCancelOpenDispute done..");
      } else {
        console.log("setCancelOpenDispute failed..");
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  setCompleteOpenDispute = async (e: any, transaction: Activity) => {
    e.preventDefault();
    console.log("setCancelOpenDispute..");
    try {
      const args: ISetOpenDisputeState = {
        from: transaction.from,
        orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
        orderID: transaction.id,
        status: Status.CompletedOpenDispute,
        signer: this.state.signer,
      };
      this.setState({ loading: true });
      const status = await PalindromeAdmin.setOpenDisputeState(args);
      if (status) {
        this.setState({ loading: false });
        window.location.reload();
        console.log("setCompleteOpenDispute done...");
      } else {
        console.log("setCompleteOpenDispute failed..");
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  /**
   * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   * +++++++++++++++++++++SDK END++++++++++++++++++++++++++++++
   * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   */

  openHideMenuButton = (
    status: number,
    isPayment = false,
    account: string,
    mediator: string
  ) => {
    // InProgress,  0
    // Paid,        1
    // Delivered,   2
    // Completed    3
    // Canceled,    4
    // OpenDispute,  5
    // CanceledOpenDispute, 6
    // CompletedOpenDispute, 7

    if (status === Status.InProgress) return true;
    if (status === Status.Paid && isPayment) return true;
    if (status === Status.Delivered && !isPayment) return true;
    if (status === Status.CanceledOpenDispute && isPayment) return true;
    if (status === Status.CompletedOpenDispute && !isPayment) return true;
    if (
      status === Status.OpenDispute &&
      account?.toLowerCase() === mediator?.toLowerCase()
    )
      return true;
  };

  checkIfMagiar = (account: string, mediator: string) => {
    if (account?.toLowerCase() === mediator?.toLowerCase()) return true;
  };

  copyClipboard = async (account: string) => {
    if (account) {
      await navigator.clipboard.writeText(account);
    } else {
      const account = "0x0000000000000000000000000000000000000000NotLogged";
      await navigator.clipboard.writeText(account);
    }
  };

  shortenAddress = async (account: string) => {
    if (account) {
      const len = account.length;
      let accountFirstShorten = account.slice(0, 5);
      let accountSecondShorten = account.slice(len - 4, len);
      let shortenAccount = `${accountFirstShorten}...${accountSecondShorten}`;
      return shortenAccount;
    } else {
      const account = "0x0000000000000000000000000000000000000000";
      const len = account.length;
      let accountFirstShorten = account.slice(0, 5);
      let accountSecondShorten = account.slice(len - 4, len);
      let shortenAccount = `${accountFirstShorten}...${accountSecondShorten}`;
      return shortenAccount;
    }
  };

  shortenAccount = async (auth: AuthInstances) => {
    const shortenAccount = await this.shortenAddress(auth?.account);
    return shortenAccount;
  };

  setSelectedToken = async (tokenData: ITokenData) => {
    const auth = this.state.auth;
    this.setState(
      {
        selectedToken: tokenData.address,
        selectedTokenData: tokenData,
        openTokenList: false,
      },
      () => this.getAllData(auth)
    );
    window.localStorage.setItem("token", tokenData.address);
    window.localStorage.setItem("tokenData", JSON.stringify(tokenData));
  };

  withDrawSeller = async (e: any, args: Activity) => {
    e.preventDefault();
    console.log("withDrawToken..");

    const argsPass: IWithDrawSeller = {
      paymentSystemUID: process.env.REACT_APP_PAYMENTSYSTEM_UID!,
      orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
      orderID: args.id,
      signer: this.state.signer,
    };

    this.setState({ loading: true });
    const res = await PalindromeWithdraw.withDrawSeller(argsPass);
    let shortenHash: any;
    if (res.status) {
      shortenHash = await this.shortenAddress(res.tx.hash);
      this.setState({
        loading: false,
        txSucceed: res.status,
        tx: res.tx.hash,
        shortenHash,
      });
    } else {
      console.log("withDrawSeller failed...");
      this.setState({
        loading: false,
        txSucceed: false,
        tx: res.tx.hash,
        shortenHash,
      });
    }
  };

  withDrawCustomer = async (e: any, args: Activity) => {
    e.preventDefault();
    console.log("withDrawToken..");

    const argsPass: IWithDrawCustomer = {
      seller: args.from,
      paymentSystemUID: process.env.REACT_APP_PAYMENTSYSTEM_UID!,
      orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
      orderID: args.id,
      signer: this.state.signer,
    };

    this.setState({ loading: true });
    const res = await PalindromeWithdraw.withDrawCustomer(argsPass);
    let shortenHash: any;
    if (res.status) {
      shortenHash = await this.shortenAddress(res.tx.hash);
      this.setState({
        loading: false,
        txSucceed: res.status,
        tx: res.tx.hash,
        shortenHash,
      });
    } else {
      console.log("withDrawSeller failed...");
      this.setState({
        loading: false,
        txSucceed: false,
        tx: res.tx.hash,
        shortenHash,
      });
    }
  };

  withDrawSellerBNB = async (e: any, args: Activity) => {
    e.preventDefault();
    console.log("withDrawSellerBNB..");

    const argsPass: IWithDrawSeller = {
      paymentSystemUID: process.env.REACT_APP_PAYMENTSYSTEM_UID!,
      orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
      orderID: args.id,
      signer: this.state.signer,
    };

    this.setState({ loading: true });
    const res = await PalindromeWithdraw.withDrawSellerBNB(argsPass);
    let shortenHash: any;
    if (res.status) {
      shortenHash = await this.shortenAddress(res.tx.hash);
      this.setState({
        loading: false,
        txSucceed: res.status,
        tx: res.tx.hash,
        shortenHash,
      });
    } else {
      console.log("withDrawSellerBNB failed...");
      this.setState({
        loading: false,
        txSucceed: false,
        tx: res.tx.hash,
        shortenHash,
      });
    }
  };

  withDrawCustomerBNB = async (e: any, args: Activity) => {
    e.preventDefault();
    console.log("withDrawCustomerBNB..");

    const argsPass: IWithDrawCustomer = {
      seller: args.from,
      paymentSystemUID: process.env.REACT_APP_PAYMENTSYSTEM_UID!,
      orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
      orderID: args.id,
      signer: this.state.signer,
    };

    this.setState({ loading: true });
    const res = await PalindromeWithdraw.withDrawCustomerBNB(argsPass);
    let shortenHash: string = await this.shortenAddress(res.tx.hash);
    if (res.status) {
      this.setState({
        loading: false,
        txSucceed: res.status,
        tx: res.tx.hash,
        shortenHash,
      });
    } else {
      console.log("withDrawSellerBNB failed...");
      this.setState({
        loading: false,
        txSucceed: false,
        tx: res.tx.hash,
        shortenHash,
      });
    }
  };

  confirmReceiptTheCustomer = async (e: any, args: Activity) => {
    e.preventDefault();
    console.log("confirmReceiptTheCustomer..");
    try {
      this.setState({ loading: true });
      const argsPass: IConfirmReceiptTheCustomer = {
        orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
        orderID: args.id,
        signer: this.state.signer,
      };

      const res = await PalindromeOrder.confirmReceiptTheCustomer(argsPass);
      if (res) {
        this.setState({ loading: false });
        window.location.reload();
      } else {
        console.log("confirmReceiptTheCustomer failed...");
        this.setState({ loading: false });
      }
    } catch (e: any) {
      throw e;
    }
  };

  checkIfSendingToYourSelf = (account: string, to: string) => {
    const acc = getAddress(account);
    const recipient = getAddress(to);
    if (acc === recipient) {
      alert("Not allowed to send yourself");
      return;
    }
  };

  sendTokenToSellerWithEscrow = async (e: any, args: Activity) => {
    e.preventDefault();
    console.log("sendTokenToSellerWithEscrow...");

    this.checkIfSendingToYourSelf(this.state.account, args.from);

    const argsPass: ISendTokenToSellerWithEscrow = {
      token: args.token,
      to: args.from,
      paymentSystemUID: process.env.REACT_APP_PAYMENTSYSTEM_UID!,
      amount: args.amount,
      orderID: args.id,
      title: args.title,
      signer: this.state.signer,
    };

    this.setState({ loading: true });

    const res: IStatus = await PalindromeSend.sendTokenToSellerWithEscrow(
      argsPass
    );
    let shortenHash: string = await this.shortenAddress(res.tx.hash);
    if (res.status) {
      this.setState({
        loading: false,
        txSucceed: res.status,
        tx: res.tx.hash,
        shortenHash,
      });
    } else {
      this.setState({
        loading: false,
        txSucceed: res.status,
        tx: res.tx.hash,
        shortenHash,
      });
    }
  };

  sendBNBToSellerWithEscrow = async (e: any, args: Activity) => {
    e.preventDefault();
    console.log("sendBNBToSellerWithEscrow..");
    try {
      this.checkIfSendingToYourSelf(this.state.account, args.from);

      const argsPass: ISendBNBToSellerWithEscrow = {
        token: this.state.selectedToken,
        to: args.from,
        paymentSystemUID: process.env.REACT_APP_PAYMENTSYSTEM_UID!,
        orderID: args.id,
        amount: args.amount,
        title: args.title,
        signer: this.state.signer,
      };

      this.setState({ loading: true });
      const res = await PalindromeSend.sendBNBToSellerWithEscrow(argsPass);
      let shortenHash: string = await this.shortenAddress(res.tx.hash);
      if (res.status) {
        this.setState({
          loading: false,
          txSucceed: res.status,
          tx: res.tx.hash,
          shortenHash,
        });
      } else {
        this.setState({
          loading: false,
          txSucceed: res.status,
          tx: res.tx.hash,
          shortenHash,
        });
      }
    } catch (e: any) {
      throw e;
    }
  };

  cancelOrder = async (e: any, args: Activity) => {
    e.preventDefault();

    const argsPass: ICancel = {
      orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
      orderID: args.id,
      signer: this.state.signer,
    };
    this.setState({ loading: true });
    const res = await PalindromeOrder.cancelOrder(argsPass);
    let shortenHash: any;
    if (res.status) {
      shortenHash = await this.shortenAddress(res.tx.hash);
      this.setState({
        loading: false,
        txSucceed: res.status,
        tx: res.tx.hash,
        shortenHash,
      });
    } else {
      this.setState({
        loading: false,
        txSucceed: false,
        tx: res.tx.hash,
        shortenHash,
      });
    }
  };

  openDispute = async (e: any, args: Activity) => {
    e.preventDefault();
    console.log("openDispute..");
    const argsPass: IOpenDispute = {
      orderBookUID: process.env.REACT_APP_ORDERBOOK_UID!,
      orderID: args.id,
      signer: this.state.signer,
    };

    this.setState({ loading: true });
    const res = await PalindromeOrder.openDispute(argsPass);
    let shortenHash: any;
    if (res.status) {
      shortenHash = await this.shortenAddress(res.tx.hash);
      this.setState({
        loading: false,
        txSucceed: res.status,
        tx: res.tx.hash,
        shortenHash,
      });
    } else {
      this.setState({
        loading: false,
        txSucceed: false,
        tx: res.tx.hash,
        shortenHash,
      });
    }
  };

  getBalanceBNB = async (account: string, provider: any) => {
    let balance: any, balanceInWei: any;
    if (this.state.selectedToken) {
      const accountCheckSum = getAddress(account);
      balanceInWei = await provider.getBalance(accountCheckSum);
      balance = fromWei(balanceInWei);
      balance = Number.parseFloat(balance).toFixed(1);
      this.state.cards[0]["count"] = balance;
      return this.state.cards;
    } else {
      return this.state.cards;
    }
  };

  getTokenBalance = async (account: string, provider: any) => {
    let balance: any, balanceInWei: any;
    if (this.state.selectedToken) {
      try {
        const accountCheckSum = getAddress(account);
        const tokenAddr = getAddress(this.state.selectedToken);
        const token = new ethers.Contract(tokenAddr, ERC20.abi, provider);
        balanceInWei = await token.balanceOf(accountCheckSum);
        balance = fromWei(balanceInWei);
        balance = Number.parseFloat(balance).toFixed(1);
        this.state.cards[0]["count"] = balance;
        return this.state.cards;
      } catch (e: any) {
        throw e;
      }
    } else {
      return this.state.cards;
    }
  };

  getBalances = async (auth: AuthInstances) => {
    let cardObj: any;
    if (this.state.selectedToken && auth.account) {
      try {
        if (
          this.state.selectedToken ===
          Tokens[process.env.REACT_APP_SYSTEM_STATUS as keyof typeof Tokens][0]
            .address
        ) {
          console.log("BNB:::::");
          cardObj = await this.getBalanceBNB(auth.account, auth.provider);
        } else {
          console.log("TOKEN:::::");
          cardObj = await this.getTokenBalance(auth.account, auth.provider);
        }
        return cardObj;
      } catch (e: any) {
        throw e;
      }
    } else {
      console.log("Selected token is undefined");
    }
  };

  setSpinnerStatus = async (buttonName: string, id: any, active: boolean) => {
    const objProp: any = {};
    const key = `${buttonName}-${id}`;
    objProp[key] = active;
    const obj = Object.assign(this.state.taskButton, objProp);

    this.setState(obj);
  };

  setOpen = async () => {
    this.setState({ open: !this.state.open });
  };

  setOpenSendDirect = async () => {
    this.setState({ openSendDirect: !this.state.openSendDirect });
  };

  toggleTokenListModal = async (e: any) => {
    this.setState({ openTokenList: false });
  };

  searchTransaction = async (e: any) => {
    e.preventDefault();
    const input = getAddress(e.target.value);

    const txFound = this.state.transactions.filter(
      (item) => getAddress(item.from) === input
    );
    if (txFound.length) {
      this.setState({ transactions: txFound });
    } else {
    }
  };

  downloadBase64File = (base64Data: any, fileType: string) => {
    if (fileType !== "") {
      let fileName = "";
      if (fileType === "jpeg" || fileType === "JPEG") fileName = "file.jpeg";
      if (fileType === "png") fileName = "file.png";
      if (fileType === "pdf") fileName = "file.pdf";
      if (fileType === "xlsx") fileName = "file.xlsx";
      const linkSource = `${base64Data}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  render() {
    return (
      <React.Fragment>
        <>
          <Context.Provider value={this.state}>
            <CreateOrder open={this.state.open} setOpen={this.setOpen} />
            <SendDirect
              open={this.state.openSendDirect}
              setOpen={this.setOpenSendDirect}
            />
          </Context.Provider>
          <div className="min-h-full">
            <Transition.Root show={this.state.sidebarOpen} as={Fragment}>
              <Dialog
                as="div"
                className="fixed inset-0 flex z-40 lg:hidden"
                onClose={() =>
                  this.setState({ sidebarOpen: !this.state.sidebarOpen })
                }
              >
                <Transition.Child
                  as={Fragment}
                  enter="transition-opacity ease-linear duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity ease-linear duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                </Transition.Child>
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-300 transform"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <div className="relative bg-cyan-600 flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 ">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-300"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                          type="button"
                          className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                          onClick={() =>
                            this.setState({
                              sidebarOpen: !this.state.sidebarOpen,
                            })
                          }
                        >
                          <span className="sr-only">Close sidebar</span>
                          <XIcon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </Transition.Child>
                    <div className="flex-shrink-0 flex items-center px-4"></div>
                    <nav
                      className="mt-5 flex-shrink-0 h-full divide-y divide-cyan-800 overflow-y-auto"
                      aria-label="Sidebar"
                    >
                      <div className="px-2 space-y-1">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-cyan-800 text-white"
                                : "text-cyan-100 hover:text-white hover:bg-cyan-600",
                              "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                            )}
                            aria-current={item.current ? "page" : undefined}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <item.icon
                              className="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200"
                              aria-hidden="true"
                            />
                            {item.name}
                          </a>
                        ))}
                      </div>
                      <div className="mt-6 pt-6">
                        <div className="px-2 space-y-1">
                          {secondaryNavigation.map((item) => (
                            <a
                              key={item.name}
                              href={item.href}
                              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <item.icon
                                className="mr-4 h-6 w-6 text-cyan-200"
                                aria-hidden="true"
                              />
                              {item.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    </nav>
                  </div>
                </Transition.Child>
                <div className="flex-shrink-0 w-14" aria-hidden="true">
                  {/* Dummy element to force sidebar to shrink to fit close icon */}
                </div>
              </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex flex-col flex-grow bg-gradient-to-t from-cyan-500 to-cyan-800 to-gray-800  pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <img
                    className="h-14 w-auto"
                    src={logoPalindromeCryptoEscrow}
                    alt="Palindrome Crypto Escrow Service"
                  />
                </div>
                <nav
                  className="mt-5 flex-1 flex flex-col divide-y divide-cyan-800 overflow-y-auto"
                  aria-label="Sidebar"
                >
                  <div className="px-2 space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-cyan-800 text-white"
                            : "text-cyan-100 hover:text-white hover:bg-cyan-600",
                          "group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md"
                        )}
                        aria-current={item.current ? "page" : undefined}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <item.icon
                          className="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200"
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 pt-6">
                    <div className="px-2 space-y-1">
                      {secondaryNavigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <item.icon
                            className="mr-4 h-6 w-6 text-cyan-200"
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </div>

            <div className="lg:pl-64 flex flex-col flex-1">
              <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none">
                <button
                  type="button"
                  className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 lg:hidden"
                  onClick={() =>
                    this.setState({
                      sidebarOpen: !this.state.sidebarOpen,
                    })
                  }
                >
                  <span className="sr-only">Open sidebar</span>
                  <MenuAlt1Icon className="h-6 w-6" aria-hidden="true" />
                </button>
                {/* Search bar */}
                <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
                  <div className="flex-1 flex">
                    <form
                      className="w-full flex md:ml-0"
                      action="#"
                      method="GET"
                    >
                      <label htmlFor="search-field" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                        <div
                          className="absolute inset-y-0 left-0 flex items-center pointer-events-none"
                          aria-hidden="true"
                        >
                          <SearchIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <input
                          id="search-field"
                          name="search-field"
                          className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm"
                          placeholder="Search transaction 0x.."
                          type="search"
                          onChange={this.searchTransaction}
                        />
                      </div>
                    </form>
                  </div>
                  <div className="flex items-center ">
                    {this.state.account ? (
                      <Menu as="div" className="ml-1 relative">
                        <div>
                          <Menu.Button className="max-w-xs bg-white rounded-md flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 py-1 px-2">
                            <img
                              className="h-8 w-8 "
                              src="/wallet.png"
                              alt=""
                            />
                            <span className="ml-2 text-gray-700 text-sm font-medium lg:block">
                              {this.state.shortenAccount}
                            </span>
                          </Menu.Button>
                        </div>
                      </Menu>
                    ) : (
                      <Menu as="div" className="ml-3 relative">
                        <div>
                          <Menu.Button
                            className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 lg:p-2 lg:rounded-md lg:hover:bg-gray-50"
                            onClick={
                              this.state.isMobile
                                ? this.loginMobile
                                : this.loginDesktop
                            }
                          >
                            <img
                              className="h-8 w-8 "
                              src="/wallet.png"
                              alt=""
                            />
                            <span className="ml-1 text-gray-700 text-sm font-medium lg:block">
                              Connect
                            </span>
                          </Menu.Button>
                        </div>
                      </Menu>
                    )}
                  </div>
                </div>
              </div>
              <main className="flex-1 pb-8">
                <div className="bg-white shadow">
                  <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
                    <div className="py-6 md:flex md:items-center md:justify-between lg:border-t lg:border-gray-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div>
                            <div className="flex flex-col">
                              <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-800 sm:leading-9 sm:truncate">
                                Crypto Escrow Service
                              </h1>
                            </div>
                            <div className="flex flex-row">
                              <dl
                                className="ml-3 text-2xl mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap"
                                onClick={() =>
                                  this.copyClipboard(this.state.account)
                                }
                              >
                                <dd
                                  id="copy"
                                  className="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-3"
                                >
                                  {this.state.shortenAccount
                                    ? this.state.shortenAccount
                                    : "0x000...0000NotLoggedIn"}
                                  <ClipboardCopyIcon
                                    className={`${
                                      this.state.effect && "animate-bounce"
                                    } flex-shrink-0 ml-1.5 h-5 w-5 text-gray-400`}
                                    aria-hidden="true"
                                    onClick={() => {
                                      this.setState({ effect: true });
                                      setTimeout(() => {
                                        this.setState({ effect: false });
                                      }, 200);
                                    }}
                                  />
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row space-x-4">
                        <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                          <Context.Provider value={this.state}>
                            <TokenListModal
                              openTokenList={this.state.openTokenList}
                              toggleTokenListModal={this.toggleTokenListModal}
                              tokensData={this.state.tokenData}
                              setSelectedToken={this.setSelectedToken}
                            />
                          </Context.Provider>
                        </div>
                        <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                          <button
                            type="button"
                            className="inline-flex space-x-2 items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() =>
                              this.setState({ openTokenList: true })
                            }
                          >
                            <img
                              className="w-6 h-6 rounded-full lg:w-8 lg:h-8"
                              src={this.state.selectedTokenData.logoURI}
                              alt=""
                            />
                            <div className="font-medium text-md leading-6 space-y-1">
                              <h3>{this.state.selectedTokenData.name}</h3>
                            </div>
                            <ChevronDownIcon
                              className="h-5 w-5 text-gray-500"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                        <div className="flex flex-row space-x-1">
                          <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                            <button
                              type="button"
                              className="disabled:bg-gray-300 inline-flex items-center px-2 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                              onClick={() => this.setState({ open: true })}
                            >
                              Sell Product/Service
                            </button>
                          </div>
                          <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                            <button
                              type="button"
                              className="disabled:bg-gray-300 inline-flex items-center px-2 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                              onClick={() =>
                                this.setState({ openSendDirect: true })
                              }
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-lg leading-6 font-medium text-gray-900">
                      Overview
                    </h2>
                    <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Card */}
                      {this.state.cards.map((card) => (
                        <div
                          key={card.name}
                          className="bg-white overflow-hidden shadow rounded-lg"
                        >
                          <div className="p-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <card.icon
                                  className="h-6 w-6 text-gray-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-sm font-medium text-gray-500 truncate">
                                    {card.name}
                                  </dt>
                                  <dd>
                                    <div className="text-lg font-medium text-gray-900">
                                      {card.count}
                                    </div>
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-5 py-3 ">
                            <div className="text-sm">
                              <a
                                href={card.href}
                                className="font-medium text-cyan-700 hover:text-cyan-900 flex justify-end "
                              >
                                {/* <EyeIcon
                              className="h-6 w-6 text-gray-400"
                              aria-hidden="true"
                            /> */}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <h2
                    className="flex flex-row justify-between max-w-6xl mx-auto mt-8 px-4 text-lg leading-6 font-medium text-gray-900 sm:px-6 lg:px-8"
                    onClick={() => printTable(this.state.transactions)}
                  >
                    <p>Recent activities</p>
                    <p>
                      <DownloadIcon
                        className="flex-shrink-0 h-6 w-6 text-pink-400 mr-5 cursor-pointer"
                        aria-hidden="true"
                      />
                    </p>
                  </h2>
                  {/* Activity list (smallest breakpoint only) */}
                  <div className="shadow sm:hidden">
                    {!this.state.loadingMain ? (
                      <ul className="mt-2 divide-y divide-gray-200 overflow-hidden shadow sm:hidden">
                        {this.state.transactions.map(
                          (transaction: Activity, i: number) => (
                            <li key={i}>
                              <a
                                href={transaction.href}
                                className="block px-5 py-4 bg-white hover:bg-gray-50"
                                target="_blank"
                                rel="noreferrer"
                              >
                                <span className="flex items-center space-x-4">
                                  <span className="flex-1 flex space-x-2 truncate">
                                    <CubeIcon
                                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    <span className="flex flex-col text-gray-500 text-sm">
                                      <span className="truncate">
                                        {transaction.paymentInfo}
                                      </span>
                                      <span className="truncate text-gray-900 font-medium">
                                        {transaction.title}
                                      </span>
                                      <span>
                                        <span className="text-gray-900 font-medium">
                                          {transaction.amount}
                                        </span>
                                        {transaction.currency}
                                      </span>
                                      <span>
                                        {moment
                                          .unix(
                                            parseInt(transaction.withDrawdate)
                                          )
                                          .format("DD MMM YYYY hh:mm a")}
                                      </span>
                                      <span
                                        className={classNames(
                                          statusStyles[transaction.status],
                                          "flex justify-center w-[8rem] px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                                        )}
                                      >
                                        {
                                          StatusData[
                                            transaction.status as keyof typeof StatusData
                                          ]
                                        }
                                        {Number(transaction.status) ===
                                        Status.OpenDispute ? (
                                          <a
                                            href={`mailto:test@gmail.com?subject=Transaction ${transaction.id} - ${transaction.title}`}
                                          >
                                            <ExternalLinkIcon
                                              className="h-4 w-4 cursor-pointer"
                                              aria-hidden="true"
                                            />
                                          </a>
                                        ) : null}
                                      </span>
                                    </span>
                                  </span>
                                  <ChevronRightIcon
                                    className="flex-shrink-0 h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </span>
                              </a>
                            </li>
                          )
                        )}
                        {!this.state.transactions.length ? (
                          <li key={0}>
                            <span className="flex justify-center items-center bg-white h-20">
                              <p>No transactions yet</p>
                            </span>
                          </li>
                        ) : null}
                      </ul>
                    ) : (
                      <div className="lds-ellipsis">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    )}
                    {this.state.transactions.length ? (
                      <nav
                        className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200"
                        aria-label="Pagination"
                      >
                        <div className="flex-1 flex justify-between">
                          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:text-gray-500">
                            Previous
                          </button>
                          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:text-gray-500">
                            Next
                          </button>
                        </div>
                      </nav>
                    ) : null}
                  </div>

                  {/* Activity table (small breakpoint and up) */}
                  <div className="hidden sm:block">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex flex-col mt-2">
                        <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
                          {!this.state.loadingMain ? (
                            <>
                              <table className="min-w-full divide-y divide-gray-200 bg-white">
                                <thead>
                                  <tr>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      ID
                                    </th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Transaction
                                    </th>
                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Name
                                    </th>
                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                                      Status
                                    </th>
                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Withdrawal Date
                                    </th>
                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Doc/Image
                                    </th>

                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                  </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                  {this.state.transactions.map(
                                    (transaction: Activity, i: number) => (
                                      <tr key={i} className="bg-white">
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                                          <span className="text-gray-500">
                                            {transaction.id}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900">
                                          <div className="flex">
                                            <a
                                              href={transaction.href}
                                              className="group inline-flex space-x-2 truncate text-sm"
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <CubeIcon
                                                className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                                aria-hidden="true"
                                              />
                                              {transaction.paymentInfo}
                                            </a>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                                          <span className="text-gray-500">
                                            {transaction.title}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                                          <span className="text-gray-900 font-medium">
                                            {transaction.amount}
                                          </span>
                                          {transaction.currency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          <span
                                            className={classNames(
                                              statusStyles[transaction.status],
                                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                                            )}
                                          >
                                            {
                                              StatusData[
                                                transaction.status as keyof typeof StatusData
                                              ]
                                            }

                                            {Number(transaction.status) ===
                                            Status.OpenDispute ? (
                                              <a
                                                href={`mailto:test@bgmail.com?subject=Transaction ${transaction.id} - ${transaction.title}`}
                                              >
                                                <ExternalLinkIcon
                                                  className="h-4 w-4 cursor-pointer"
                                                  aria-hidden="true"
                                                />
                                              </a>
                                            ) : null}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                                          <span>
                                            {moment
                                              .unix(
                                                parseInt(
                                                  transaction.withDrawdate
                                                )
                                              )
                                              .format("DD MMM YYYY hh:mm a")}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-center whitespace-nowrap text-sm text-gray-500">
                                          {transaction.fileType ? (
                                            <span>
                                              <DocumentDownloadIcon
                                                className="h-10 w-10 cursor-pointer"
                                                aria-hidden="true"
                                                onClick={() =>
                                                  this.downloadBase64File(
                                                    transaction.file,
                                                    transaction.fileType
                                                  )
                                                }
                                              />
                                            </span>
                                          ) : null}
                                        </td>

                                        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                                          <Menu
                                            as="div"
                                            className=" ml-3 relative inline-block text-left"
                                          >
                                            {this.openHideMenuButton(
                                              Number(transaction.status),
                                              transaction.isPayment,
                                              this.state.account,
                                              this.state.magiar
                                            ) ? (
                                              <Menu.Button className="z-10 -my-2 p-2 rounded-full bg-white flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                                <span className="sr-only">
                                                  Open options
                                                </span>
                                                <DotsVerticalIcon
                                                  className="h-5 w-5"
                                                  aria-hidden="true"
                                                />
                                              </Menu.Button>
                                            ) : null}

                                            <Transition
                                              as={Fragment}
                                              enter="transition ease-out duration-100"
                                              enterFrom="transform opacity-0 scale-95"
                                              enterTo="transform opacity-100 scale-100"
                                              leave="transition ease-in duration-75"
                                              leaveFrom="transform opacity-100 scale-100"
                                              leaveTo="transform opacity-0 scale-95"
                                            >
                                              <Menu.Items className="z-40 origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <div className="py-1">
                                                  {this.checkIfMagiar(
                                                    this.state.account,
                                                    this.state.magiar
                                                  ) ? (
                                                    <Menu.Item>
                                                      <span
                                                        className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                                                        onClick={(e: any) =>
                                                          setTimeout(() => {
                                                            this.setCancelOpenDispute(
                                                              e,
                                                              transaction
                                                            );
                                                          })
                                                        }
                                                      >
                                                        CancelOpenDispute
                                                        (Admin)
                                                      </span>
                                                    </Menu.Item>
                                                  ) : null}
                                                  {this.checkIfMagiar(
                                                    this.state.account,
                                                    this.state.magiar
                                                  ) ? (
                                                    <Menu.Item>
                                                      <span
                                                        className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                                                        onClick={(e: any) =>
                                                          setTimeout(() => {
                                                            this.setCompleteOpenDispute(
                                                              e,
                                                              transaction
                                                            );
                                                          })
                                                        }
                                                      >
                                                        CompleteOpenDispute
                                                        (Admin)
                                                      </span>
                                                    </Menu.Item>
                                                  ) : null}
                                                  {(!transaction.isPayment &&
                                                    Number(
                                                      transaction.status
                                                    ) === Status.Delivered) ||
                                                  Number(transaction.status) ===
                                                    Status.CompletedOpenDispute ? (
                                                    <Menu.Item>
                                                      <span
                                                        className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                                                        onClick={(e: any) =>
                                                          setTimeout(() => {
                                                            transaction.currency ===
                                                            TokenName.BNB
                                                              ? this.withDrawSellerBNB(
                                                                  e,
                                                                  transaction
                                                                )
                                                              : this.withDrawSeller(
                                                                  e,
                                                                  transaction
                                                                );
                                                          })
                                                        }
                                                      >
                                                        Withdraw
                                                        {this.checkMaturityTimeAndStatus(
                                                          transaction
                                                        ) ? (
                                                          <BanIcon className="h-6 h-6" />
                                                        ) : null}
                                                      </span>
                                                    </Menu.Item>
                                                  ) : null}
                                                  {(transaction.isPayment &&
                                                    Number(
                                                      transaction.status
                                                    ) === Status.Canceled) ||
                                                  Number(transaction.status) ===
                                                    Status.CanceledOpenDispute ? (
                                                    <Menu.Item>
                                                      <span
                                                        className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                                                        onClick={(e: any) =>
                                                          setTimeout(() => {
                                                            transaction.currency ===
                                                            TokenName.BNB
                                                              ? this.withDrawCustomerBNB(
                                                                  e,
                                                                  transaction
                                                                )
                                                              : this.withDrawCustomer(
                                                                  e,
                                                                  transaction
                                                                );
                                                          })
                                                        }
                                                      >
                                                        Withdraw
                                                        {this.checkMaturityTimeAndStatus(
                                                          transaction
                                                        ) ? (
                                                          <BanIcon className="h-6 h-6" />
                                                        ) : null}
                                                      </span>
                                                    </Menu.Item>
                                                  ) : null}
                                                  {transaction.isPayment &&
                                                  Number(transaction.status) ===
                                                    Status.InProgress ? (
                                                    <Menu.Item>
                                                      <span
                                                        className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                                                        onClick={(e: any) =>
                                                          setTimeout(() => {
                                                            transaction.currency ===
                                                            TokenName.BNB
                                                              ? this.sendBNBToSellerWithEscrow(
                                                                  e,
                                                                  transaction
                                                                )
                                                              : this.sendTokenToSellerWithEscrow(
                                                                  e,
                                                                  transaction
                                                                );
                                                          })
                                                        }
                                                      >
                                                        Pay
                                                      </span>
                                                    </Menu.Item>
                                                  ) : null}
                                                  {transaction.isPayment &&
                                                  Number(transaction.status) ===
                                                    Status.Paid &&
                                                  this.checkMaturityTimeAndStatus(
                                                    transaction
                                                  ) ? (
                                                    <Menu.Item>
                                                      <span
                                                        className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                                                        onClick={(e: any) =>
                                                          setTimeout(() => {
                                                            this.confirmReceiptTheCustomer(
                                                              e,
                                                              transaction
                                                            );
                                                          })
                                                        }
                                                      >
                                                        Confirm
                                                      </span>
                                                    </Menu.Item>
                                                  ) : null}
                                                  {Number(
                                                    transaction.status
                                                  ) === Status.InProgress ? (
                                                    <Menu.Item>
                                                      <span
                                                        className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                                                        onClick={(e: any) =>
                                                          setTimeout(() => {
                                                            this.cancelOrder(
                                                              e,
                                                              transaction
                                                            );
                                                          })
                                                        }
                                                      >
                                                        Cancel
                                                      </span>
                                                    </Menu.Item>
                                                  ) : null}
                                                  {Number(
                                                    transaction.status
                                                  ) === Status.Paid &&
                                                  transaction.isPayment ? (
                                                    <Menu.Item>
                                                      <span
                                                        className="flex justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                                                        onClick={(e: any) =>
                                                          setTimeout(() => {
                                                            this.openDispute(
                                                              e,
                                                              transaction
                                                            );
                                                          })
                                                        }
                                                      >
                                                        OpenDispute
                                                      </span>
                                                    </Menu.Item>
                                                  ) : null}
                                                </div>
                                              </Menu.Items>
                                            </Transition>
                                          </Menu>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                  {!this.state.transactions.length ? (
                                    <tr key={0} className="bg-white">
                                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500"></td>
                                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500"></td>
                                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500"></td>
                                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500"></td>
                                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                                        <div>No transactions yet</div>
                                      </td>
                                    </tr>
                                  ) : null}
                                </tbody>
                              </table>
                              {this.state.txSucceed ? (
                                <TxDialog
                                  shortenHash={this.state.shortenHash}
                                  tx={this.state.tx}
                                  reloadPage={this.reloadPage}
                                />
                              ) : null}
                            </>
                          ) : (
                            <div className="container md: w-full flex justify-center">
                              <div className="lds-ellipsis px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                              </div>
                            </div>
                          )}
                          {this.state.loading ? <Loading /> : null}
                          {/* Pagination */}
                          <nav
                            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
                            aria-label="Pagination"
                          >
                            <div className="hidden sm:block">
                              <p className="text-sm text-gray-700">
                                Page
                                <span className="font-medium pl-1 pr-1">
                                  {this.state.pageNumber}
                                </span>
                                to
                                <span className="font-medium pl-1 pr-1">
                                  {this.state.maxPageNumber}
                                </span>
                              </p>
                            </div>
                            <div className="flex-1 flex justify-between sm:justify-end">
                              <button
                                className="relative disabled:bg-gray-50 disabled:border-gray-50 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 "
                                onClick={this.prev}
                                disabled={
                                  this.state.prevCount === 0 ? true : false
                                }
                              >
                                Previous
                              </button>
                              <button
                                className="ml-3 relative disabled:bg-gray-50 disabled:border-gray-50 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                onClick={this.next}
                                disabled={
                                  this.state.pageNumber ===
                                  Math.ceil(
                                    this.state.allTransactions.length / 20
                                  )
                                    ? true
                                    : false
                                }
                              >
                                Next
                              </button>
                            </div>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </>
      </React.Fragment>
    );
  }
}
