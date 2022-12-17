/* This example requires Tailwind CSS v2.0+ */
import { FaNetworkWired, FaBusinessTime } from "react-icons/fa";
import { BiNetworkChart } from "react-icons/bi";
import { MdHealthAndSafety } from "react-icons/md";
import { SiLetsencrypt } from "react-icons/si";
import { BsPersonCheckFill } from "react-icons/bs";
import { IoWallet } from "react-icons/io5";
import { HiReceiptTax } from "react-icons/hi";

const features = [
  {
    name: "Multichain Capability",
    icon: (
      <FaNetworkWired
        size={25}
        className="absolute h-6 w-6 text-cyan-500"
        aria-hidden="true"
      />
    ),
    description:
      "BNB, theGraph & Filecoin are in use. ETH/ETH2 & BSC & Oasis Network coming soon.",
  },
  {
    name: "Decentralized Web3Storage",
    icon: (
      <BiNetworkChart
        size={25}
        className="absolute h-6 w-6 text-cyan-500"
        aria-hidden="true"
      />
    ),
    description:
      "Secure and efficient with decentralized and distributed data storage.",
  },
  {
    name: "Crypto Escrow",
    icon: (
      <MdHealthAndSafety
        size={25}
        className="absolute h-6 w-6 text-cyan-500"
        aria-hidden="true"
      />
    ),
    description: `Protects Seller & Buyer against Fraud. 
    Receive Items/Services before Seller gets paid. 
      Open a Dispute if the product has not arrived.`,
  },
  {
    name: "Encrypted",
    icon: (
      <SiLetsencrypt
        size={25}
        className="absolute h-6 w-6 text-cyan-500"
        aria-hidden="true"
      />
    ),
    description: "Description, Image/Docs are encrypted.",
  },
  {
    name: "Palindrome Pay SDK for Business",
    icon: (
      <FaBusinessTime
        size={25}
        className="absolute h-6 w-6 text-cyan-500"
        aria-hidden="true"
      />
    ),
    description:
      "Create your Crypto Payment System and integrate it over the Palindrome Pay SDK into your commerce business.",
  },
  {
    name: "Crypto Escrow Service for Private",
    icon: (
      <BsPersonCheckFill
        size={25}
        className="absolute h-6 w-6 text-cyan-500"
        aria-hidden="true"
      />
    ),
    description:
      "Buy or Sell a Products/Services via Crypto Escrow Service or send a Transaction with Description (encrypted).",
  },
  {
    name: "Metamask & TrustWallet",
    icon: (
      <IoWallet
        size={25}
        className="absolute h-6 w-6 text-cyan-500"
        aria-hidden="true"
      />
    ),
    description: "Use decentralized Wallets like Metamask & TrustWallet.",
  },
  {
    name: "Fees & Rewards",
    icon: (
      <HiReceiptTax
        size={25}
        className="absolute h-6 w-6 text-cyan-500"
        aria-hidden="true"
      />
    ),
    description:
      "1% protocol fees which are still cheaper than the most existing payment systems like Visa & PayPal.",
  },
];

export default function Section() {
  return (
    <div className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-100">
            Advantages of Palindrome Crypto Pay
          </h2>
        </div>
        <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {features.map((feature) => (
            <div key={feature.name} className="relative">
              <dt>
                {feature.icon}
                <p className="ml-9 text-lg leading-6 font-medium text-gray-300">
                  {feature.name}
                </p>
              </dt>
              <dd className="mt-2 ml-9 text-base text-gray-400">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
