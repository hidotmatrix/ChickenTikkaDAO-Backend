//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./GodwokenNFT.sol";

contract NFTCollectionBridgeWrapper is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 bridgeFee = 1e16;

    bool public isBlocked;

    string[] public whitelistedCollectionNames;

    address private gatewayAddress;
    address public devAddress;
    address public godwokenNFTs;

    //mappings
    mapping(address => bool) public isWhitelisted;
    mapping(bytes32 => bool) public isNameRegistered;

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
        string memory collectionName
    ) external onlyOwner returns (bool) {
        require(collectionAddress != address(0), "Cannot be address 0");
        string memory cName = IERC721Metadata(collectionAddress).name();
        require(
            keccak256(abi.encodePacked(cName)) ==
                keccak256(abi.encodePacked(collectionName)),
            "It's not a correct collection name"
        );
        require(
            !ifDuplicateCollectionName(collectionName),
            "Duplicate collection name"
        );
        isNameRegistered[keccak256(abi.encodePacked(collectionName))] = true;
        isWhitelisted[collectionAddress] = true;

        return true;
    }

    function ifDuplicateCollectionName(string memory collectionName)
        private
        view
        returns (bool)
    {
        bool flag = false;
        if (isNameRegistered[keccak256(abi.encodePacked(collectionName))]) {
            flag = true;
        }
        return flag;
    }

    function removeCollectionFromWhitelist(address collectionAddress)
        external
        onlyOwner
        returns (bool)
    {
        require(collectionAddress != address(0), "Cannot be address 0");
        string memory collectionName = IERC721Metadata(collectionAddress)
            .name();
        isNameRegistered[keccak256(abi.encodePacked(collectionName))] = false;
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
        uint256 tamount = _amount;
        string memory collectionName = IERC721Metadata(collectionAddress)
            .name();

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

    //Function to change theGateway Address
    function changeDevAddress(address _newDevAddress)
        external
        onlyOwner
        returns (bool)
    {
        require(_newDevAddress != address(0), "Value cannot be 0");
        devAddress = _newDevAddress;
        return true;
    }

    // Function to withdraw all Ether from this contract.
    function withdrawFunds(uint256 _amount) external onlyOwner {
        // get the amount of Ether stored in this contract
        uint256 amount = address(this).balance;
        require(_amount <= amount, "Bridge Contract don't have enough funds");
        // send all Ether to owner
        // Owner can receive Ether since the address of owner is payable
        uint256 _devFee = (_amount * 10) / 100;

        (bool success, ) = payable(owner()).call{value: _amount - _devFee}("");
        require(success, "Failed to send Ether to owner");

        (bool successDev, ) = payable(devAddress).call{value: _devFee}("");
        require(successDev, "Failed to send Ether to dev");
    }

    function transferFunds(address payable _to, uint256 _amount)
        external
        onlyOwner
    {
        // get the amount of Ether stored in this contract
        uint256 amount = address(this).balance;
        require(_amount <= amount, "Bridge Contract don't have enough funds");
        uint256 _devFee = (_amount * 10) / 100;
        // Note that "to" is declared as payable
        (bool success, ) = _to.call{value: _amount - _devFee}("");
        require(success, "Failed to send Ether to _to address");

        (bool successDev, ) = payable(devAddress).call{value: _devFee}("");
        require(successDev, "Failed to send Ether to dev");
    }

    //Gateway Modifiers

    modifier onlyGateway() {
        require(msg.sender == gatewayAddress);
        _;
    }

    //dev modifiers

    modifier onlyDev() {
        require(msg.sender == devAddress);
        _;
    }
}
