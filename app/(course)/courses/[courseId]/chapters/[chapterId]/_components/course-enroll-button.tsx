"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useWalletClient,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  prepareTransaction,
  readContract,
} from "thirdweb";
import { createWalletAdapter } from "thirdweb/wallets";
import { useActiveWallet, useSetActiveWallet } from "thirdweb/react";
import { getBuyWithFiatQuote } from "thirdweb/pay";
import { sepolia } from "thirdweb/chains";
import { viemAdapter } from "thirdweb/adapters/viem";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { thirdwebClient } from "@/lib/thirdweb-client";

// Hypothetical API function to check enrollment status (implement this based on your backend)
const checkEnrollmentStatus = async (userAddress: string, courseId: string) => {
  // Replace with your actual API endpoint
  const response = await fetch(
    `/api/enrollment?user=${userAddress}&courseId=${courseId}`
  );
  const data = await response.json();
  return data.isEnrolled; // Expecting { isEnrolled: boolean }
};

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { address: userWallet, status: wagmiStatus } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const activeWallet = useActiveWallet();
  const setActiveWallet = useSetActiveWallet();

  console.log("walletClient", walletClient);
  console.log("userWallet", userWallet);
  console.log("activeWallet", activeWallet);
  console.log("wagmiStatus", wagmiStatus);

  // Sync Wagmi wallet with Thirdweb
  useEffect(() => {
    const syncWallet = async () => {
      if (walletClient && userWallet && !activeWallet) {
        try {
          const adaptedAccount = viemAdapter.walletClient.fromViem({
            walletClient: walletClient as any,
          });

          const thirdwebWallet = createWalletAdapter({
            client: thirdwebClient,
            adaptedAccount,
            chain: sepolia,
            onDisconnect: async () => {
              await disconnectAsync();
            },
            switchChain: async chain => {
              await switchChainAsync({ chainId: chain.id });
            },
          });

          await setActiveWallet(thirdwebWallet);
          console.log("Wallet synced with Thirdweb");

          const account = await thirdwebWallet.getAccount();
          console.log("Thirdweb wallet account:", account);
          if (!account?.address) {
            throw new Error("Thirdweb wallet does not have a valid address");
          }
        } catch (error) {
          console.error("Error syncing wallet with Thirdweb:", error);
        }
      }
    };

    if (walletClient && userWallet && wagmiStatus === "connected") {
      syncWallet();
    }
  }, [
    walletClient,
    userWallet,
    wagmiStatus,
    activeWallet,
    setActiveWallet,
    disconnectAsync,
    switchChainAsync,
  ]);

  // Handle disconnection
  useEffect(() => {
    const disconnectIfNeeded = async () => {
      if (activeWallet && wagmiStatus === "disconnected") {
        await activeWallet.disconnect();
        console.log("Disconnected Thirdweb wallet due to Wagmi disconnect");
      }
    };
    disconnectIfNeeded();
  }, [wagmiStatus, activeWallet]);

  const onClick = async () => {
    if (!userWallet || !activeWallet) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    try {
      const account = await activeWallet.getAccount();
      console.log("Account for transaction:", account);

      if (!account?.address) {
        throw new Error("Active wallet does not have a valid address");
      }

      // Get the quote from Universal Bridge
      const quote = await getBuyWithFiatQuote({
        client: thirdwebClient,
        fromCurrencySymbol: "USD",
        toChainId: sepolia.id,
        toAmount: price.toString(),
        toTokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC
        fromAddress: userWallet,
        toAddress: process.env.NEXT_PUBLIC_THIRDWEB_RECEIVER_WALLET!,
        purchaseData: {
          courseId,
        },
      });

      console.log("Quote from Universal Bridge:", quote);

      // Initialize the USDC contract
      const usdcContract = getContract({
        client: thirdwebClient,
        chain: sepolia,
        address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
      });

      // Adjust the price for USDC's 6 decimals
      const usdcAmount = BigInt(Math.round(price * 10 ** 6)); // USDC has 6 decimals

      // Check current allowance
      const currentAllowance = await readContract({
        contract: usdcContract,
        method:
          "function allowance(address owner, address spender) view returns (uint256)",
        params: [userWallet, quote.toAddress],
      });

      console.log("Current USDC allowance:", currentAllowance.toString());

      // Step 1: Approve the smart wallet to spend USDC if necessary
      if (currentAllowance < usdcAmount) {
        const approveTx = await prepareContractCall({
          contract: usdcContract,
          method: "function approve(address spender, uint256 amount)",
          params: [
            quote.toAddress, // Smart wallet address
            usdcAmount,
          ],
        });

        const approveResult = await sendTransaction({
          account,
          transaction: approveTx,
        });
        console.log(
          "Approval transaction successful:",
          approveResult.transactionHash
        );
      } else {
        console.log("Sufficient allowance already exists");
      }

      // Step 2: Execute the Universal Bridge payment
      const paymentTx = await prepareTransaction({
        to: quote.toAddress,
        chain: sepolia,
        client: thirdwebClient,
        data: (usdcContract.abi as { name: string; inputs?: any }[])?.find(
          abi => abi.name === "transfer"
        )?.inputs
          ? (
              await prepareContractCall({
                contract: usdcContract,
                method: "function transfer(address to, uint256 amount)",
                params: [quote.toAddress, usdcAmount],
              })
            ).data
          : undefined,
      });

      const paymentResult = await sendTransaction({
        account,
        transaction: paymentTx,
      });

      console.log(
        "Payment transaction successful:",
        paymentResult.transactionHash
      );

      // Step 3: Verify enrollment status on the backend
      const isEnrolled = await checkEnrollmentStatus(userWallet, courseId);
      if (!isEnrolled) {
        throw new Error(
          "Enrollment not registered on the backend. Please contact support."
        );
      }

      toast.success("Enrollment successful!");
      router.refresh();
    } catch (error) {
      console.error("[UniversalBridgePaymentError]", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      Enroll for {formatPrice(price)}
    </Button>
  );
};
