//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./GodwokenNFT.sol";

contract NFTCollectionBridgeWrapper is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 bridgeFee = 1e16;
    uint256 index = 1;

    bool public isBlocked;

    string[] public whitelistedCollectionNames;

    address private gatewayAddress;
    address public godwokenNFTs;

    //mappings
    mapping(address => bool) public isWhitelisted;

    mapping(string => address) public whitelistedCollectionAddress;
    mapping(address => string) public whitelistedCollectionName;
    mapping(string => uint256) public mapWhiltelistCollectionNames;
    mapping(address => mapping(uint256 => uint256)) tokenIdsMapOnGodwoken;

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
        address tokenAddress,
        string uri
    );

    constructor(address _gatewayAddress, address _godwokenNFTs) {
        gatewayAddress = _gatewayAddress;
        godwokenNFTs = _godwokenNFTs;
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

    //Whitelisting and Initializing of Tokens
    function whitelistCollection(
        address collectionAddress,
        string memory colectionName
    ) external onlyOwner returns (bool) {
        require(collectionAddress != address(0), "Cannot be address 0");
        require(
            !ifDuplicateCollectionName(colectionName),
            "Duplicate collection name"
        );
        isWhitelisted[collectionAddress] = true;
        whitelistedCollectionName[collectionAddress] = colectionName;
        whitelistedCollectionAddress[colectionName] = collectionAddress;
        whitelistedCollectionNames.push(colectionName);
        mapWhiltelistCollectionNames[colectionName] = index;
        index++;
        return true;
    }

    function ifDuplicateCollectionName(string memory colectionName)
        private
        view
        returns (bool)
    {
        bool flag = false;
        for (uint256 j = 0; j < whitelistedCollectionNames.length; j++) {
            if (
                keccak256(abi.encodePacked(whitelistedCollectionNames[j])) ==
                keccak256(abi.encodePacked(colectionName))
            ) {
                flag = true;
                break;
            }
        }
        return flag;
    }

    function removeCollectionFromWhitelist(address collectionAddress)
        external
        onlyOwner
        returns (bool)
    {
        require(collectionAddress != address(0), "Cannot be address 0");
        // IERC20(collectionAddress).transfer(receiver, bridgeFee[collectionAddress]);
        string memory collectionName = whitelistedCollectionName[
            collectionAddress
        ];
        delete whitelistedCollectionAddress[collectionName];
        delete whitelistedCollectionName[collectionAddress];
        uint256 i = mapWhiltelistCollectionNames[collectionName];
        string memory lastCollectionName = whitelistedCollectionNames[
            ((whitelistedCollectionNames.length) - 1)
        ];
        mapWhiltelistCollectionNames[lastCollectionName] = i;
        whitelistedCollectionNames[i - 1] = lastCollectionName;
        whitelistedCollectionNames.pop();
        delete mapWhiltelistCollectionNames[collectionName];
        isWhitelisted[collectionAddress] = false;
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
            isWhitelisted[collectionAddress] == true,
            "This token is not Whitelisted on our platform"
        );
        require(
            msg.value >= bridgeFee + _gasFees,
            "You are not paying enough gas fees"
        );
        require(
            _amount <= IERC20(collectionAddress).balanceOf(msg.sender),
            "Amount exceeds your balance"
        );

        uint256 tamount = _amount;
        string memory collectionName = whitelistedCollectionName[
            collectionAddress
        ];

        IERC721(collectionAddress).transferFrom(
            _msgSender(),
            address(this),
            _tokenID
        );

        emit DEPOSIT(
            tamount,
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
        require(
            isWhitelisted[collectionAddress] == true,
            "This Collection is not Whitelisted on our platform"
        );

        _tokenIds.increment();

        uint256 newtokenId = _tokenIds.current();

        string memory uri = "https://xyz.png";

        GodwokenNFT(godwokenNFTs).safeMint(receiver, newtokenId, uri);

        tokenIdsMapOnGodwoken[collectionAddress][_tokenID] = newtokenId;

        emit WITHDRAW(_tokenID, newtokenId, receiver, collectionAddress, uri);
        return true;
    }

    //Function to get names of all whitelisted tokens
    function getAllWhitelistedCollectionNames()
        external
        view
        returns (string[] memory)
    {
        return whitelistedCollectionNames;
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
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Failed to send Ether");
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
        require(success, "Failed to send Ether");
    }

    //Gateway Modifiers

    modifier onlyGateway() {
        require(msg.sender == gatewayAddress);
        _;
    }
}
