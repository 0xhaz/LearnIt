"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import {
  getContract,
  prepareContractCall,
  sendTransaction,
  prepareTransaction,
  readContract,
} from "thirdweb";
import { useActiveWallet } from "thirdweb/react";
import { getBuyWithFiatQuote } from "thirdweb/pay";
import { sepolia } from "thirdweb/chains";
import {
  ENROLL_COURSE,
  CHECK_ENROLLMENT,
} from "@/graphql/mutations/enroll-course";
import { getClient } from "@/lib/graphql-client";
import { useSafeSyncWallet } from "@/hooks/use-safesync-wallet";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { thirdwebClient } from "@/lib/thirdweb-client";

const retryQuery = async (
  client: any,
  query: string,
  variables: any,
  maxRetries: number = 3,
  delayMs: number = 1000
) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const result = await client.request(query, variables);
      if (result.checkEnrollment) {
        return result;
      }
      throw new Error("Enrollment not found");
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Max retries reached");
};

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
}: CourseEnrollButtonProps) => {
  useSafeSyncWallet(); // Handles wallet sync and disconnection
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const { address: userWallet } = useAccount();
  const { data: walletClient } = useWalletClient();
  const activeWallet = useActiveWallet();

  console.log("walletClient", walletClient);
  console.log("userWallet", userWallet);
  console.log("activeWallet", activeWallet);

  useEffect(() => {
    setMounted(true);
  }, []);

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

      // Step 3: Create the enrollment record on the backend
      const client = getClient();
      const enrollmentResult = await client.request(ENROLL_COURSE, {
        wallet: userWallet,
        courseId,
        enrolledVia: "UniversalBridge",
        txHash: paymentResult.transactionHash,
      });

      // Step 4: Verify enrollment status with retry
      const checkResult = await retryQuery(client, CHECK_ENROLLMENT, {
        wallet: userWallet,
        courseId,
      });

      if (!checkResult.checkEnrollment) {
        throw new Error(
          "Enrollment not registered on the backend. Please contact support."
        );
      }

      console.log("Enrollment verified:", checkResult.checkEnrollment);

      // Optional Step 5: Notify Universal Bridge (if required)
      // This step would involve an API call to Thirdweb to confirm the payment.
      // Example (hypothetical):
      // await notifyThirdwebUniversalBridge(paymentResult.transactionHash);

      toast.success("Enrollment successful!");
      router.refresh();
    } catch (error) {
      console.error("[UniversalBridgePaymentError]", error);
      let errorMessage = "Payment failed. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (
        error instanceof Error &&
        "errors" in error &&
        Array.isArray((error as any).errors) &&
        (error as any).errors.length > 0
      ) {
        // Handle GraphQL errors
        errorMessage = (error as any).errors[0].message || errorMessage;
      }
      if (errorMessage.includes("already enrolled")) {
        toast.error("You are already enrolled in this course.");
      } else if (errorMessage.includes("not registered on the backend")) {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

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
