const functions = require("firebase-functions");
const { NFT_BRDIGE_GODWOKEN } = require("./constants/constant");
const NFTBridge = require("./constants/ABI.json");
const Moralis = require("moralis").default;
const dotenv = require("dotenv");
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
dotenv.config();

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.depositNFT = functions.firestore
  .document(`moralis/events/Raspberydao/{id}`)
  .onCreate(async (snap) => {
    // ADMIN CREDENTIALS
    const adminPrivKey = process.env.PRIVATE_KEY;

    // GODWOKEN PROVIDER && GODWOKEN_BRIDGE CONTRACT INIT
    const provider = new HDWalletProvider({
      mnemonic: process.env.MNEMONICS,
      providerOrUrl: process.env.GODWOKEN_RPC_URL,
      pollingInterval: 8000,
    });
    const web3Godwoken = new Web3(provider);

    const { address: adminGodwoken } =
      web3Godwoken.eth.accounts.wallet.add(adminPrivKey);

    const godwokenBridgeInstance = new web3Godwoken.eth.Contract(
      NFTBridge.abi,
      NFT_BRDIGE_GODWOKEN
    );

    let {
      tamount,
      tokenID,
      sender,
      collectionAddress,
      uri,
      collectionName,
      destinationChainId,
    } = snap.data();

    const mappedCollectionAddressOnGodwoken = collectionAddress;

    const tx = godwokenBridgeInstance.methods.mintOnGodwoken(
      tokenID,
      mappedCollectionAddressOnGodwoken,
      sender
    );

    const [gasPrice, gasCost] = await Promise.all([
      web3Godwoken.eth.getGasPrice(),
      tx.estimateGas({ from: adminGodwoken }),
    ]);

    const data = tx.encodeABI();

    const txData = {
      from: adminGodwoken,
      to: godwokenBridgeInstance.options.address,
      data,
      gas: gasCost,
      gasPrice,
    };

    const receipt = await web3Godwoken.eth.sendTransaction(txData);
    console.log("Receipt", receipt.transactionHash);
  });
