// src/helpers/loadAppContracts.js
import NFTAuction from '../abis/NFTAuction.json';
import { ethers } from 'ethers';

export const loadAppContracts = async () => {
  console.log('NFTAuction JSON:', NFTAuction); // 调试日志

  const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_HARDHAT_HOST || 'http://localhost:8545');
  const signer = provider.getSigner();

  // 获取合约地址，可以从环境变量或JSON文件中获取
  const auctionContractAddress = NFTAuction.address;

  if (!auctionContractAddress) {
    throw new Error("NFTAuction address is undefined. 请检查部署是否成功并且路径正确。");
  }

  const nftAuctionContract = new ethers.Contract(
    auctionContractAddress,
    NFTAuction.abi,
    signer
  );

  return {
    deployedContracts: {
      NFTAuction: {
        address: auctionContractAddress,
        contract: nftAuctionContract,
      },
    },
  };
};
