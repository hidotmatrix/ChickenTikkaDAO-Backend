export const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "NFTContract",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "DEPOSIT",
    type: "event",
  },
  {
    inputs: [],
    name: "depositNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
