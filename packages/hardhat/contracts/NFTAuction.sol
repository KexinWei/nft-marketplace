// contracts/NFTAuction.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTAuction {
    struct Auction {
        address seller;
        address highestBidder;
        uint256 highestBid;
        bool isActive;
        uint256 endTime;
    }

    mapping(uint256 => Auction) public auctions;
    IERC721 public nftContract;

    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    function createAuction(uint256 tokenId, uint256 duration) public {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        auctions[tokenId] = Auction(msg.sender, address(0), 0, true, block.timestamp + duration);
    }

    function bid(uint256 tokenId) public payable {
        Auction storage auction = auctions[tokenId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
    }

    function endAuction(uint256 tokenId) public {
        Auction storage auction = auctions[tokenId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(auction.isActive, "Auction already ended");

        auction.isActive = false;
        if (auction.highestBidder != address(0)) {
            nftContract.transferFrom(address(this), auction.highestBidder, tokenId);
            payable(auction.seller).transfer(auction.highestBid);
        } else {
            nftContract.transferFrom(address(this), auction.seller, tokenId);
        }
    }
}
