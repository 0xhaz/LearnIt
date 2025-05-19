import { Platform, app } from "@lens-protocol/metadata";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { SessionClient, Context } from "@lens-protocol/react";
import { storageClient } from "@/lib/storage-client";
import { WalletClient } from "viem";
import { lensTestnet } from "viem/chains";
import { signMessageWith } from "@lens-protocol/client/viem";
import { client } from "../../lens/client";
import { LensAppAddresses } from "@/types";

// Environment variable for Lens Testnet GraphQL endpoint
const ENDPOINT = "https://api.testnet.lens.xyz/graphql";

if (!ENDPOINT) {
  throw new Error("NEXT_PUBLIC_LENS_TESTNET_GRAPHQL_URL is not defined");
}

// Apollo Client setup
const httpLink = new HttpLink({
  uri: ENDPOINT,
});

const authLink = setContext(async (_, { headers }) => {
  // Use the same storage as PublicClient (configured in "@/lens/client")
  // Adjust key based on your storage implementation
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

interface CreateAppParams {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  developer: string;
  url: string;
  termsOfService: string;
  privacyPolicy: string;
  platforms?: Platform[];
}

export async function createAndDeployApp(
  walletClient: WalletClient,
  params: CreateAppParams
) {
  try {
    // Validate inputs
    if (!params.name) {
      throw new Error("App name is required");
    }

    // Check walletClient.account
    if (!walletClient.account) {
      throw new Error(
        "Wallet account not initialized. Please connect a wallet."
      );
    }

    // Authenticate as Builder
    const authenticated = await client.login({
      builder: {
        address: walletClient.account.address,
      },
      signMessage: signMessageWith(walletClient),
    });

    if (authenticated.isErr()) {
      throw new Error(authenticated.error.message);
    }

    const sessionClient: SessionClient<Context> = authenticated.value;

    // Create metadata
    const metadata = app({
      name: params.name,
      tagline: params.tagline,
      description: params.description,
      logo: params.logo,
      developer: params.developer,
      url: params.url,
      termsOfService: params.termsOfService,
      privacyPolicy: params.privacyPolicy,
      platforms: params.platforms || (["web", "ios", "android"] as Platform[]),
    });

    // Upload metadata
    const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);
    if (!metadataUri) {
      throw new Error("Failed to upload app metadata");
    }

    // GraphQL mutation to create app
    // Verify schema at https://api.testnet.lens.xyz
    const CREATE_APP_MUTATION = gql`
      mutation CreateApp($metadataUri: String!) {
        createApp(
          request: {
            metadataUri: $metadataUri
            defaultFeed: { globalFeed: true }
            graph: { globalGraph: true }
            namespace: { globalNamespace: true }
          }
        ) {
          ... on CreateAppResponse {
            hash
          }
          ... on TransactionWillFail {
            reason
          }
        }
      }
    `;

    const { data } = await apolloClient.mutate({
      mutation: CREATE_APP_MUTATION,
      variables: { metadataUri },
    });

    if (data.createApp.__typename !== "CreateAppResponse") {
      throw new Error(data.createApp.reason || "App creation failed");
    }

    const txHash = data.createApp.hash;

    // GraphQL query to fetch app
    const FETCH_APP_QUERY = gql`
      query App($txHash: String!) {
        app(request: { txHash: $txHash }) {
          id
          name
          address
        }
      }
    `;

    // Poll for app indexing
    let appData;
    for (let attempts = 0; attempts < 5; attempts++) {
      const { data } = await apolloClient.query({
        query: FETCH_APP_QUERY,
        variables: { txHash },
        fetchPolicy: "network-only",
      });
      if (data.app) {
        appData = data;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    }

    if (!appData?.app) {
      throw new Error("Failed to fetch created app after retries");
    }

    return {
      success: true,
      message: "App created and fetched successfully",
      app: appData.app,
    };
  } catch (error) {
    console.error("Error creating app:", String(error));
    throw new Error(`Failed to create app: ${String(error)}`);
  }
}
