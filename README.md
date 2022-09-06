## RaspberryDAO Godwoken Bridge - Smart Contracts - Backend(Bridge Service)

RaspberryDAO-Backend Project is a Backend of RaspberryDAO ecosystem which is used to listen real time events emitted when users swap their NFTs using [RaspberryDAO-User-UI](ttps://github.com/hidotmatrix/RaspberryDAO-User-UI). This project act as real time even listeners whenever someone lock their NFTs into the bridge smart contracts, and later on getting events emtited , this service will automatically mints GodwokenNFTs on the userwallet addresses on Godwoken L2 chain.

## RaspberryDAO (Decentralised Automnomous Organisation)

RaspberryDAO is an ERC20 based governance mechanism.

DAOs are an effective and safe way to work with like-minded folks around the globe.

Think of them like an internet-native business that's collectively owned and managed by its members. They have built-in treasuries that no one has the authority to access without the approval of the group. Decisions are governed by proposals and voting to ensure everyone in the organization has a voice. [Read More About DAOs](https://ethereum.org/en/dao/)

---

### Clone repository

```bash
git clone https://github.com/hidotmatrix/RaspberryDAO-Backend.git
```

---

### Installation

```bash
cd RaspberryDAO-Backend
npm install
```

---

### Smart contract structure

This repository uses openzeppelin's modular system of Bridge

- [NFTCollectionBridgeWrapper](https://github.com/hidotmatrix/RaspberryDAO-Backend/blob/develop/contracts/BaseBrdige/NFTBridge.sol): The bridge contract that contains all the logic and primitives for locking NFTs on ne chain and minting on Godwoken chain.
- [GodwokenNFT](https://github.com/hidotmatrix/RaspberryDAO-Backend/blob/develop/contracts/BaseBrdige/GodwokenNFT.sol): A godwoken side mintable NFT smart contract

---

### Smart contract Interaction

#### Compile smart contracts

```bash
npx hardhat compile
```

#### Test smart contracts

```bash
npx hardhat test
```

#### Smart contract Deployment

Create a .env file in the root directory and add the following variables

- `MONGODB_URL = ""`
- `RINKBEY_INFURA = ""`
- `PORT = ""`
Supported networks for deployment

- `localhost`
- `ropsten`
- `rinkeby`
- `goerli`
- `polygon (mumbai testnet)`
- `bsc testnet`

##### Deploying GTP Token Smart Contract

```bash
npx hardhat run --network localhost scripts/deploy.js
```

#### Smart contract verification

Add the following to your .env file

> `ETHERSCAN_API_KEY = ""`

```bash
npx hardhat verify --network rinkbey DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
```

---

### Backend/Bridge Service Interaction

```bash
npm run start
```

#### Wallet support

Used rainbowkit for the wallet Interaction. [rainbowkit docs](https://www.rainbowkit.com/docs/introduction)


