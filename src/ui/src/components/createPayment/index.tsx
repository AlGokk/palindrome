/* This example requires Tailwind CSS v2.0+ */
import {
  ClipboardCopyIcon,
  CreditCardIcon,
  PlusCircleIcon,
} from "@heroicons/react/outline";
import { PlusIcon } from "@heroicons/react/solid";
import { Menu } from "@headlessui/react";

import { useEffect, useState } from "react";
import { PalindromeConnect } from "../../sdk/components/connect";
import { ConnectionInstance, IAuthInstance, IInit } from "../helper";
import { PalindromeCreatePayment } from "../../sdk";
import { IGetPaymentDetails } from "../../sdk/shared/helper";
import Loading from "../loading";
declare var window: any;

export default function CreatePayment() {
  const [loading, setloading] = useState(false);
  const [auth, setAuth] = useState<IAuthInstance>();
  const [account, setAccount] = useState("");
  const [paymentSystemUID, setPaymentSystemUID] = useState("");
  const [orderBookUID, setOrderBookUID] = useState("");
  const [shortenPaymentSystemUID, setShortenPaymentSystemUID] = useState("");
  const [shortenOrderBookUID, setShortenOrderBookUID] = useState("");
  const [shortenAccount, setShortenAccount] = useState("");
  const [effectPayUID, setEffectPayUID] = useState(false);
  const [effectOrderUID, setEffectOrderUID] = useState(false);
  const defaultAddress = "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    const login = async () => {
      const auth: any | undefined = await loginDesktop();
      setAuth(auth);
      await getPaymentDetails(auth?.account, auth?.signer);
    };
    login();
  }, []);

  const checkNetwork = async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (currentChainId) return currentChainId;
    }
  };
  const loginMetamask = async () => {
    const currentChainID = await checkNetwork();
    const opt = {
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
  const loginDesktop = async () => {
    console.log("loginDesktop..");
    const { status, auth } = await loginMetamask();
    if (status && auth?.account && auth?.signer && auth?.provider) {
      localStorage.setItem("account", auth.account);
      const shortenAccount = await shortenAddress(auth.account);
      setAccount(auth.account);
      setShortenAccount(shortenAccount);

      window.ethereum.on("accountsChanged", async (accounts: any) => {
        if (accounts.length) {
          console.log("Account changed..");
          setAccount(account[0]);
          localStorage.setItem("account", accounts[0]);
          window.location.reload();
        } else {
          console.log("Disconnect..");
          await reloadPage();
        }
      });
      window.ethereum.on("chainChanged", async (chainId: any) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        localStorage.clear();
        await reloadPage();
      });
      return auth;
    } else {
      setloading(false);
      setAccount("");
    }
  };

  const reloadPage = async () => {
    window.location.reload();
  };

  const shortenAddress = async (account: string) => {
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

  const getPaymentDetails = async (account: string, signer: any) => {
    try {
      if (account) {
        const args: any = {
          signer: signer,
        };
        const data: IGetPaymentDetails =
          await PalindromeCreatePayment.getPaymentDetails(args);
        setPaymentSystemUID(data.paymentSystemUID);
        setOrderBookUID(data.orderBookUID);
        const payUID = await shortenAddress(data.paymentSystemUID);
        setShortenPaymentSystemUID(payUID);
        const orderUID = await shortenAddress(data.paymentSystemUID);
        setShortenOrderBookUID(orderUID);
      } else {
        console.log("CreatePaymentSystem: not loggedIn");
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  const createPaymentSystem = async (e: any, account: any, signer: any) => {
    e.preventDefault();
    try {
      if (account) {
        setloading(true);
        const args: IInit = {
          signer: signer,
        };
        const status = await PalindromeCreatePayment.init(args);
        if (status) {
          console.log("CreatePaymentSystem: Payment System created...");
          setloading(false);
        } else {
          console.log("CreatePaymentSystem: Not able to create merchant..");
          setloading(false);
        }
      } else {
        console.log("CreatePaymentSystem: not loggedIn");
        setloading(false);
      }
    } catch (err: any) {
      setloading(false);
      console.log(err);
    }
  };

  const copyClipboard = async (e: any, account: string) => {
    e.preventDefault();
    if (account) {
      await navigator.clipboard.writeText(account);
    }
  };

  return (
    <>
      <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none">
        <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="flex items-center flex-shrink-0 px-4">
            <img
              className="h-12 w-auto"
              src="/logo-palindrome-crypto-escrow.png"
              alt="Palindrome Crypto Escrow Service"
            />
          </div>
          <div className="flex items-center ">
            {account ? (
              <Menu as="div" className="ml-1 relative">
                <div>
                  <Menu.Button className="max-w-xs bg-white rounded-md flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 py-1 px-2">
                    <img className="h-8 w-8 " src="/wallet.png" alt="" />
                    <span className="ml-2 text-gray-700 text-sm font-medium lg:block">
                      {shortenAccount}
                    </span>
                  </Menu.Button>
                </div>
              </Menu>
            ) : (
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button
                    className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 lg:p-2 lg:rounded-md lg:hover:bg-gray-50"
                    onClick={loginDesktop}
                  >
                    <img className="h-8 w-8 " src="/wallet.png" alt="" />
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
      <div className="md:container md:mx-auto text-center">
        <h1 className="p-10 text-2xl font-bold leading-7 text-gray-600">
          Create Crypto Payment
        </h1>
      </div>
      <div className="md:container md:mx-auto flex justify-center">
        <div className="w-5/6 flex items-center justify-center bg-white pt-5 pb-5 rounded-lg">
          <div className="w-full border-2 border-gray-300 ml-5 mr-5 p-1 border-dashed rounded-lg">
            <div className="text-center sm:p-5">
              <div className="inline-flex items-center">
                <PlusCircleIcon
                  className="-ml-1 mr-2 h-10 w-10 stroke-gray-400"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new Crypto Payment System.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={paymentSystemUID !== defaultAddress ? true : false}
                  onClick={(e: any) =>
                    createPaymentSystem(e, auth?.account, auth?.signer)
                  }
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Crypto Payment
                </button>
              </div>
            </div>
            <div className="mt-10 space-y-10 pt-5 pb-10 pl-5 pl-5 border-2 border-gray-300 border-dashed rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 flex flex-row  justify-center">
                <CreditCardIcon
                  className="-ml-1 mr-2 h-5 w-5"
                  aria-hidden="true"
                />
                PaymentSystemUID {shortenPaymentSystemUID}
                <div
                  id="copy"
                  className="flex text-sm text-gray-200 font-medium capitalize sm:mr-3 cursor-pointer"
                  onClick={(e: any) => copyClipboard(e, paymentSystemUID)}
                  key={0}
                >
                  <ClipboardCopyIcon
                    className={`${
                      effectPayUID && "animate-ping"
                    } flex-shrink-0 ml-1.5 h-5 w-5 text-gray-800`}
                    aria-hidden="true"
                    onClick={() => {
                      setEffectPayUID(true);
                      setTimeout(() => {
                        setEffectPayUID(false);
                      }, 1000);
                    }}
                  />
                </div>
              </h3>
              <h3 className="text-sm font-medium text-gray-900 flex flex-row justify-center">
                <CreditCardIcon
                  className="-ml-1 mr-2 h-5 w-5"
                  aria-hidden="true"
                />
                OrderBookUID {shortenOrderBookUID}
                <div
                  id="copy"
                  className="flex text-sm text-gray-200 font-medium capitalize sm:mr-3 cursor-pointer"
                  onClick={(e: any) => copyClipboard(e, orderBookUID)}
                  key={1}
                >
                  <ClipboardCopyIcon
                    className={`${
                      effectOrderUID && "animate-ping"
                    } flex-shrink-0 ml-1.5 h-5 w-5 text-gray-800`}
                    aria-hidden="true"
                    onClick={() => {
                      setEffectOrderUID(true);
                      setTimeout(() => {
                        setEffectOrderUID(false);
                      }, 1000);
                    }}
                  />
                </div>
              </h3>
            </div>
          </div>
        </div>
      </div>
      {loading ? <Loading /> : null}
    </>
  );
}
