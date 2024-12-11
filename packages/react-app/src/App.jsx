// src/App.jsx
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { Menu } from "antd";
import "antd/dist/antd.css";
import { useUserProviderAndSigner } from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Account from "./components/Account";
import NetworkDisplay from "./components/NetworkDisplay";
import ThemeSwitch from "./components/ThemeSwitch";
import { NETWORKS, INFURA_ID } from "./constants";
import { getRPCPollTime, Web3ModalSetup } from "./helpers";
import { useStaticJsonRPC } from "./hooks";
import AuctionsGallery from "./components/AuctionsGallery";
import CreateNFT from "./components/CreateNFT";
import MyNFTs from "./components/MyNFTs";
import { loadAppContracts } from "./helpers/loadAppContracts"; // 确保正确导入
import ErrorBoundary from './components/ErrorBoundary'; // 导入错误边界

const initialNetwork = NETWORKS.localhost;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true;
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();
const providers = [`https://mainnet.infura.io/v3/${INFURA_ID}`, "https://rpc.scaffoldeth.io:48544"];

function App() {
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [contracts, setContracts] = useState(null);

  const location = useLocation();
  const targetNetwork = initialNetwork;
  const blockExplorer = targetNetwork.blockExplorer;

  const localProvider = useStaticJsonRPC([
    process.env.NEXT_PUBLIC_HARDHAT_HOST ? process.env.NEXT_PUBLIC_HARDHAT_HOST : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers, localProvider);

  const mainnetProviderPollingTime = getRPCPollTime(mainnetProvider);
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider, mainnetProviderPollingTime);

  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    let isMounted = true;

    async function getAddressAsync() {
      if (userSigner && isMounted) {
        try {
          const newAddress = await userSigner.getAddress();
          if (isMounted) {
            setAddress(newAddress);
          }
        } catch (error) {
          console.error("获取地址失败:", error);
        }
      }
    }
    getAddressAsync();

    return () => {
      isMounted = false;
    };
  }, [userSigner]);

  const localChainId = localProvider?._network?.chainId;
  const selectedChainId = userSigner?.provider?._network?.chainId;

  const logoutOfWeb3Modal = useCallback(async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider?.provider?.disconnect && typeof injectedProvider.provider.disconnect === "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  }, [injectedProvider]);

  const loadWeb3Modal = useCallback(async () => {
    try {
      const provider = await web3Modal.requestProvider();
      setInjectedProvider(new ethers.providers.Web3Provider(provider));

      provider.on("chainChanged", chainId => {
        console.log(`链更改为 ${chainId}! 更新提供者`);
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
      });

      provider.on("accountsChanged", () => {
        console.log("账户更改!");
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
      });

      provider.on("disconnect", (code, reason) => {
        console.log(code, reason);
        logoutOfWeb3Modal();
      });
    } catch (error) {
      console.error("加载 Web3Modal 失败:", error);
    }
  }, [logoutOfWeb3Modal]);

  useEffect(() => {
    let isMounted = true;

    const loadContracts = async () => {
      try {
        const loadedContracts = await loadAppContracts();
        console.log('Loaded Contracts:', loadedContracts); // 添加日志
        if (isMounted) {
          setContracts(loadedContracts);
        }
      } catch (error) {
        console.error("加载合约失败:", error);
      }
    };

    loadContracts();

    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }

    async function checkSafeApp() {
      if (await web3Modal.isSafeApp()) {
        loadWeb3Modal();
      }
    }
    checkSafeApp();

    return () => {
      isMounted = false;
    };
  }, [loadWeb3Modal]);

  // 条件渲染以防止访问未定义的属性
  if (!contracts || !contracts.deployedContracts || !contracts.deployedContracts["NFTAuction"]) {
    return <div>加载合约信息中...</div>;
  }

  const auctionContractAddress = contracts.deployedContracts["NFTAuction"].address;

  return (
    <ErrorBoundary>
      <div className="App">
        <Header>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {/* 导航栏 */}
            <Menu theme="light" mode="horizontal" selectedKeys={[location.pathname]} style={{ flex: 1 }}>
              <Menu.Item key="/">
                <Link to="/">拍卖NFT</Link>
              </Menu.Item>
              <Menu.Item key="/create-nft">
                <Link to="/create-nft">创建NFT</Link>
              </Menu.Item>
              <Menu.Item key="/my-nfts">
                <Link to="/my-nfts">我的NFT</Link>
              </Menu.Item>
            </Menu>
            {/* 右侧显示Account组件 */}
            <Account
              useBurner={USE_BURNER_WALLET}
              address={address}
              localProvider={localProvider}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              price={price}
              web3Modal={web3Modal}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              blockExplorer={blockExplorer}
            />
          </div>
        </Header>
        <NetworkDisplay
          NETWORKCHECK={NETWORKCHECK}
          localChainId={localChainId}
          selectedChainId={selectedChainId}
          targetNetwork={targetNetwork}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
        />

        <Switch>
          {/* 首页 - 展示所有正在进行的拍卖 */}
          <Route exact path="/">
            <AuctionsGallery auctionContractAddress={auctionContractAddress} />
          </Route>

          {/* 创建NFT页面 */}
          <Route exact path="/create-nft">
            <CreateNFT />
          </Route>

          {/* 我的NFT页面 */}
          <Route exact path="/my-nfts">
            <MyNFTs address={address} />
          </Route>
        </Switch>
        <ThemeSwitch />
      </div>
    </ErrorBoundary>
  );
}

export default App;
