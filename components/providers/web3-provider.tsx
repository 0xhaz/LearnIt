"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia, polygonAmoy, localhost, lens } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { chains } from "@lens-chain/sdk/viem";
import { FC, PropsWithChildren } from "react";

const config = createConfig(
  getDefaultConfig({
    appName: "LearnIt",
    appDescription: "Learn while you earn",
    chains: [sepolia, polygonAmoy, localhost, lens, chains.testnet],
    transports: {
      [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || ""),
      [polygonAmoy.id]: http(
        process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL || ""
      ),
      [localhost.id]: http(`http://localhost:3000`),
      [lens.id]: http(process.env.NEXT_PUBLIC_LENS_RPC_URL || ""),
      [chains.testnet.id]: http(`https://rpc.testnet.lens.dev`),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  })
);

const queryClient = new QueryClient();

export const Web3Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
