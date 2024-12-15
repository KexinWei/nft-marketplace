// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTAuction is Ownable {
    enum AuctionType {
        ENGLISH,
        DUTCH,
        SEALED_BID
    }

    constructor() Ownable(msg.sender) {}

    struct Auction {
        address nftContract;
        uint256 tokenId;
        address seller;
        address highestBidder;
        uint256 highestBid;
        bool isActive;
        uint256 endTime;
        AuctionType auctionType;
        uint256 startPrice;
        uint256 reservePrice;
        uint256 priceDrop;
        uint256 dropInterval;
        bytes32 sealedBidHash;
        uint256 revealedBid;
    }

    mapping(bytes32 => Auction) public auctions;
    mapping(address => bytes32) public sealedBids;

    event AuctionCreated(address indexed nftContract, uint256 indexed tokenId, AuctionType auctionType, uint256 endTime);
    event BidPlaced(address indexed nftContract, uint256 indexed tokenId, address bidder, uint256 amount);
    event AuctionEnded(address indexed nftContract, uint256 indexed tokenId, address winner, uint256 finalPrice);

    function _getAuctionId(address _nftContract, uint256 _tokenId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_nftContract, _tokenId));
    }

    function createEnglishAuction(address _nftContract, uint256 _tokenId, uint256 _duration) public {
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not NFT owner");

        nft.transferFrom(msg.sender, address(this), _tokenId);

        bytes32 auctionId = _getAuctionId(_nftContract, _tokenId);
        auctions[auctionId] = Auction({
            nftContract: _nftContract,
            tokenId: _tokenId,
            seller: msg.sender,
            highestBidder: address(0),
            highestBid: 0,
            isActive: true,
            endTime: block.timestamp + _duration,
            auctionType: AuctionType.ENGLISH,
            startPrice: 0,
            reservePrice: 0,
            priceDrop: 0,
            dropInterval: 0,
            sealedBidHash: bytes32(0),
            revealedBid: 0
        });

        emit AuctionCreated(_nftContract, _tokenId, AuctionType.ENGLISH, block.timestamp + _duration);
    }

    function bidEnglishAuction(address _nftContract, uint256 _tokenId) public payable {
        bytes32 auctionId = _getAuctionId(_nftContract, _tokenId);
        Auction storage auction = auctions[auctionId];

        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit BidPlaced(_nftContract, _tokenId, msg.sender, msg.value);
    }

    function endEnglishAuction(address _nftContract, uint256 _tokenId) public {
        bytes32 auctionId = _getAuctionId(_nftContract, _tokenId);
        Auction storage auction = auctions[auctionId];

        require(auction.isActive, "Auction already ended");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        auction.isActive = false;
        if (auction.highestBidder != address(0)) {
            IERC721(auction.nftContract).transferFrom(address(this), auction.highestBidder, auction.tokenId);
            payable(auction.seller).transfer(auction.highestBid);
            emit AuctionEnded(_nftContract, _tokenId, auction.highestBidder, auction.highestBid);
        }
    }

    function createDutchAuction(address _nftContract, uint256 _tokenId, uint256 _startPrice, uint256 _reservePrice, uint256 _priceDrop, uint256 _dropInterval, uint256 _duration) public {
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not NFT owner");

        nft.transferFrom(msg.sender, address(this), _tokenId);

        bytes32 auctionId = _getAuctionId(_nftContract, _tokenId);
        auctions[auctionId] = Auction({
            nftContract: _nftContract,
            tokenId: _tokenId,
            seller: msg.sender,
            highestBidder: address(0),
            highestBid: 0,
            isActive: true,
            endTime: block.timestamp + _duration,
            auctionType: AuctionType.DUTCH,
            startPrice: _startPrice,
            reservePrice: _reservePrice,
            priceDrop: _priceDrop,
            dropInterval: _dropInterval,
            sealedBidHash: bytes32(0),
            revealedBid: 0
        });

        emit AuctionCreated(_nftContract, _tokenId, AuctionType.DUTCH, block.timestamp + _duration);
    }

    function bidDutchAuction(address _nftContract, uint256 _tokenId) public payable {
        bytes32 auctionId = _getAuctionId(_nftContract, _tokenId);
        Auction storage auction = auctions[auctionId];

        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(auction.auctionType == AuctionType.DUTCH, "Not a Dutch auction");

        uint256 elapsedTime = (block.timestamp - (auction.endTime - auction.dropInterval)) / auction.dropInterval;
        uint256 currentPrice = auction.startPrice - (elapsedTime * auction.priceDrop);
        currentPrice = currentPrice < auction.reservePrice ? auction.reservePrice : currentPrice;

        require(msg.value >= currentPrice, "Bid too low");

        auction.isActive = false;
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        IERC721(auction.nftContract).transferFrom(address(this), msg.sender, auction.tokenId);
        payable(auction.seller).transfer(msg.value);

        emit AuctionEnded(_nftContract, _tokenId, msg.sender, msg.value);
    }

    function createSealedBidAuction(address _nftContract, uint256 _tokenId, uint256 _duration) public {
        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not NFT owner");

        nft.transferFrom(msg.sender, address(this), _tokenId);

        bytes32 auctionId = _getAuctionId(_nftContract, _tokenId);
        auctions[auctionId] = Auction({
            nftContract: _nftContract,
            tokenId: _tokenId,
            seller: msg.sender,
            highestBidder: address(0),
            highestBid: 0,
            isActive: true,
            endTime: block.timestamp + _duration,
            auctionType: AuctionType.SEALED_BID,
            startPrice: 0,
            reservePrice: 0,
            priceDrop: 0,
            dropInterval: 0,
            sealedBidHash: bytes32(0),
            revealedBid: 0
        });

        emit AuctionCreated(_nftContract, _tokenId, AuctionType.SEALED_BID, block.timestamp + _duration);
    }

    function commitSealedBid(address _nftContract, uint256 _tokenId, bytes32 _bidHash) public {
        _nftContract;
        _tokenId;

        sealedBids[msg.sender] = _bidHash;
    }

    function revealSealedBid(address _nftContract, uint256 _tokenId, uint256 _bidAmount, string memory _secret) public {
        bytes32 auctionId = _getAuctionId(_nftContract, _tokenId);
        Auction storage auction = auctions[auctionId];

        require(auction.auctionType == AuctionType.SEALED_BID, "Not a sealed bid auction");
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        bytes32 computedHash = keccak256(abi.encodePacked(_bidAmount, _secret));
        require(sealedBids[msg.sender] == computedHash, "Invalid bid reveal");

        if (_bidAmount > auction.highestBid) {
            auction.highestBidder = msg.sender;
            auction.highestBid = _bidAmount;
        }

        emit BidPlaced(_nftContract, _tokenId, msg.sender, _bidAmount);
    }

    function endSealedBidAuction(address _nftContract, uint256 _tokenId) public {
        bytes32 auctionId = _getAuctionId(_nftContract, _tokenId);
        Auction storage auction = auctions[auctionId];

        require(auction.isActive, "Auction already ended");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        auction.isActive = false;
        if (auction.highestBidder != address(0)) {
            IERC721(auction.nftContract).transferFrom(address(this), auction.highestBidder, auction.tokenId);
            payable(auction.seller).transfer(auction.highestBid);
            emit AuctionEnded(_nftContract, _tokenId, auction.highestBidder, auction.highestBid);
        }
    }
}
