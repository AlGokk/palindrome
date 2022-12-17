import { useState, createRef, useContext } from "react";
import { ethers } from "ethers";
import { CheckCircleIcon, ExternalLinkIcon } from "@heroicons/react/outline";
import spinner from "../shared/spinner.svg";
import Context from "../Context";
import { getAddress, ITokenData, ISendDirect } from "../helper";
import { PalindromeSend } from "../../sdk";
import { ISentDirect } from "../../sdk/shared/helper";

export default function SendDirectInner({ setOpenSendDirect }: any) {
  const [errors, setErrors] = useState<any>({});
  const [valid, setValid] = useState<any>({});
  const [txSucceed, setTxSucceed] = useState(false);
  const [tx, setTx] = useState("");
  const [shortenAddress, setShortenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const inputAmountRefAmount = createRef<HTMLInputElement>();
  interface IContext {
    account: string;
    provider: any;
    signer: any;
    shortenAddress(account: string): string;
    selectedTokenData: ITokenData;
  }

  const enum TokenName {
    BNB = "BNB",
    DAI = "DAI",
  }

  const context = useContext<IContext>(Context);

  const checkIsAddress = async (event: any) => {
    const errors: any = {};
    const input = event.target?.value || event.target["recipient"]?.value;
    if (event.target && ethers.utils.isAddress(input)) {
      setErrors("");
      valid["recipient"] = true;
      setValid(valid);
      return true;
    } else {
      errors["recipient"] = "Invalid address";
      setErrors(errors);
      valid["recipient"] = false;
      setValid(valid);
      setTimeout(() => {
        setErrors("");
      }, 3000);
      return false;
    }
  };
  const reloadPage = async () => {
    setOpenSendDirect(false);
    window.location.reload();
  };
  const isNumeric = (input: any) => {
    if (!isNaN(input)) {
      return true;
    } else {
      inputAmountRefAmount.current!.value = "";
    }
  };

  const onChangeAmount = (e: any) => {
    const value = e.target.value;

    if (isNumeric(value)) {
      inputAmountRefAmount.current!.value = value.replace(/,/g, ".");
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const valid = await handleValidation(event);
    if (valid) {
      const { recipient, title, amount } = event.target;

      const args: ISendDirect = {
        recipient: recipient.value.replace(/\s+/g, ""),
        title: title.value,
        amount: amount.value.replace(/\s+/g, ""),
        selectedToken: context.selectedTokenData.address,
        currency: context.selectedTokenData.symbol,
      };

      if (args.currency === TokenName.BNB) {
        await sendDirectBNB(args);
      } else {
        await sendDirectToken(args);
      }

      setLoading(false);
    }
  };

  const sendDirectToken = async (args: any) => {
    if (context.account && context.signer) {
      const recipient = getAddress(args.recipient);
      const from = getAddress(context.account);

      if (from === recipient) {
        alert("Not allowed to send yourself");
        return;
      }

      const argsPass: ISentDirect = {
        token: args.selectedToken,
        to: getAddress(args.recipient),
        orderBookUID: getAddress(process.env.REACT_APP_ORDERBOOK_UID!),
        amount: args.amount,
        title: args.title,
        signer: context.signer,
      };
      try {
        setLoading(true);
        const { status, tx }: { status: boolean; tx: any } =
          await PalindromeSend.sendTokenWithoutEscrow(argsPass);
        const shortenAddress = await context.shortenAddress(tx.hash);
        setTx(tx.hash);
        setShortenAddress(shortenAddress);
        if (status) {
          setTxSucceed(true);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("createOrder: Not loggedIn");
      errors["info"] = "Not logged in..";
      setErrors(errors);
    }
  };

  const sendDirectBNB = async (args: any) => {
    if (context.account && context.signer) {
      const recipient = getAddress(args.recipient);
      const from = getAddress(context.account);

      if (from === recipient) {
        alert("Not allowed to send yourself");
        return;
      }

      const argsPass: ISentDirect = {
        token: args.selectedToken,
        to: getAddress(args.recipient),
        orderBookUID: getAddress(process.env.REACT_APP_ORDERBOOK_UID!),
        amount: args.amount,
        title: args.title,
        signer: context.signer,
      };
      try {
        setLoading(true);
        const { status, tx }: { status: boolean; tx: any } =
          await PalindromeSend.sendBNBToSellerWithoutEscrow(argsPass);
        const shortenAddress = await context.shortenAddress(tx.hash);
        setTx(tx.hash);
        setShortenAddress(shortenAddress);
        if (status) {
          setTxSucceed(true);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("createOrder: Not loggedIn");
      errors["info"] = "Not logged in..";
      setErrors(errors);
    }
  };

  const handleValidation = async (event: any) => {
    const input = event;
    let fields = input.target;
    let errors: any = {};
    let formIsValid = true;

    //Recipient
    if (!fields["recipient"].value) {
      formIsValid = false;
      errors["recipient"] = "Cannot be empty";
    }

    //Recipient
    const validAddress = await checkIsAddress(input);
    if (!validAddress) {
      formIsValid = false;
      errors["recipient"] = "Invalid address";
    }
    //Title
    if (!fields["title"].value) {
      formIsValid = false;
      errors["title"] = "Cannot be empty";
    }

    //Amount
    if (!fields["amount"].value) {
      formIsValid = false;
      errors["amount"] = "Cannot be empty";
    }

    //Amount
    if (!(fields["amount"].value > 0)) {
      formIsValid = false;
      errors["amount"] = "Amount must greater than 0";
    }

    setErrors(errors);
    setTimeout(() => {
      setErrors("");
    }, 3000);
    return formIsValid;
  };

  return (
    <form
      className="space-y-8 divide-y divide-gray-200"
      autoComplete="none"
      onSubmit={handleSubmit}
    >
      {!txSucceed ? (
        <>
          <div className="space-y-8">
            <div className="text-cyan-600">
              {!context.account ? <p>Not logged in</p> : null}
            </div>
            <div className="sm:block absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setOpenSendDirect(false)}
              >
                <span className="sr-only">Close</span>

                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {!loading ? (
              <div className="pt-8">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Send Direct
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The title is encrypted. Decentralized storage.
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="recipient"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Recipient Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="recipient"
                        id="recipient"
                        autoComplete="none"
                        autoCorrect="none"
                        autoCapitalize="none"
                        spellCheck="false"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        onChange={(event: any) => checkIsAddress(event)}
                        onKeyDown={(event: any) => checkIsAddress(event)}
                        placeholder="0x.."
                        maxLength={42}
                      />
                      {valid["recipient"] ? (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <CheckCircleIcon
                            className="h-5 w-5 text-green-400"
                            aria-hidden="true"
                          />
                        </div>
                      ) : (
                        ""
                      )}
                      <p className="mt-2 text-pink-600 text-sm">
                        {errors["recipient"]}
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Set a title for Transaction
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        autoComplete="none"
                        autoCorrect="none"
                        autoCapitalize="none"
                        spellCheck="false"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Alice Old Mac Os"
                        maxLength={48}
                      />
                      <p className="mt-2 text-pink-600 text-sm">
                        {errors["title"]}
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="amount"
                        id="amount"
                        inputMode="decimal"
                        ref={inputAmountRefAmount}
                        autoComplete="none"
                        autoCorrect="none"
                        autoCapitalize="none"
                        spellCheck="false"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        onKeyDown={(e: any) => onChangeAmount(e)}
                        onChange={(e: any) => onChangeAmount(e)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <label htmlFor="currency" className="sr-only">
                          Amount
                        </label>
                      </div>
                      <p className="mt-2 text-pink-600 text-sm">
                        {errors["amount"]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col justify-center pt-8">
                  <img
                    className="h-40 w-auto"
                    src={spinner}
                    alt="Palindrome Crypto Payment - Escrow Service"
                  />
                  Processing...
                </div>
              </>
            )}
          </div>
          {!loading ? (
            <>
              <div className="mt-1">
                <p className="mt-2 text-pink-600 text-sm">{errors["info"]}</p>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  disabled={context.account ? false : true}
                  type="submit"
                  className="disabled:bg-gray-300 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:col-start-2 sm:text-sm"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setOpenSendDirect(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : (
        <>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3
              className="text-lg leading-6 font-medium text-gray-900"
              id="modal-title"
            >
              Successfully send
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Your transactions was successfully send and can be found under
                Recent activities.
              </p>
              <a
                href={`https://testnet.snowtrace.io/tx/${tx}`}
                className="flex flex-row justify-center items-center py-4 text-lg font-bold text-[#ea580c] md:text-clip "
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLinkIcon
                  className="h-5 w-5 text-black-400"
                  aria-hidden="true"
                />
                {shortenAddress}
              </a>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={reloadPage}
            >
              Close
            </button>
          </div>
        </>
      )}
    </form>
  );
}
