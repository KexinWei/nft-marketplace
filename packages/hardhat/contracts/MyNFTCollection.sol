// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFTCollection is ERC721URIStorage {
    uint256 public tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mintNFT(address recipient, string memory uri) public returns (uint256) {
        uint256 newTokenId = tokenIdCounter;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, uri);
        tokenIdCounter += 1;
        return newTokenId;
    }
}
