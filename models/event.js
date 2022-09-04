import { timeStamp } from "console";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  event: {
    type: String,
    enum: ["freeze", "release"],
  },

  user: {
    type: String,
  },

  nftContractAddress: {
    type: String,
  },

  chainId: {
    type: Number,
  },

  chainAddress: {
    type: String,
  },

  network: {
    type: String,
    enum: ["Godwoken", "Ethereum"],
  },
  tokenId: {
    type: Number,
  },
  transactionHash: {
    type: String,
  },
});

export default mongoose.model("Event", eventSchema);
