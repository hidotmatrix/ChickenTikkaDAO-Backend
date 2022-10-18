import { ethers } from "ethers";
import { ABI } from "./bridge.js";

const alchemyApiKey =
  "wss://rinkeby.infura.io/ws/v3/5ddd51a644fb4366bf26895ff5a6afbf";
const Bridge = "0x6cd7fE9D0f79845981A4C138E52c4ff3Ae011616";
const provider = new ethers.providers.WebSocketProvider(alchemyApiKey);
export const ethContract = new ethers.Contract(Bridge, ABI, provider);
