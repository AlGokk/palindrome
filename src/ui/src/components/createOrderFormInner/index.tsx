import { useState, createRef, useContext } from "react";
import { ethers } from "ethers";
import { CheckCircleIcon, ExternalLinkIcon } from "@heroicons/react/outline";
import spinner from "../shared/spinner.svg";
import Context from "../Context";
import {
  getAddress,
  ITokenData,
  ICreateOrder,
  ICreateOrderArgs,
} from "../helper";
import { PalindromeOrder } from "../../sdk/components/main/order";

export default function CreateOrderFormInner({ setOpen }: any) {
  const [errors, setErrors] = useState<any>({});
  const [valid, setValid] = useState<any>({});
  const [txSucceed, setTxSucceed] = useState(false);
  const [tx, setTx] = useState("");
  const [shortenAddress, setShortenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const inputAmountRefAmount = createRef<HTMLInputElement>();
  const inputAmountRefMaturityTime = createRef<HTMLInputElement>();
  const [fileName, setFileName] = useState("");
  interface IContext {
    account: string;
    provider: any;
    signer: any;
    shortenAddress(account: string): string;
    selectedTokenData: ITokenData;
  }
  const context = useContext<IContext>(Context);

  // Returns uint
  // InProgress,  0
  // Paid,        1
  // Delivered,   2
  // Completed    3
  // Canceled,    4
  // NotDelivered 5

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
    setOpen(false);
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

  const isNumericMaturity = (input: any) => {
    if (!isNaN(input)) {
      return true;
    } else {
      inputAmountRefMaturityTime.current!.value = "";
    }
  };

  const onChangeAmountMaturity = (e: any) => {
    const value = e.target.value;

    if (isNumericMaturity(value)) {
      inputAmountRefMaturityTime.current!.value = value.replace(/,/g, ".");
    }
  };

  const createOrder = async (args: ICreateOrder) => {
    if (context.account && context.signer) {
      const recipient = getAddress(args.recipient);
      const account = getAddress(context.account);

      if (account === recipient) {
        alert("Not allowed to send yourself");
        return;
      }

      const argsPass: ICreateOrderArgs = {
        token: args.selectedToken,
        orderBookUID: getAddress(process.env.REACT_APP_ORDERBOOK_UID!),
        to: getAddress(args.recipient),
        amount: args.amount,
        title: args.title,
        maturityTime: args.maturityTime,
        file: args.file,
        signer: context.signer,
      };

      try {
        setLoading(true);
        const { status, tx }: any = await PalindromeOrder.createOrder(argsPass);
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

  const convertH2M = async (timeInHour: number) => {
    return Math.floor(timeInHour * 60);
  };

  const convertDayToMinutes = async (days: number) => {
    return days * 24 * 60;
  };

  const getTimeInMinutes = async (time: string, maturityTime: number) => {
    switch (time) {
      case "Minute(s)":
        return maturityTime;
      case "Hour(s)":
        return convertH2M(maturityTime);
      case "Day(s)":
        return convertDayToMinutes(maturityTime);
    }
  };

  const handleFiles = async (event: any) => {
    if (event.target.files !== undefined) {
      if (event.target.files[0].size <= 4097152) {
        const fileName = await event.target.files[0].name;
        setFileName(fileName);
      }
    } else {
      alert("Max allowed file size is 4MB");
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const valid = await handleValidation(event);
    if (valid) {
      const { recipient, title, amount, maturityTime, time, file_upload } =
        event.target;

      const maturitiyTimeVal = await getTimeInMinutes(
        time.value,
        maturityTime.value
      );

      const args: ICreateOrder = {
        recipient: recipient.value.replace(/\s+/g, ""),
        title: title.value,
        amount: amount.value.replace(/\s+/g, ""),
        selectedToken: context.selectedTokenData.address,
        maturityTime: maturitiyTimeVal!,
        file: file_upload.files[0],
      };

      await createOrder(args);
      setLoading(false);
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

    //maturityTime
    // if (!fields["maturityTime"].value) {
    //   formIsValid = false;
    //   errors["maturityTime"] = "Cannot be empty";
    // }

    //maturityTime
    // if (!(fields["maturityTime"].value >= 0)) {
    //   formIsValid = false;
    //   errors["maturityTime"] = "Amount must greater than 0";
    // }

    //file

    // if (!(fields["file_upload"].value !== "")) {
    //   formIsValid = false;
    //   errors["file_upload"] = "Please add a file";
    // }

    // //Email
    // if (fields["email"].value === "") {
    //   formIsValid = false;
    //   errors["email"] = "Cannot be empty";
    // }

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
                onClick={() => setOpen(false)}
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
                    Sell Products or Services with Escrow
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The title and image/doc is encrypted. Decentralized storage.
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
                      Product / Service Name
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
                        placeholder="IPhone S6 Old or Craftsman Joe"
                        maxLength={48}
                      />
                      <p className="mt-2 text-pink-600 text-sm">
                        {errors["title"]}
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Maturity Time (Optional)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="maturityTime"
                          id="maturityTime"
                          ref={inputAmountRefMaturityTime}
                          autoComplete="none"
                          autoCorrect="none"
                          autoCapitalize="none"
                          spellCheck="false"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g 1440 (minutes)"
                          onKeyDown={(e: any) => onChangeAmountMaturity(e)}
                          onChange={(e: any) => onChangeAmountMaturity(e)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <label htmlFor="currency" className="sr-only">
                            Time
                          </label>
                          <select
                            id="time"
                            name="time"
                            className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                          >
                            <option>Minute(s)</option>
                            <option>Hour(s)</option>
                            <option>Day(s)</option>
                          </select>
                        </div>
                      </div>
                      <p className="mt-2 text-pink-600 text-sm">
                        {errors["maturityTime"]}
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

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="doc"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Doc/Image (Optional)
                    </label>
                    <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-cyan-400 focus:outline-none">
                      <span className="flex items-center space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="font-medium text-gray-600">
                          Drop files to Attach, or
                          <span className="pl-1 text-blue-600 underline">
                            browse
                          </span>
                        </span>
                      </span>
                      <input
                        type="file"
                        name="file_upload"
                        id="file_upload"
                        className="hidden"
                        accept="application/pdf,application/vnd.ms-excel, image/jpeg, image/png, image/JPEG"
                        onChange={handleFiles}
                      />
                    </label>
                    <label className="truncate">{fileName}</label>
                    <p className="mt-2 text-pink-600 text-sm">
                      {errors["file_upload"]}
                    </p>
                  </div>

                  {/* <div classNameName="sm:col-span-6">
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700"
                    >
                      E-Mail Recipient (Optional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        autoComplete="none"
                        autoCorrect="none"
                        autoCapitalize="none"
                        spellCheck="false"
                        className="peer shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="@"
                        maxLength={64}
                      />
                      <p className="mt-2 text-pink-600 text-sm">
                        {errors["email"]}
                      </p>
                      <p className="mt-2 invisible peer-invalid:visible text-pink-600 text-sm">
                        Please provide a valid email address.
                      </p>
                    </div>
                  </div> */}
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
                  className="disabled:bg-gray-300  w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:col-start-2 sm:text-sm"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setOpen(false)}
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
              Successfully created
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Your order/service was added successfully and can be found under
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
