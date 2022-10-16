//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

import "./GodwokenNFT.sol";

contract NFTCollectionBridgeWrapper is Ownable {
  
    uint256 bridgeFee = 1e16;

    bool public isBlocked;

    address private gatewayAddress;
    address public godwokenNFTs;
    address public treasuryAddress;

    //mappings
    mapping(address => mapping(uint256 => uint256)) public tokenIdsMapOnGodwoken;
    
    event DEPOSIT(
        uint256 tamount,
        uint256 tokenID,
        address sender,
        address collectionAddress,
        string uri,
        string collectionName,
        uint256 destinationChainId
    );

    event WITHDRAW(
        uint256 ethtokenID,
        uint256 godowkenTokenId,
        address sender,
        address tokenAddress
    );

    constructor(address _gatewayAddress, address _godwokenNFTs, address _treasuryAddress) {
        gatewayAddress = _gatewayAddress;
        godwokenNFTs = _godwokenNFTs;
        treasuryAddress = _treasuryAddress;
    }

    //Functions to block or unblock the bridge
    function blockBridge() external onlyOwner returns (bool) {
        isBlocked = true;
        return true;
    }

    function unblockBridge() external onlyOwner returns (bool) {
        isBlocked = false;
        return true;
    }


    //Core Bridge Logic
    function deposit(
        address collectionAddress,
        uint256 _amount,
        uint256 _gasFees,
        uint256 _destChainId,
        uint256 _tokenID,
        string memory uri
    ) external payable returns (bool) {
        //approve address(this) to transfer your tokens that you want to deposit and get your wrapped tokens
        require(collectionAddress != address(0), "Cannot be address 0");
        require(isBlocked != true, "Bridge is blocked right now");
        require(
            msg.value >= bridgeFee + _gasFees,
            "You are not paying enough gas fees"
        );
        string memory collectionName = IERC721Metadata(collectionAddress)
            .name();

        IERC721(collectionAddress).transferFrom(
            _msgSender(),
            treasuryAddress,
            _tokenID
        );

        emit DEPOSIT(
            _amount,
            _tokenID,
            msg.sender,
            collectionAddress,
            uri,
            collectionName,
            _destChainId
        );
        return true;
    }

    function mintOnGodwoken(
        uint256 _tokenID,
        address collectionAddress,
        address receiver
    ) external onlyGateway returns (bool) {
        require(collectionAddress != address(0), "Cannot be address 0");
        require(receiver != address(0), "Cannot be address 0");

        uint256 newtokenId = IERC721Enumerable(godwokenNFTs).totalSupply() + 1;

        GodwokenNFT(godwokenNFTs).safeMint(receiver);

        tokenIdsMapOnGodwoken[collectionAddress][_tokenID] = newtokenId;

        emit WITHDRAW(_tokenID, newtokenId, receiver, collectionAddress);
        return true;
    }

    //Function to change the bridge fee percentage
    function changeBridgeFee(uint256 value) external onlyOwner returns (bool) {
        require(value != 0, "Value cannot be 0");
        bridgeFee = value;
        return true;
    }

    //Function to change theGateway Address
    function changeGatewayAddress(address _newGatewayAddress)
        external
        onlyOwner
        returns (bool)
    {
        require(_newGatewayAddress != address(0), "Value cannot be 0");
        gatewayAddress = _newGatewayAddress;
        return true;
    }


    // Function to withdraw all Ether from this contract.
    function withdrawFunds(uint256 _amount) external onlyOwner {
        // get the amount of Ether stored in this contract
        uint256 amount = address(this).balance;
        require(_amount <= amount, "Bridge Contract don't have enough funds");
        // send all Ether to owner
        // Owner can receive Ether since the address of owner is payable

        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Failed to send Ether to owner");

    }

    function transferFunds(address payable _to, uint256 _amount)
        external
        onlyOwner
    {
        // get the amount of Ether stored in this contract
        uint256 amount = address(this).balance;
        require(_amount <= amount, "Bridge Contract don't have enough funds");
        // Note that "to" is declared as payable
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed to send Ether to _to address");

    }

      // function to withdraw NFTs from treasury
    function withdrawNFTs(uint256[] calldata _tokenIds,address[] calldata _nftAddresses, address _recepient) external onlyOwner {
        for(uint256 i=0;i<_tokenIds.length;i++){
          IERC721(_nftAddresses[i]).transferFrom(address(this), _recepient , _tokenIds[i]);
        }
    }


    //Gateway Modifiers

    modifier onlyGateway() {
        require(msg.sender == gatewayAddress);
        _;
    }

}
