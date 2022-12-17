import { Fragment, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { ClipboardCopyIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import { ChevronRightIcon } from "@heroicons/react/solid";
import logoPalindromeCryptoEscrow from "./images/logoPalindromeCryptoEscrow.png";
import crypto_escrow_service from "./images/crypto_escrow_service.svg";
import bsc_logo from "./images/bsc-logo.png";
import bluecyan from "./images/blur-cyan.png";
import blurindigo from "./images/blur-indigo.png";
import thegraph_crypto_pay from "./images/thegraph_crypto_pay.png";
import filecoin_crypto_pay from "./images/filecoin_crypto_pay.png";
import Section from "./section";
import { FaQuestionCircle, FaGithubSquare } from "react-icons/fa";
import FAQ from "../faq";

const navigation = [
  {
    name: "FAQs",
    icon: <FaQuestionCircle size={25} />,
    href: "#faqs",
  },
  {
    name: "Github",
    icon: <FaGithubSquare size={25} />,
    href: "https://github.com/palindrome",
  },
];

export default function Start() {
  const [effect, setEffect] = useState(false);
  const copyClipboard = () => {
    navigator.clipboard.writeText("0x11251b6ea8f367C340b05380E58358f66EBB053a");
  };

  return (
    <>
      <div className="start relative  overflow-hidden bg-gray-800">
        <img
          alt=""
          src={bluecyan}
          width="537"
          height="537"
          decoding="async"
          data-nimg="future"
          className="absolute bottom-full right-full -mr-72 -mb-56"
        />
        <img
          alt=""
          src={bluecyan}
          width="537"
          height="537"
          decoding="async"
          data-nimg="future"
          className="absolute -top-74 -right-64"
        />
        <img
          alt=""
          src={blurindigo}
          width="567"
          height="567"
          decoding="async"
          data-nimg="future"
          className="absolute -bottom-5 -right-44"
        ></img>
        <div
          className="hidden sm:block sm:absolute sm:inset-0"
          aria-hidden="true"
        >
          <svg
            className="absolute bottom-0 right-0 transform translate-x-1/2 mb-48 text-gray-700 lg:top-0 lg:mt-28 lg:mb-0 xl:transform-none xl:translate-x-0"
            width={364}
            height={384}
            viewBox="0 0 364 384"
            fill="none"
          >
            <defs>
              <pattern
                id="eab71dd9-9d7a-47bd-8044-256344ee00d0"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect x={0} y={0} width={4} height={4} fill="currentColor" />
              </pattern>
            </defs>
          </svg>
        </div>

        <div className="relative pt-6 pb-16 sm:pb-24">
          <Popover>
            <nav
              className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
              aria-label="Global"
            >
              <div className="flex items-center flex-1">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <a href="#">
                    <img
                      className="h-14 w-auto"
                      src={logoPalindromeCryptoEscrow}
                      alt="Crypto Pay"
                    />
                  </a>
                  <div className="-mr-2 flex items-center md:hidden">
                    <Popover.Button className="bg-gray-800 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      <MenuIcon className="h-6 w-6" aria-hidden="true" />
                    </Popover.Button>
                  </div>
                </div>
              </div>
              <div className="hidden space-x-5 md:flex md:ml-10 mr-10">
                {navigation.map((item, i) => (
                  <>
                    {item.name === "FAQs" ? (
                      <a
                        key={i}
                        href="#faqs"
                        className="font-xl text-white hover:text-cyan-300 cursor-pointer"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <a
                        key={item.name}
                        href={item.href}
                        className="font-xl text-white hover:text-cyan-300 cursor-pointer"
                      >
                        {item.icon}
                      </a>
                    )}
                  </>
                ))}
              </div>
            </nav>

            <Transition
              as={Fragment}
              enter="duration-150 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-100 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Popover.Panel
                focus
                className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
              >
                <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                  <div className="px-5 pt-4 flex items-center justify-between">
                    <div>
                      <img
                        className="h-10 w-auto"
                        src={logoPalindromeCryptoEscrow}
                        alt="Crypto Pay"
                      />
                    </div>
                    <div className="-mr-2">
                      <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                        <span className="sr-only">Close menu</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                  <div className="px-2 pt-2 pb-3 flex justify-center">
                    <div className="space-y-3">
                      {navigation.map((item, i) => (
                        <a
                          key={i}
                          href={item.href}
                          className="flex items-center font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <div className="mr-2 p-2">{item.icon}</div>
                          <div className="text-start">{item.name}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <a
                    href="/crypto_escrow"
                    className="block w-full px-5 py-3 text-center font-medium text-indigo-600 bg-gray-50 hover:bg-gray-100"
                  >
                    Launch App
                  </a>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>

          <main className="mt-16 sm:mt-24">
            <div className="relative max-w-7xl mx-auto flex items-center justify-between px-4 ">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <div className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
                  <div>
                    <a
                      href="#"
                      className="inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base hover:text-gray-200"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="px-3 py-0.5 text-white text-center text-xs font-semibold leading-5 uppercase tracking-wide bg-cyan-500 rounded-full">
                        Crypto Pay SDK Doc
                      </span>
                      <span className="ml-4 text-sm text-center">
                        Start Building
                      </span>
                      <ChevronRightIcon
                        className="ml-2 w-5 h-5 text-gray-500"
                        aria-hidden="true"
                      />
                    </a>
                    <h1 className=" mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                      <span className="typeout ">Crypto Pay</span>
                      <br />
                      <span className="text-cyan-300 md:inline-flex text-3xl pt-2">
                        with Escrow System
                      </span>
                    </h1>
                    <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl break-normal">
                      Decentralized Crypto Payment System for your Business
                    </p>

                    <div className="md:flex mt-10">
                      <a
                        href="crypto_escrow"
                        className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Crypto Escrow
                      </a>
                    </div>
                    <div className="flex flex-row mt-10  justify-center lg:justify-start">
                      <div
                        id="copy"
                        className="flex text-sm text-gray-200 font-medium capitalize sm:mr-3 cursor-pointer"
                        onClick={copyClipboard}
                      >
                        0x11251b...58f66EBB053a
                        <ClipboardCopyIcon
                          className={`${
                            effect && "animate-ping"
                          } flex-shrink-0 ml-1.5 h-5 w-5 text-gray-300`}
                          aria-hidden="true"
                          onClick={() => {
                            setEffect(true);
                            setTimeout(() => {
                              setEffect(false);
                            }, 1000);
                          }}
                        />
                      </div>
                    </div>
                    <p className="mt-12 text-left text-sm text-white uppercase tracking-wide font-semibold sm:mt-10">
                      Built on
                    </p>
                    <div className="w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                      <div className="flex flex-wrap items-start space-x-2 mt-2">
                        <div className="flex justify-center">
                          <img
                            className="w-auto h-9 sm:h-9 md:h-10 "
                            src={bsc_logo}
                            alt="avalanche blockchain avax crypto escrow"
                          />
                        </div>
                        {/* <div className="flex justify-center">
                          <img
                            className="w-auto h-9 sm:h-9 md:h-10"
                            src={chainlink_crypto_pay}
                            alt="chainlink crypto escrow service"
                          />
                        </div> */}
                        <div className="flex justify-center">
                          <img
                            className="w-auto h-9 sm:h-9 md:h-10"
                            src={thegraph_crypto_pay}
                            alt="theGraph crypto"
                          />
                        </div>
                        <div className="flex justify-center">
                          <img
                            className="w-auto h-9 sm:h-9 md:h-10"
                            src={filecoin_crypto_pay}
                            alt="filecoin crypto blockchain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-18 sm:mt-24 lg:mt-0 lg:col-span-6">
                  <div className="imgObject">
                    <img
                      src={crypto_escrow_service}
                      alt="crypto_escrow_service"
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Section key={1} />
      <div id="faqs">
        <FAQ key={2} />
      </div>
    </>
  );
}
