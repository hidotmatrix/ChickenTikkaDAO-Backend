import dotenv from "dotenv";
import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3WsProvider from "web3-providers-ws";
dotenv.config();

// WEB3 providers for catching events on ETHEREUM

function web3EThProviderHTTP() {
  const provider = new HDWalletProvider({
    mnemonic: process.env.MNEMONICS,
    providerOrUrl: process.env.ALCHEMY_POLYGON_MUMBAI_API_URL_HTTP,
    pollingInterval: 8000,
  });
  return new Web3(provider);
}

function web3ETHprovider() {
  const provider = new HDWalletProvider({
    mnemonic: process.env.MNEMONICS,
    providerOrUrl: process.env.ALCHEMY_POLYGON_MUMBAI_API_URL_WS,
    pollingInterval: 8000,
  });
  return new Web3(provider);
}

function web3EthereumProvider() {
  const options = {
    timeout: 30000, // ms
    clientConfig: {
      // Useful to keep a connection alive
      keepalive: true,
      keepaliveInterval: 60000, // ms
    },
    // Enable auto reconnection
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: true,
    },
    networkCheckTimeout: 20000,
    timeoutBlocks: 1500,
  };
  return new Web3(
    new Web3WsProvider(process.env.ALCHEMY_POLYGON_MUMBAI_API_URL_WS, options)
  );
}

// WEB3 providers for catching events on Godwoken

function web3GodwokenProviderHTTP() {
  const provider = new HDWalletProvider({
    mnemonic: process.env.MNEMONICS,
    providerOrUrl: process.env.GODWOKEN_RPC_URL,
    pollingInterval: 8000,
  });
  return new Web3(provider);
}

// COINGECKO Prices API configs

function coinGeckoPrice() {
  let coinGeckoOptions = {
    method: "GET",
    url: "https://api.coingecko.com/api/v3/simple/price",
    params: { ids: "ethereum,binancecoin", vs_currencies: "usd,usd" },
  };
  return coinGeckoOptions;
}

export {
  web3EThProviderHTTP,
  web3ETHprovider,
  web3EthereumProvider,
  coinGeckoPrice,
  web3GodwokenProviderHTTP,
};
