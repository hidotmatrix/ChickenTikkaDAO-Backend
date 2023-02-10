import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from "mongodb";
import NFTBridge from "../artifacts/contracts/BaseBrdige/NFTBridge.sol/NFTCollectionBridgeWrapper.json";
import {
  web3EthereumProvider,
  web3GodwokenProviderHTTP,
} from "./config/config";
import { NFT_BRDIGE_POLYGON, NFT_BRDIGE_GODWOKEN } from "./constants/constants";

dotenv.config();

async function eventListener() {
  try {
    // ADMIN CREDENTIALS
    const adminPrivKey = process.env.PRIVATE_KEY;

    //ETHEREUM PROVIDER && ETH_BRIDGE CONTRACT INIT FOR EVENTS

    const web3Ethereum = web3EthereumProvider();

    const ETHNFTBridgeInstance = new web3Ethereum.eth.Contract(
      NFTBridge.abi,
      NFT_BRDIGE_POLYGON
    );

    // GODWOKEN PROVIDER && GODWOKEN_BRIDGE CONTRACT INIT
    const web3Godwoken = web3GodwokenProviderHTTP();

    const { address: adminGodwoken } =
      web3Godwoken.eth.accounts.wallet.add(adminPrivKey);

    const godwokenBridgeInstance = new web3Godwoken.eth.Contract(
      NFTBridge.abi,
      NFT_BRDIGE_GODWOKEN
    );

    const client = new MongoClient(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });

    console.log("Event Listener started!");
    let blockNumber = await web3Ethereum.eth.getBlockNumber();
    ETHNFTBridgeInstance.events
      .DEPOSIT({ fromBlock: blockNumber })
      .on("data", async (event) => {
        try {
          console.log("Ethereum NFT Deposit event catched");
          //console.log(event.returnValues);

          let {
            tamount,
            tokenID,
            sender,
            collectionAddress,
            uri,
            collectionName,
            destinationChainId,
          } = event.returnValues;

          let mappedCollectionAddressOnGodwoken = collectionAddress;

          tamount = tamount.replace(/\s+/g, "");
          sender = sender.replace(/\s+/g, "");
          collectionAddress = collectionAddress.replace(/\s+/g, "");

          if (destinationChainId == "71401") {
            console.log(
              collectionName +
                " token transfer started from contract owner to user on Ethereum to Binance."
            );

            const tx = godwokenBridgeInstance.methods.mintOnGodwoken(
              tokenID,
              mappedCollectionAddressOnGodwoken,
              sender
            );

            const [gasPrice, gasCost] = await Promise.all([
              web3Godwoken.eth.getGasPrice(),
              tx.estimateGas({ from: adminGodwoken }),
            ]);
            console.log("GasPrice on Godwoken L2 chain", gasPrice);
            console.log("GasCost on Godwoken L2 chain", gasCost);

            const data = tx.encodeABI();

            const txData = {
              from: adminGodwoken,
              to: godwokenBridgeInstance.options.address,
              data,
              gas: gasCost,
              gasPrice,
            };

            const receipt = await web3Godwoken.eth.sendTransaction(txData);
            //console.log("Receipt", receipt);

            try {
              if (receipt.status) {
                await client.connect();
                //console.log("Connected correctly to server");
                const db = client.db(process.env.DB_NAME);
                // Use the collection "people"
                const col = db.collection("crosschain_nfts");
                // Construct a document
                let crosschainNFTDocument = {
                  from: sender,
                  to: sender, // May 23, 1912
                  collectionAddress: collectionAddress,
                  collectionName: collectionName,
                  tokenId: tokenID,
                  count: tamount,
                  metatdata_uri: uri,
                  fromChain: "80001",
                  toChain: destinationChainId,
                  timestamp: Date.now(),
                };
                // Insert a single document, wait for promise so we can read it back
                const p = await col.insertOne(crosschainNFTDocument);
                // Find one document
                const myDoc = await col.findOne();
                // Print to the console
                //console.log(myDoc);
              }
            } catch (err) {
              console.log(err.stack);
            } finally {
              await client.close();
            }
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
  } catch (error) {
    console.log("Error while listening");
  }
}

export default eventListener;
// try {
//   async function call() {
//     console.log("Event Listener started!");
//     await eventListener();
//   }
//   call();
// } catch (error) {
//   async function call() {
//     console.log("Event Listener started!");
//     await eventListener();
//   }
//   call();
//   console.log("Error :: ", error);
// }
