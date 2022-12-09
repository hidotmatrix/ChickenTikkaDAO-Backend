// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the GodwokenNFT contract to deploy
  const GodwokenNFT = await hre.ethers.getContractFactory("GodwokenNFT");
  const godwokenNFT = await GodwokenNFT.deploy();

  await godwokenNFT.deployed();

  console.log(
    "GodwokenNFT Smart Contract deployed on Polygon to:",
    godwokenNFT.address
  );

  const GATEWAY_ADDRESS = process.env.GATEWAY_ADDRESS;
  const TREASURY_ADDRESS = process.env.POLYGON_DAO_TREASURY_ADDRESS;

  // We get the NFTCollectionBridgeWrapper contract to deploy
  const NFTCollectionBridgeWrapper = await hre.ethers.getContractFactory(
    "NFTCollectionBridgeWrapper"
  );
  const nftCollectionBridgeWrapper = await NFTCollectionBridgeWrapper.deploy(
    GATEWAY_ADDRESS,
    godwokenNFT.address,
    TREASURY_ADDRESS
  );

  await nftCollectionBridgeWrapper.deployed();

  console.log(
    "NFTCollectionBridgeWrapper Smart Contract deployed on Polygon at:",
    nftCollectionBridgeWrapper.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
