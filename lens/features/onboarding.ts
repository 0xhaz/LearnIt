import { client } from "../client";
import { WalletClient } from "viem";
import { Context, evmAddress, SessionClient } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import {
  AuthOptions,
  ChallengeOptions,
  LensAppAddresses,
  LensAuthRole,
} from "@/types";
import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { signMessageWith } from "@lens-protocol/client/viem";

function signMessageWithWallet(walletClient: WalletClient, message: string) {
  return async (message: string) => {
    return await walletClient.signMessage({
      account:
        walletClient.account ??
        (() => {
          throw new Error("Wallet account is undefined");
        })(),
      message: message,
    });
  };
}

export async function generateChallenge(
  walletAddress: string,
  options: ChallengeOptions
) {
  try {
    const appAddress =
      options.appAddress ||
      (options.useTestnet
        ? LensAppAddresses.TESTNET
        : LensAppAddresses.MAINNET);

    let challengeRequest;

    switch (options.role) {
      case LensAuthRole.BUILDER:
        challengeRequest = { builder: { address: walletAddress } };
        break;
      case LensAuthRole.ONBOARDING_USER:
        if (!appAddress) {
          throw new Error("App address is required for onboarding user");
        }
        challengeRequest = {
          onboardingUser: {
            app: appAddress,
            address: walletAddress,
          },
        };
        break;
      case LensAuthRole.ACCOUNT_OWNER:
        if (!appAddress || !options.accountAddress || !options.ownerAddress) {
          throw new Error(
            "App address and account address are required for account owner"
          );
        }
        challengeRequest = {
          accountOwner: {
            app: appAddress,
            account: options.accountAddress,
            owner: options.ownerAddress || walletAddress,
          },
        };
        break;
      case LensAuthRole.ACCOUNT_MANAGER:
        if (!appAddress || !options.accountAddress) {
          throw new Error(
            "App address and account address are required for account manager"
          );
        }
        challengeRequest = {
          accountManager: {
            app: appAddress,
            account: options.accountAddress,
            manager: walletAddress,
          },
        };
        break;
      default:
        throw new Error(`Unsuported role: ${options.role}`);
    }
  } catch (error) {
    console.error("Error generating challenge:", error);
    throw error;
  }
}

export async function onboardUser(
  walletClient: WalletClient,
  options: AuthOptions = {}
): Promise<SessionClient<Context>> {
  try {
    // Validate walletClient.account
    if (!walletClient.account) {
      throw new Error(
        "Wallet account not initialized. Please connect a wallet."
      );
    }

    const address = walletClient.account.address;

    // Determine app ID
    const appId =
      options.customAppId ||
      (options.useTestnet
        ? LensAppAddresses.TESTNET
        : LensAppAddresses.MAINNET);

    // Determine role
    const role = options.role || LensAuthRole.ONBOARDING_USER;

    // Construct login request
    let loginRequest: any;
    switch (role) {
      case LensAuthRole.BUILDER:
        loginRequest = { builder: { wallet: address } };
        break;
      case LensAuthRole.ONBOARDING_USER:
        if (!appId) {
          throw new Error("App ID is required for Onboarding User role");
        }
        loginRequest = { onboardingUser: { app: appId, wallet: address } };
        break;
      case LensAuthRole.ACCOUNT_OWNER:
        if (!appId || !options.accountAddress) {
          throw new Error(
            "App ID and account address are required for Account Owner role"
          );
        }
        loginRequest = {
          accountOwner: {
            app: appId,
            account: options.accountAddress,
            owner: options.ownerAddress || address,
          },
        };
        break;
      case LensAuthRole.ACCOUNT_MANAGER:
        if (!appId || !options.accountAddress) {
          throw new Error(
            "App ID and account address are required for Account Manager role"
          );
        }
        loginRequest = {
          accountManager: {
            app: appId,
            account: options.accountAddress,
            manager: address,
          },
        };
        break;
      default:
        throw new Error(`Unsupported role: ${role}`);
    }

    // Authenticate
    const authenticated = await client.login({
      ...loginRequest,
      signMessage: signMessageWith(walletClient),
    });

    if (authenticated.isErr()) {
      throw new Error(
        `Authentication failed for role ${role}: ${authenticated.error.message}`
      );
    }

    const sessionClient: SessionClient<Context> = authenticated.value;

    return sessionClient;
  } catch (error) {
    console.error(
      `Error during onboarding (role: ${
        options.role || LensAuthRole.ONBOARDING_USER
      }):`,
      String(error)
    );
    throw new Error(`Failed to onboard user: ${String(error)}`);
  }
}
