import mongoose from "mongoose";
import NFT from "./nft.js";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  publicKey: {
    type: String,
  },

  nfts: [
    {
      type: String,
    },
  ],
});

export default mongoose.model("User", userSchema);
