import { client } from "../client";
import { Address, Chain, WalletClient } from "viem";
import { Context, SessionClient } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";
import {
  AuthOptions,
  ChallengeOptions,
  LensAppAddresses,
  LensAuthRole,
} from "../../types";
import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client";
import { signMessageWith } from "@lens-protocol/client/viem";
import { setContext } from "@apollo/client/link/context";
import { WalletActions } from "@lens-chain/sdk/viem";
import { evmAddress, Role, Account } from "@lens-protocol/react";
import { create } from "zustand";

export type SessionState = {
  session: SessionClient | null;
  walletClient: WalletClient | null;
  accountAddress: Address | null;
};

export type SessionActions = {
  authenticate: (
    walletAddress: Address,
    accountAddress: Address,
    role: Role
  ) => Promise<void>;
};

export type SessionStore = SessionState & SessionActions;

const defaultInitState: SessionState = {
  session: null,
  walletClient: null,
  accountAddress: null,
};

export const useSessionStore = create<SessionStore>(set => ({
  ...defaultInitState,
  authenticate,
}));

const authenticateOnboardingUser = async (
  walletAddress: Address,
  accountAddress: Address
) => {
  const walletClient = useSessionStore.getState().walletClient;
  if (!walletClient) {
    throw new Error("Wallet client is not initialized");
  }

  const authenticated = await client.login({
    onboardingUser: {
      wallet: evmAddress(walletAddress),
      app: LensAppAddresses.TESTNET,
    },
    signMessage: async (message: string) => {
      return walletClient.signMessage({
        account:
          walletClient.account ||
          (() => {
            throw new Error("Wallet account is undefined");
          })(),
        message,
      });
    },
  });

  if (authenticated.isErr()) {
    return console.error("Authentication failed:", authenticated.error.message);
  }

  console.log("Authenticated successfully:", authenticated.value);
  const sessionClient = authenticated.value;

  useSessionStore.setState(state => ({
    ...state,
    session: sessionClient,
    accountAddress,
  }));
};

const authenticateAccountOwnerUser = async (
  walletAddress: Address,
  accountAddress: Address
) => {
  const walletClient = useSessionStore.getState().walletClient;
  if (!walletClient) {
    throw new Error("Wallet client is not initialized");
  }
};

export async function generateChallenge(
  walletAddress: Address,
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
  walletAddress: Address,
  options: AuthOptions = {}
): Promise<SessionClient<Context>> {
  try {
    const walletClient = useSessionStore.getState().walletClient;
    // Validate walletClient.account
    if (!walletClient) {
      throw new Error(
        "Wallet account not initialized. Please connect a wallet."
      );
    }

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
        loginRequest = { builder: { walletAddress } };
        break;
      case LensAuthRole.ONBOARDING_USER:
        if (!appId) {
          throw new Error("App ID is required for Onboarding User role");
        }
        loginRequest = {
          onboardingUser: { app: appId, wallet: walletAddress },
        };
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
            owner: options.ownerAddress || walletAddress,
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
            manager: walletAddress,
          },
        };
        break;
      default:
        throw new Error(`Unsupported role: ${role}`);
    }

    // Authenticate
    const authenticated = await client.login({
      onboardingUser: {
        wallet: evmAddress(walletAddress),
        app: LensAppAddresses.TESTNET,
      },
      signMessage: async (message: string) => {
        return walletClient.signMessage({
          account:
            walletClient.account ||
            (() => {
              throw new Error("Wallet account is undefined");
            })(),
          message,
        });
      },
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

export const authenticate = async (
  walletAddress: Address,
  accountAddress: Address,
  role: Role
) => {
  if (role === Role.OnboardingUser) {
    await authenticateOnboardingUser(walletAddress, accountAddress);
    return;
  } else if (role === Role.AccountOwner) {
    await authenticateAccountOwnerUser(walletAddress, accountAddress);
    return;
  } else {
    throw new Error(`Unsupported role: ${role}`);
  }
};
