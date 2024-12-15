import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, fallback, http } from "viem";
import { hardhat } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig, { DEFAULT_ALCHEMY_API_KEY } from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks;

export const wagmiConfig = createConfig({
  chains: enabledChains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    let rpcFallbacks = [http(chain.rpcUrls.default.http[0])];

    const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
    if (alchemyHttpUrl) {
      const isUsingDefaultKey = scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY;
      // If using default Scaffold-ETH 2 API key, we prioritize the default RPC
      rpcFallbacks = isUsingDefaultKey ? [http(chain.rpcUrls.default.http[0]), http(alchemyHttpUrl)] : [http(alchemyHttpUrl), http(chain.rpcUrls.default.http[0])];
    }

    return createClient({
      chain,
      transport: fallback(rpcFallbacks),
      ...(chain.id !== (hardhat as Chain).id
        ? {
            pollingInterval: scaffoldConfig.pollingInterval,
          }
        : {}),
    });
  },
});
