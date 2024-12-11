import React, { useState, useEffect } from "react";

const INFURA_API_KEY = process.env.REACT_APP_INFURA_KEY ?? "your-infura-api-key"; // 替换为你的 Infura API Key

const fetchNFTsFromInfura = async walletAddress => {
  try {
    const response = await fetch(`https://nft.api.infura.io/networks/1/accounts/${walletAddress}/assets`, {
      headers: {
        Authorization: `Bearer ${INFURA_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching NFTs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.assets || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const NFTGallery = ({ address }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNFTs = async () => {
    if (!address) {
      alert("请先连接钱包");
      return;
    }

    setLoading(true);
    const fetchedNFTs = await fetchNFTsFromInfura(address);
    setNfts(fetchedNFTs);
    setLoading(false);
  };

  useEffect(() => {
    loadNFTs();
    // 可设置定时刷新
    const interval = setInterval(() => {
      loadNFTs();
    }, 60000); // 每分钟刷新一次

    return () => clearInterval(interval);
  }, [address]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>我的 NFT 收藏</h2>
      <Button onClick={loadNFTs} style={{ marginBottom: "20px" }}>
        刷新我的 NFT
      </Button>

      {loading && <p>加载中...</p>}

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {nfts.length === 0 && !loading && <p>没有找到 NFT</p>}
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
                nft.metadata?.image || nft.metadata?.image_url
                  ? nft.metadata.image.startsWith("ipfs://")
                    ? nft.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                    : nft.metadata.image
                  : "https://via.placeholder.com/200"
              }
              alt={nft.metadata?.name || `NFT-${index}`}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <p>{nft.metadata?.name || "未命名 NFT"}</p>
            <p>
              <b>合约地址:</b> {nft.contract}
            </p>
            <p>
              <b>Token ID:</b> {nft.tokenId}
            </p>
            {/* 显示购买价格，如果有 */}
            {/* 这里可以根据实际情况添加购买价格 */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTGallery;
