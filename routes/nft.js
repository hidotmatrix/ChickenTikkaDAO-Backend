import express from "express";
import {
  getUsersLockedNfts,
  checkOrigin,
  updateNFT,
  findNft,
  createNft,
} from "../controller/nft.js";

export const nftRoutes = express.Router();

nftRoutes.get("/getUsersLockedNfts/:user", getUsersLockedNfts);
nftRoutes.get("/checkOrigin/:nftContractAddress", checkOrigin);
nftRoutes.post("/updateNFT", updateNFT);
nftRoutes.get("/findNft", findNft);
nftRoutes.post("/createNft", createNft);
