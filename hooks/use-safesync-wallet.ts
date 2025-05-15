import { useEffect } from "react";
import {
  useAccount,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { createWalletAdapter } from "thirdweb/wallets";
import { useActiveWallet, useSetActiveWallet } from "thirdweb/react";
import { viemAdapter } from "thirdweb/adapters/viem";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { sepolia } from "thirdweb/chains";
import toast from "react-hot-toast";

export function useSafeSyncWallet() {
  const { address: userWallet, status: wagmiStatus } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const activeWallet = useActiveWallet();
  const setActiveWallet = useSetActiveWallet();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handle disconnection
    const disconnectIfNeeded = async () => {
      if (activeWallet && wagmiStatus === "disconnected") {
        await activeWallet.disconnect();
        console.log("Disconnected Thirdweb wallet due to Wagmi disconnect");
      }
    };
    disconnectIfNeeded();

    // Sync wallet if not already synced
    if (
      !walletClient ||
      !userWallet ||
      activeWallet ||
      wagmiStatus !== "connected"
    ) {
      return;
    }

    const syncWallet = async () => {
      try {
        const adaptedAccount = viemAdapter.walletClient.fromViem({
          walletClient: walletClient as any,
        });

        const thirdwebWallet = createWalletAdapter({
          client: thirdwebClient,
          adaptedAccount,
          chain: sepolia,
          onDisconnect: disconnectAsync,
          switchChain: chain =>
            switchChainAsync({ chainId: chain.id }).then(() => {}),
        });

        // Verify the wallet has an address
        const account = await thirdwebWallet.getAccount();
        if (!account?.address) {
          throw new Error("Thirdweb wallet does not have a valid address");
        }

        // ⏱ Defer until after hydration
        requestIdleCallback(() => {
          setActiveWallet(thirdwebWallet);
          console.log("Wallet synced with Thirdweb:", account.address);
        });
      } catch (error) {
        console.error("Error syncing wallet with Thirdweb:", error);
        toast.error("Failed to sync wallet. Please try again.");
      }
    };

    syncWallet();
  }, [
    walletClient,
    userWallet,
    wagmiStatus,
    activeWallet,
    setActiveWallet,
    disconnectAsync,
    switchChainAsync,
  ]);
}
