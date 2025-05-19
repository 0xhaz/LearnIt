import { onboardUser } from "../features/onboarding";
import { createUser } from "../features/account";
import { getLastLoggedInAccount, logout } from "../features/session";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Address, WalletClient, createWalletClient, http } from "viem";
import { lensTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { LensAppAddresses, LensAuthRole } from "../../types";
import { account } from "@lens-protocol/metadata";
import {
  SessionStore,
  authenticate,
  useSessionStore,
} from "../features/onboarding";
import { client } from "../client";
import { evmAddress } from "@lens-protocol/client";

// Apollo Client setup
const ENDPOINT = "https://api.testnet.lens.xyz/graphql";

if (!ENDPOINT) {
  throw new Error("NEXT_PUBLIC_LENS_TESTNET_GRAPHQL_URL is not defined");
}

const httpLink = new HttpLink({
  uri: ENDPOINT,
});

const authLink = setContext(async (_, { headers }) => {
  // Adjust key based on your PublicClient's storage implementation
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("lens_auth_token")
      : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

interface TestAccountParams {
  name: string;
  bio: string;
  picture: string;
  coverPicture: string;
  attributes: { key: string; value: string }[];
}

async function testAccountCreation(
  walletAddress: Address,
  params: TestAccountParams
): Promise<void> {
  try {
    const walletClient = useSessionStore.getState().walletClient;
    const loginResult = await client.login({
      onboardingUser: {
        wallet: evmAddress(walletAddress),
        app: LensAppAddresses.TESTNET,
      },
      signMessage: async (message: string) => {
        const signedMessage = await walletClient?.signMessage({
          account:
            walletClient.account ||
            (() => {
              throw new Error("Wallet account is undefined");
            })(),
          message,
        });

        if (!signedMessage) {
          throw new Error("Failed to sign message");
        }

        return signedMessage;
      },
    });

    if (loginResult.isErr()) {
      throw new Error(`Login failed: ${loginResult.error.message}`);
    }

    const sessionClient = loginResult.value;
    console.log("Onboarding user...");
    const onboardingResult = await onboardUser(walletAddress);

    if (!sessionClient) {
      throw new Error("Failed to onboard user");
    }

    console.log("Onboarding successful");
    console.log("Session client:", sessionClient);
    console.log("Tokens in localStorage:", Object.keys(localStorage));

    console.log("Creating user...");
    const accountResult = await createUser(
      walletClient ??
        (() => {
          throw new Error("Wallet client is null");
        })(),
      params.name,
      params.bio,
      params.picture,
      params.coverPicture,
      params.attributes
    );

    if (!accountResult.success) {
      throw new Error("Failed to create user");
    }

    console.log("User created successfully", accountResult.profile);

    console.log("Verifying user creation...");
    const FETCH_PROFILE_QUERY = gql`
      query Profile($handle: String!) {
        profile(request: { handle: $handle }) {
          id
          handle
          ownedBy
          name
          bio
          picture
          coverPicture
        }
      }
    `;

    let profileData;

    for (let attempts = 0; attempts < 10; attempts++) {
      const { data } = await apolloClient.query({
        query: FETCH_PROFILE_QUERY,
        variables: { handle: params.name },
        fetchPolicy: "network-only",
      });
      if (data.profile) {
        profileData = data;
        break;
      }
      console.log(`Profile not found, retrying... (${attempts + 1}/10)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (!profileData?.profile) {
      throw new Error(`Profile with handle ${params.name} not found`);
    }

    console.log("Profile verified successfully", profileData.profile);

    console.log("Account creation successful");
    console.log("To verify the account in the Lens developer portal:");
    console.log(
      `1. Visit https://developer.lens.xyz (or the appropriate Testnet explorer).`
    );
    console.log(
      `2. Use the GraphQL explorer to query the profile by handle: ${params.name}`
    );
    console.log(`   Example query:`);
    console.log(`   query Profile {
        profile(request: { handle: "${params.name}" }) {
          id
          handle
          ownedBy
          name
          bio
        }
      }`);
    console.log(
      `3. Alternatively, check the Testnet transaction logs for the profile creation transaction.`
    );

    console.log("Logging out...");
    const logoutSuccess = await logout();
    if (!logoutSuccess) {
      throw new Error("Failed to log out");
    } else {
      console.log("Logged out successfully");
    }
  } catch (error) {
    console.error("Error during account creation:", String(error));
    throw new Error(`Account creation failed: ${String(error)}`);
  }
}

async function main() {
  try {
    const privateKey =
      "0x0f7dd816b2b0d35e30747548ed0b95fd3b72a24545a2e10e74a9052df602d11e";
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      chain: lensTestnet,
      account,
      transport: http(),
    });

    await testAccountCreation(walletClient.account.address, {
      name: "testuser" + Date.now(),
      bio: "This is a test user",
      picture: "https://example.com/picture.jpg",
      coverPicture: "https://example.com/cover.jpg",
      attributes: [
        { key: "test", value: "test" },
        { key: "test2", value: "test2" },
      ],
    });
  } catch (error) {
    console.error("Error in main function:", String(error));
  }
}

main();
