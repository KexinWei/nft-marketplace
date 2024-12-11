import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "antd";
import hardhatContracts from "../contracts/hardhat_contracts.json";
import MyNFTCollectionArtifact from "../abis/MyNFTCollection.json";

const MyNFTs = ({ address }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  let isMounted = true;

  // 将 loadNFTs 移到 useEffect 外部
  const loadNFTs = async () => {
    if (!address) return;
    setLoading(true);

    try {
      // 连接到 Hardhat 本地节点
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

      // 获取合约地址
      const network = "hardhat";
      const contractAddress = hardhatContracts[network]["MyNFTCollection"].address;

      // 创建合约实例
      const contract = new ethers.Contract(contractAddress, MyNFTCollectionArtifact.abi, provider);

      // 获取用户的 NFT 数量
      const balance = await contract.balanceOf(address);
      const balanceNumber = balance.toNumber();

      const tokens = [];
      for (let i = 0; i < balanceNumber; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await contract.tokenURI(tokenId);
        tokens.push({
          tokenId: tokenId.toNumber(),
          tokenURI,
        });
      }

      if (isMounted) {
        setNfts(tokens);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      if (isMounted) {
        setNfts([]);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadNFTs();

    return () => {
      isMounted = false;
    };
  }, [address]);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>我的 NFT</h2>
      <Button onClick={loadNFTs} style={{ marginBottom: "20px" }}>
        刷新我的 NFT
      </Button>
      {loading && <p>加载中...</p>}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {nfts.length === 0 && !loading && <p>你没有持有任何 NFT。</p>}
        {nfts.map((nft, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              margin: "10px",
              width: "200px",
              textAlign: "center",
            }}
          >
            <img
              src={
                nft.tokenURI.startsWith("ipfs://")
                  ? nft.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : nft.tokenURI
              }
              alt={`NFT-${nft.tokenId}`}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <p>Token ID: {nft.tokenId}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyNFTs;
