import dotenv from "dotenv";
import NFTBridge from "../artifacts/contracts/BaseBrdige/NFTBridge.sol/NFTCollectionBridgeWrapper.json";
import {
  web3EthereumProvider,
  web3GodwokenProviderHTTP,
} from "./config/config";
import { NFT_BRDIGE_RINKBEY, NFT_BRDIGE_GODWOKEN } from "./constants/constants";

dotenv.config();

// ADMIN CREDENTIALS
const adminPrivKey = process.env.PRIVATE_KEY;

//ETHEREUM PROVIDER && ETH_BRIDGE CONTRACT INIT FOR EVENTS

const web3Ethereum = web3EthereumProvider();

const ETHNFTBridgeInstance = new web3Ethereum.eth.Contract(
  NFTBridge.abi,
  NFT_BRDIGE_RINKBEY
);

// GODWOKEN PROVIDER && GODWOKEN_BRIDGE CONTRACT INIT
const web3Godwoken = web3GodwokenProviderHTTP();

const { address: adminGodwoken } =
  web3Godwoken.eth.accounts.wallet.add(adminPrivKey);

const godwokenBridgeInstance = new web3Godwoken.eth.Contract(
  NFTBridge.abi,
  NFT_BRDIGE_GODWOKEN
);

ETHNFTBridgeInstance.events
  .DEPOSIT({ fromBlock: "0" })
  .on("data", async (event) => {
    try {
      console.log("Ethereum NFT Deposit event catched");
      console.log(event.returnValues);

      let {
        tamount,
        tokenID,
        sender,
        collectionAddress,
        uri,
        collectionName,
        destinationChainId,
      } = event.returnValues;

      tamount = tamount.replace(/\s+/g, "");
      sender = sender.replace(/\s+/g, "");
      collectionAddress = collectionAddress.replace(/\s+/g, "");

      if (destinationChainId == "71401") {
        console.log(
          collectionName +
            " token transfer started from contract owner to user on Ethereum to Binance."
        );
        let GodwokenNFTTokenAddress = await godwokenBridgeInstance.methods
          .getAddressFromName(collectionName)
          .call();
        console.log(GodwokenNFTTokenAddress);

        const tx = godwokenBridgeInstance.methods.mintOnGodwoken(
          tokenID,
          GodwokenNFTTokenAddress,
          sender
        );

        const [gasPrice, gasCost] = await Promise.all([
          web3Godwoken.eth.getGasPrice(),
          tx.estimateGas({ from: adminGodwoken }),
        ]);
        console.log("GasPrice and GasCost", gasPrice, gasCost);

        const data = tx.encodeABI();

        const txData = {
          from: adminGodwoken,
          to: godwokenBridgeInstance.options.address,
          data,
          gas: gasCost,
          gasPrice,
        };

        const receipt = await web3Godwoken.eth.sendTransaction(txData);

        console.log(`Transaction hash: ${receipt.transactionHash}`);
        console.log(`
            Processed Cross chain NFT transfer:
            - from ${sender} 
            - to ${sender} 
            - tokenID ${tokenID} tokens
          `);
        console.log(
          collectionName +
            " token transfer done from contract owner to user on Ethereum to Binance."
        );
      } else throw new Error("Ether gas transfer confirmation failed");
    } catch (err) {
      let { tamount, sender, collectionAddress, collectionName } =
        event.returnValues;
      console.log(err.name);
      console.log(err.message);
      console.log(err);
    }
  });
