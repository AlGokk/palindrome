/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, useEffect, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FixedSizeList } from "react-window";
import { ethers } from "ethers";
import ERC20 from "../../artifacts/src/contracts/ERC20.sol/ERC20.json";
import { XIcon } from "@heroicons/react/solid";
import Context from "./../Context";
import { SearchCircleIcon } from "@heroicons/react/outline";

const imgDefault = "https://cdn-icons-png.flaticon.com/512/189/189665.png";

class Token {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly symbol: string,
    public readonly decimals: number,
    public readonly chainId: any,
    public readonly logoURI: string,
    public readonly custom?: boolean
  ) {}
}

interface IToken {
  name: string;
  address: string;
  symbol: string;
  decimals?: number;
  chainId?: number;
  logoURI: string;
  custom?: boolean;
}

export default function TokenListModal({
  openTokenList,
  toggleTokenListModal,
  tokensData,
  setSelectedToken,
}:any) {
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [searchVals, setSearchVals] = useState<IToken[]>([]);
  interface IContext {
    account: string;
    provider: any;
    signer: any;
  }
  const context = useContext<IContext>(Context);

  useEffect(() => {
    const token = window.localStorage.getItem("newTokenData");
    const tokenJSON = JSON.parse(token!);
    if (token && Object.keys(tokenJSON).length) {
      tokensData.push(tokenJSON);
    }

    setTokens(tokensData);
    setSearchVals(tokensData);
  }, [tokensData]);

  const importTokenData = async (e: any, tokenData: IToken) => {
    const newToken = new Token(
      tokenData.name,
      tokenData.address,
      tokenData.symbol,
      tokenData.decimals!,
      tokenData.chainId,
      imgDefault,
      false
    );
    window.localStorage.setItem("newTokenData", JSON.stringify(newToken));
    tokensData.push(newToken);
    setTokens(tokensData);
  };

  const getTokenLogoURL = async (address: string) => {
    return imgDefault;
  };

  const getAddress = async (addr: any) => {
    return ethers.utils.getAddress(addr);
  };
  const isAddress = async (addr: any) => {
    return ethers.utils.isAddress(addr);
  };

  const handleInput = async (e: any) => {
    e.preventDefault();
    console.log("INNNN");

    let inputVal = e.target.value.toString().toLowerCase();

    if (inputVal.startsWith("0x") && (await isAddress(inputVal))) {
      try {
        const tokenAddrVal = await getAddress(inputVal);

        const token = new ethers.Contract(
          tokenAddrVal,
          ERC20.abi,
          context.provider
        );

        const name = await token.name();
        const address = tokenAddrVal;
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const { chainId } = await context.provider.getNetwork();
        const logoURL = await getTokenLogoURL(inputVal);
        const newToken = new Token(
          name,
          address,
          symbol,
          decimals,
          chainId,
          logoURL,
          true
        ) as IToken;

        setTokens([newToken]);
      } catch (e: any) {
        console.log("Can not find token..");
        console.log(e);
      }
    } else {
      const res = searchVals.filter((item: any) => {
        return item.name.toLowerCase().includes(inputVal);
      });
      setTokens(res);
    }
  };

  return (
    <Transition.Root show={openTokenList} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={toggleTokenListModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-100 sm:p-6">
                <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={toggleTokenListModal}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div>
                  <div className=" my-8 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow focus-within:z-10">
                      <input
                        type="text"
                        name="text"
                        id="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-5 sm:text-sm border-gray-300"
                        placeholder="0x.."
                        onInput={handleInput}
                      />
                    </div>
                    <button
                      type="button"
                      className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <SearchCircleIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
                <div className="sm:flex sm:items-start">
                  <FixedSizeList
                    height={300}
                    width={350}
                    itemSize={50}
                    itemCount={tokens.length}
                    className="FixedSizeList"
                  >
                    {({ index, style }: any) => (
                      <div
                        className="hover:bg-sky-100 cursor-pointer"
                        key={tokens[index].name}
                        onClick={async () => setSelectedToken(tokens[index])}
                      >
                        <div className="flex items-center space-x-2 py-2 lg:space-x-2">
                          <img
                            className="w-6 h-6 rounded-full lg:w-8 lg:h-8"
                            src={tokens[index].logoURI}
                            alt=""
                          />
                          <div className="font-medium text-md leading-6 space-y-1">
                            <h3>{tokens[index].name}</h3>
                          </div>
                          {tokens[index].custom ? (
                            <button
                              className="bg-transparent justify-end hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                              onClick={(e: any) =>
                                importTokenData(e, tokens[index])
                              }
                            >
                              Import
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    )}
                  </FixedSizeList>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
