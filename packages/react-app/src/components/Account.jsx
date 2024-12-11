// src/components/Account.jsx
import React, { useEffect, useState } from "react";
import { Button, Tooltip } from "antd";
import { ethers } from "ethers";

const Account = ({
  address,
  localProvider,
  userSigner,
  mainnetProvider,
  price,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
  useBurner,
}) => {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    let isMounted = true; // 防止在组件卸载后更新状态

    const getBalance = async () => {
      if (address && localProvider) {
        try {
          const balanceBigNumber = await localProvider.getBalance(address);
          const balanceInEther = ethers.utils.formatEther(balanceBigNumber);
          if (isMounted) {
            setBalance(parseFloat(balanceInEther).toFixed(4)); // 保留4位小数
          }
        } catch (error) {
          console.error("获取余额失败:", error);
          if (isMounted) {
            setBalance("0");
          }
        }
      } else {
        setBalance("0");
      }
    };

    getBalance();

    return () => {
      isMounted = false;
    };
  }, [address, localProvider]);

  return address ? (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Tooltip title={`地址: ${address}`}>
        <span style={{ marginRight: "20px", fontWeight: "bold", cursor: "pointer" }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </Tooltip>
      <Tooltip title={`余额: ${balance} ETH`}>
        <span style={{ marginRight: "20px" }}>{balance} ETH</span>
      </Tooltip>
      <Button onClick={logoutOfWeb3Modal} type="primary">
        断开连接
      </Button>
    </div>
  ) : (
    <Button onClick={loadWeb3Modal} type="primary">
      连接钱包
    </Button>
  );
};

export default Account;
