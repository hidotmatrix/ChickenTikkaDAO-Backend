import User from "../models/user.js";
import event from "../models/event.js";
import NFT from "../models/nft.js";

//fetches user's all locked nfts
export const getUsersLockedNfts = async (req, res) => {
  const user = req.params.user;
  const existingUser = await User.findOne({ publicKey: user });

  if (!existingUser) {
    const newUser = new User({
      publicKey: user,
    });
    await newUser.save();
  }
  const nfts = existingUser.nfts;
  return res.status(200).json(nfts);
};

export const checkOrigin = async (req, res) => {
  const nftContractAddress = req.params.nftContractAddress;
  console.log("nftContractAddress", nftContractAddress);

  const nft = await NFT.findOne({ publicKey: nftContractAddress });
  if (nft) {
    return res.status(200).json({ status: true, nft });
  }
  return res.status(200).json({ status: false });
};

// export const updateNFT=async (req, res) => {
//   const nftContractAddress = req.body.nftContractAddress;
//   console.log("nftContractAddress".nftContractAddress)
//   const nftContractAddress=req.body.nftContractAddress;
//   const tokenId=req.body.tokenId;
//   setTimeout(async() => {
//     const nft = await NFT.findOne({ publicKey: nftContractAddress });
//     console.log(nft)
//     if (nft) {
//       nft.chainAddress=nftContractAddress;
//       nft.tokenId=tokenId;
//       await NFT.save();
//       return res.status(200).json({nft:nft });
//     }
//     return res.status(200).json({message:"nft not exists" });
//   }, 11000)
// }

//To create a new nft
export const createNft = async (req, res) => {
  console.log(req.body);
  const nftContractAddress = req.body.nftContractAddress;
  const status = req.body.status;
  const origin = req.body.origin;
  const activeOn = req.body.activeOn;
  const tokenId = req.body.tokenId;

  const nft = await NFT.findOne({
    publicKey: nftContractAddress,
    tokenId: tokenId,
  });

  console.log(nft);

  if (!nft) {
    const newNft = new NFT({
      publicKey: nftContractAddress,
      status: status,
      origin: origin,
      activeOn: activeOn,
      tokenId: tokenId,
    });

    await newNft.save();
    return res.status(200).send(newNft);
  }
  return res.status(201).send("nft already exist");
};

//To update the Nft when crossChain address and/or Id are given.
export const updateNFT = async (req, res) => {
  const nftContractAddress = req.body.nftContractAddress;
  const id = req.body.id;
  const chainAddress = req.body.chainAddress;

  console.log("req body", req.body);

  let nft = await NFT.findOne({
    publicKey: nftContractAddress,
    origin: "Godwoken",
  });

  if (nft) {
    console.log(nft);
    nft.chainAddress = chainAddress;
    nft.tokenId = id;

    await nft.save();
    return res.status(200).send(nft);
  }
  nft = await NFT.findOne({ publicKey: nftContractAddress, tokenId: id });

  if (nft) {
    nft.chainAddress = chainAddress;

    await nft.save();
    return res.status(200).send(nft);
  }
  return res.status(201).send("No Nft found");
};

//To find the nft  using the nftContractAddress if from same origin or find using otherChainAddress and id
export const findNft = async (req, res) => {
  const nftContractAddress = req.query.nftContractAddress;
  const id = req.query.id;

  let nft = await NFT.findOne({
    publicKey: nftContractAddress,
    origin: "Godwoken",
  });
  if (nft) {
    return res.status(200).send(nft);
  }

  nft = await NFT.findOne({ publicKey: nftContractAddress, tokenId: id });

  if (nft) {
    return res.status(200).send(nft);
  }

  nft = await NFT.findOne({
    chainAddress: nftContractAddress,
    origin: "Ethereum",
  });

  if (nft) {
    return res.status(200).send(nft);
  }

  nft = await NFT.findOne({ chainAddress: nftContractAddress, tokenId: id });

  if (nft) {
    return res.status(200).send(nft);
  }

  return res.status(201).send(false);
};
