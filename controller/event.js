import Event from "../models/event.js";
import User from "../models/user.js";
import NFT from "../models/nft.js";

const CHAIN_ID = 1;

//Listens to the Events on Chain
export const eventHandler = async (req, res, next) => {
  console.log(req.body);
  //dataHandler(sender, "abc", CHAIN_ID, "freeze", "Ethereum", "Godwoken", id);
};

//Handles the data received from events and pushes it into db.
const dataHandler = async (
  user,
  nftContractAddress,
  chainId,
  event,
  network,
  isActiveOn,
  id
) => {
  const existingEvent = await Event.findOne({
    event: event,
    user: user,
    nftContractAddress: nftContractAddress,
    network: network,
    tokenId: id,
  });

  if (existingEvent) {
    if (existingEvent.timeStamp + 60000 < new Date(Date.now())) {
      const newEvent = new Event({
        event: event,
        user: user,
        nftContractAddress: nftContractAddress,
        chainId: chainId,
        network: network,
        tokenId: id,
      });
      await newEvent.save();
      await userHandler(
        user,
        nftContractAddress,
        event,
        network,
        isActiveOn,
        id
      );
      return;
    }
    return;
  }

  const newEvent = new Event({
    event: event,
    user: user,
    nftContractAddress: nftContractAddress,
    chainId: chainId,
    network: network,
    tokenId: id,
  });
  await newEvent.save();

  await userHandler(user, nftContractAddress, event, network, isActiveOn, id);
};

//Handles User and Nft database interactions
//called from dataHandler
const userHandler = async (
  user,
  nftContractAddress,
  event,
  network,
  isActiveOn,
  id
) => {
  let existingUser = await User.findOne({ publicKey: user });

  if (!existingUser) {
    existingUser = new User({
      publicKey: user,
    });
    await existingUser.save();
  }

  let existingnftContractAddress = await NFT.findOne({
    publicKey: nftContractAddress,
  });

  if (!existingnftContractAddress) {
    existingnftContractAddress = new NFT({
      publicKey: nftContractAddress,
      status: event,
      origin: network,
      activeOn: isActiveOn,
      tokenId: id,
    });
    await existingnftContractAddress.save();
  }

  if (event == "release") {
    if (existingUser.nfts.length > 0) {
      existingUser.nfts = await existingUser.nfts.filter(
        (publicKey) => publicKey != nftContractAddress
      );
      await existingUser.save();
    }

    const existingnftContractAddress = await NFT.findOne({
      publicKey: nftContractAddress,
    });
    existingnftContractAddress.status = event;
    await existingnftContractAddress.save();
  } else if (event == "freeze") {
    existingUser.nfts.push(nftContractAddress);
    await existingUser.save();

    existingnftContractAddress.status = event;
    await existingnftContractAddress.save();
  }
  return;
};
