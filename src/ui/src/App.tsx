import "./App.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import Dashboard from "./components/dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./components/start";
import FAQ from "./components/faq";
import NotFoundPage from "./components/NotFoundPage";
import CreatePayment from "./components/createPayment";

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/algokk/blue-pay",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Start />}></Route>
            <Route
              path="/crypto_escrow"
              element={
                <Dashboard client={client} title="Crypto Escrow Service" />
              }
            ></Route>
            <Route path="/create-crypto-payment" element={<CreatePayment />} />
            <Route path="/faqs" element={<FAQ />} />
            <Route path="/404" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ApolloProvider>
    </>
  );
}

export default App;
