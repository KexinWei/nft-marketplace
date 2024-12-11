import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTAuctionArtifact from "../abis/NFTAuction.json";
import MyNFTCollectionArtifact from "../abis/MyNFTCollection.json";
import { Button, Modal, Input } from "antd";

const AuctionsGallery = ({ auctionContractAddress }) => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSigner, setUserSigner] = useState(null);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [currentBidAuctionId, setCurrentBidAuctionId] = useState(null);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        alert("请安装 MetaMask!");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setUserSigner(signer);
    };
    init();
  }, []);

  const fetchActiveAuctions = async () => {
    if (!auctionContractAddress || !userSigner) {
      alert("拍卖合约地址或签名者不可用");
      return;
    }

    setLoading(true);
    try {
      const auctionContract = new ethers.Contract(auctionContractAddress, NFTAuctionArtifact.abi, userSigner);

      // 假设拍卖合约有一个获取所有拍卖的函数，例如 getActiveAuctions()
      // 如果没有，需要根据实际合约实现调整
      const totalAuctions = await auctionContract.totalAuctions();
      const auctions = [];

      for (let i = 0; i < totalAuctions; i++) {
        const auction = await auctionContract.auctions(i);
        if (auction.isActive) {
          // 获取NFT详情
          const nftContract = new ethers.Contract(auction.nftAddress, MyNFTCollectionArtifact.abi, userSigner);
          const tokenURI = await nftContract.tokenURI(auction.tokenId);
          auctions.push({
            auctionId: i,
            seller: auction.seller,
            highestBidder: auction.highestBidder,
            highestBid: ethers.utils.formatEther(auction.highestBid),
            endTime: auction.endTime.toNumber(),
            nftAddress: auction.nftAddress,
            tokenId: auction.tokenId.toNumber(),
            tokenURI,
          });
        }
      }

      setActiveAuctions(auctions);
    } catch (error) {
      console.error("Error fetching active auctions:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActiveAuctions();
    // 可设置定时刷新
    const interval = setInterval(() => {
      fetchActiveAuctions();
    }, 60000); // 每分钟刷新一次

    return () => clearInterval(interval);
  }, [auctionContractAddress, userSigner]);

  const openBidModal = auctionId => {
    setCurrentBidAuctionId(auctionId);
    setBidModalVisible(true);
  };

  const closeBidModal = () => {
    setCurrentBidAuctionId(null);
    setBidAmount("");
    setBidModalVisible(false);
  };

  const submitBid = async () => {
    if (!currentBidAuctionId || !bidAmount || isNaN(bidAmount)) {
      alert("请输入有效的出价金额！");
      return;
    }

    try {
      const auctionContract = new ethers.Contract(auctionContractAddress, NFTAuctionArtifact.abi, userSigner);

      const tx = await auctionContract.bid(currentBidAuctionId, {
        value: ethers.utils.parseEther(bidAmount),
      });
      await tx.wait();
      alert("出价成功！");
      closeBidModal();
      fetchActiveAuctions();
    } catch (error) {
      console.error("出价失败:", error);
      alert("出价失败！请检查控制台日志。");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>所有正在进行的拍卖</h2>
      {loading && <p>加载中...</p>}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {activeAuctions.length === 0 && !loading && <p>当前没有正在进行的拍卖。</p>}
        {activeAuctions.map(auction => (
          <div
            key={auction.auctionId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              margin: "10px",
              width: "300px",
            }}
          >
            <h3>NFT #{auction.tokenId}</h3>
            <img
              src={
                auction.tokenURI.startsWith("ipfs://")
                  ? auction.tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : auction.tokenURI
              }
              alt={`NFT-${auction.tokenId}`}
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
            <p>
              <b>最高出价:</b> {auction.highestBid} ETH
            </p>
            <p>
              <b>最高出价者:</b> {auction.highestBidder}
            </p>
            <p>
              <b>结束时间:</b> {new Date(auction.endTime * 1000).toLocaleString()}
            </p>
            <Button type="primary" onClick={() => openBidModal(auction.auctionId)}>
              出价
            </Button>
          </div>
        ))}
      </div>

      {/* 出价模态框 */}
      <Modal title="出价" visible={bidModalVisible} onOk={submitBid} onCancel={closeBidModal} okText="提交出价">
        <Input placeholder="出价金额 (ETH)" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
      </Modal>
    </div>
  );
};

export default AuctionsGallery;
