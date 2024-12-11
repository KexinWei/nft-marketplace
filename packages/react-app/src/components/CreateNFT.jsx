// src/components/CreateNFT.jsx
import React, { useState } from "react";
import { Button, Input, Form } from "antd";
import { ethers } from "ethers";
import MyNFTCollectionArtifact from "../abis/MyNFTCollection.json";
import NFTAuctionArtifact from "../abis/NFTAuction.json";
import hardhatContracts from '../contracts/hardhat_contracts.json';

const CreateNFT = () => {
  const [imageURL, setImageURL] = useState("");
  const [collectionAddr, setCollectionAddr] = useState("");
  const [mintStatus, setMintStatus] = useState("");
  const [auctionStatus, setAuctionStatus] = useState("");

  const handleImageChange = e => {
    setImageURL(e.target.value);
  };

  const handleCollectionAddrChange = e => {
    setCollectionAddr(e.target.value);
  };

  const handleMintNFT = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const network = "hardhat";
      const contractAddress = hardhatContracts[network]["MyNFTCollection"].address;

      const contract = new ethers.Contract(contractAddress, MyNFTCollectionArtifact.abi, signer);

      const tx = await contract.mintNFT(imageURL);
      setMintStatus("正在铸造 NFT...");
      await tx.wait();
      setMintStatus("NFT 铸造成功！");
    } catch (error) {
      console.error("铸造 NFT 失败:", error);
      setMintStatus("铸造 NFT 失败！");
    }
  };

  const handleApproveAuction = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const network = "hardhat";
      const nftContractAddress = hardhatContracts[network]["MyNFTCollection"].address;
      const auctionContractAddress = hardhatContracts[network]["NFTAuction"].address;

      const nftContract = new ethers.Contract(nftContractAddress, MyNFTCollectionArtifact.abi, signer);

      // 假设你要授权特定的 tokenId，或者使用 setApprovalForAll
      const tokenId = 0; // 修改为你实际的 tokenId

      const tx = await nftContract.approve(auctionContractAddress, tokenId);
      setAuctionStatus("正在授权拍卖合约...");
      await tx.wait();
      setAuctionStatus("授权成功！");
    } catch (error) {
      console.error("授权失败:", error);
      setAuctionStatus("授权失败！");
    }
  };

  const handleCreateAuction = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const network = "hardhat";
      const auctionContractAddress = hardhatContracts[network]["NFTAuction"].address;

      const auctionContract = new ethers.Contract(auctionContractAddress, NFTAuctionArtifact.abi, signer);

      // 设置拍卖参数
      const nftAddress = hardhatContracts[network]["MyNFTCollection"].address;
      const tokenId = 0; // 修改为实际的 tokenId
      const endTime = Math.floor(Date.now() / 1000) + 3600; // 1小时后
      const tokenURI = "https://example.com/nft/0"; // 修改为实际的 tokenURI

      const tx = await auctionContract.createAuction(nftAddress, tokenId, endTime, tokenURI);
      setAuctionStatus("正在创建拍卖...");
      await tx.wait();
      setAuctionStatus("拍卖创建成功！");
    } catch (error) {
      console.error("创建拍卖失败:", error);
      setAuctionStatus("创建拍卖失败！");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>创建 NFT</h2>
      <Form>
        <Form.Item label="图片 URL">
          <Input value={imageURL} onChange={handleImageChange} />
        </Form.Item>
        <Form.Item label="NFT 合约地址">
          <Input value={collectionAddr} onChange={handleCollectionAddrChange} disabled />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleMintNFT}>
            铸造 NFT
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={handleApproveAuction}>
            授权拍卖合约
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleCreateAuction}>
            创建拍卖
          </Button>
        </Form.Item>
      </Form>
      {mintStatus && <p>{mintStatus}</p>}
      {auctionStatus && <p>{auctionStatus}</p>}
    </div>
  );
};

export default CreateNFT;
