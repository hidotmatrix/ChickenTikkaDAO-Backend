import mongoose from "mongoose";

const nftSchema = new mongoose.Schema({
  publicKey: {
    type: String,
  },

  status: {
    type: String,
    enum: ["freeze", "release"],
  },

  origin: {
    type: String,
    enum: ["Godwoken", "Ethereum"],
  },
  activeOn: {
    type: String,
    enum: ["Godwoken", "Ethereum"],
  },
  chainAddress: {
    type: String,
  },

  tokenId: {
    type: Number,
  },
});

export default mongoose.model("NFT", nftSchema);
