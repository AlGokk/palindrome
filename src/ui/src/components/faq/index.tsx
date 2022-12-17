/* This example requires Tailwind CSS v2.0+ */
import { useState } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
const classNames = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

const faqs = [
  {
    question: "What is Palindrome Pay?",
    answer:
      "Palindrome Pay is a decentralized crypto payment system with decentralized storage & escrow system.<br/> Each merchant is able to create a payment system and integrate the Palindrome Pay SDK into their online shop or other commerce platforms to provide cryptocurrencies as payment to their customers.",
  },
  {
    question:
      "What are the use cases for the Palindrome Pay Crypto Escrow Service?",
    answer: `
<ul>
<li class="p-2">
 <p class="pt-2 pb-2"> The Palindrome Pay Crypto Escrow Service is versatile like a Swiss Army Knife 🇨🇭 </p>
  <h3 class="font-bold">Commerce</h3>
  Commerce - Buy and sell products with Escrow Service. The title and doc/image are military-grade encrypted.
  </li>
<li class="p-2 pt-2">
  <h3 class="font-bold">
    Payroll
  </h3>
Every country, state, or city can have its own (tax)-laws for payrolls. It can be very complicated to cover everything on a platform and often the training of employees is necessary.<br/>
Most people already know how MS-Office works and there are hundreds of payroll templates for free on the internet. <br/>
Over the Palindrome Crypto Escrow System, a freelancer for example is able to upload an Excel, CSV, or PDF file with a description (encrypted) which can be sent to the employer, and on the other side, the employer can just check the documents and approve it and trigger the payment. </li>
 </ul>
`,
  },
  {
    question: "How the Palindrome Crypto Escrow Service works?",
    answer: `<div>
<ul class="p-2">
1 - The seller creates a product/service on www.palindrome.finance/crypto_escrow.<p class="bg-yellow-100 text-yellow-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-1">InProgress</p>
<li class="p-2">1a - Cancel Order (Optional) - The seller or buyer can cancel the order if the order is not paid yet.
 <p class="bg-pink-100 text-pink-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-1">Canceled</p></li>
 </ul>
<ul class="p-2">
2 - The buyer pays for the product/service, but the coins are held in escrow until the product/service is deliverd & inspected.
<p class="bg-cyan-100 text-cyan-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-1">Paid</p>
</ul>
<ul class="p-2">3 - The buyer confirms the delivery after the product/service is inspected and the coins will be released to the seller.
<p class="bg-lime-100 text-lime-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-1">Delivered</p>
<li class="p-2">3a - Open Dispute (Optional) - The buyer opens a Dispute case which is checked by the mediator service. The buyer or seller must provide enough evidence, such as a Tracking Code.
  <p class="bg-indigo-100 text-indigo-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-1">OpenDispute</p>
</li>
<ul>
<li class="pl-4">-The mediator is able to cancel the order and the coins are released to the <b>Buyer</b>.
<p class="bg-pink-100 text-pink-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-1">Canceled</p></li>
<li class="pl-4 pt-2">-The mediator is able to complete the order and the coins are released to the <b>Seller</b>.
 <p class="bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-1">Completed</p>
</li>
 </ul>
 </ul>
<ul class="p-2">4 - The seller can withdraw the coins if the maturity time has expired.
 <p class="bg-green-100 text-green-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-1">Completed</p>
</ul>
</div>`,
  },
  {
    question: "What is the total supply?",
    answer: `The total supply is 21 trillion. No more tokens can be minted.`,
  },
  {
    question: "Which networks are supported?",
    answer: `Avalanche and it can be extended to ETH2, BSC, Fantom, Oasis and more.`,
  },
  {
    question: "Can I send any coin/token?",
    answer: `Every ERC20 token which is supported from the chain. It is recommend to use a stablecoin like BUSD, USDT, USDC or DAI due the high volatility of cryptocurrencies.`,
  },
  {
    question: "How many documents can be uploaded?",
    answer: `Only one document with max size of 4MB.`,
  },
  {
    question: "Is the platform for private individuals or for companies?",
    answer: `Businesses and individuals can use the platform according to their needs, e.g. to pay freelancers, sell products to friends with escrow, etc.. Palindrome operates the platform but does not sell any products or services.`,
  },
  {
    question: "How does the Palindrome Token reward system work?",
    answer: `
    A distinction must be made between the Palindrome Crypto Payment System and the Palindrome Token. <br/>
    <ul>
    <li class="p-2">
<b>The Palindrome Crypto Payment System</b> collects 1% fees from each payment system owner created through Palindrome Pay. The Palindrome Crypto Escrow Service is one of them.
</li>
<li class="p-2">
<b>The Palindrome Token </b>collects 1% fees with each transaction and is proportionally & instantly distributed to the holders. This only applies to the Palindrome token. The contract ownership is renounced and the value can not be changed.
</li>
</ul>`,
  },
  // {
  //   question: "What is Palindrome Chain?",
  //   answer: `The idea of decentralized storage of documents and encryption of data we have experienced with the Palindrome Pay - Crypto Escrow Service but we had to use several blockchain technologies to implement it.<br/>
  //     For example, the Palindrome Pay SDK is encrypting the image/docs and the description by default. Same features we would like to implement into Palindrome Chain.<br/><br/> It will be an EVM compatible chain with the option of programmable privacy using Cosmos.<br/> The fees will be about ~0.002$ and the confirmation about 6s. More infos in the near future..

  // `,
  // },
];

export default function FAQ() {
  const [next, setNext] = useState(5);
  const moreFaqs = () => {
    if (next <= 7) {
      const count = next + 6;
      setNext(count);
    } else {
      const count = next - 6;
      setNext(count);
    }
  };
  return (
    <div className="bg-gray-800 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto divide-y-2 divide-gray-700">
          <h2 className="text-center text-3xl font-extrabold text-gray-100 sm:text-4xl">
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-6 divide-y divide-gray-700">
            {faqs.slice(0, next).map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt className="text-lg">
                      <Disclosure.Button className="text-left w-full flex justify-between items-start text-gray-400">
                        <span className="font-medium text-gray-300">
                          {faq.question}
                        </span>
                        <span className="ml-6 h-7 flex items-center">
                          <ChevronDownIcon
                            className={classNames(
                              open ? "-rotate-180" : "rotate-0",
                              "h-6 w-6 transform"
                            )}
                            aria-hidden="true"
                          />
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p
                        className="text-base text-gray-400"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      ></p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
        <div className="mt-8 flex justify-center">
          {next <= 5 ? (
            <button
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              onClick={moreFaqs}
            >
              More..
            </button>
          ) : (
            <button
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              onClick={moreFaqs}
            >
              Less..
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
