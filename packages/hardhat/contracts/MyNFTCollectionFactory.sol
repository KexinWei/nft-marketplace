// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyNFTCollection.sol";

contract MyNFTCollectionFactory {
    address[] public collections;

    event MyNFTCollectionCreated(address indexed newContract);

    function createMyNFTCollection(string memory name, string memory symbol) public returns (address) {
        MyNFTCollection newCollection = new MyNFTCollection(name, symbol);
        collections.push(address(newCollection));

        emit MyNFTCollectionCreated(address(newCollection));
        return address(newCollection);
    }

    function getCollections() public view returns (address[] memory) {
        return collections;
    }
}
