import { account, MetadataAttributeType } from "@lens-protocol/metadata";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { SessionClient, Context } from "@lens-protocol/react"; // Match PublicClient
import { storageClient } from "../../lib/storage-client";
import { WalletClient, Account } from "viem";
import { lensTestnet } from "viem/chains";

import { client } from "../../lens/client";
import { LensAppAddresses } from "../../types";

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
  // Assumes storage is window.localStorage or a custom IStorageProvider
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("lens_auth_token")
      : null;
  console.log("Token:", token);
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

// Metadata creation function
interface MetadataAttribute {
  key: string;
  value: string;
}

const createMetadata = (
  name: string,
  bio: string,
  picture: string,
  coverPicture: string,
  attributes: MetadataAttribute[]
) => {
  return account({
    name,
    bio,
    picture,
    coverPicture,
    attributes: attributes.map(attr => ({
      ...attr,
      type: MetadataAttributeType.STRING,
    })),
  });
};

async function signMessageWith(walletClient: WalletClient) {
  return async (message: string) => {
    if (!walletClient.account) {
      throw new Error("Wallet account is undefined");
    }
    return await walletClient.signMessage({
      account: walletClient.account,
      message,
    });
  };
}

export async function createUser(
  walletClient: WalletClient,
  name: string,
  bio: string,
  picture: string,
  coverPicture: string,
  attributes: MetadataAttribute[]
) {
  try {
    // Validate inputs
    if (!name) {
      throw new Error("Username is required");
    }

    // Check walletClient.account
    if (!walletClient.account) {
      throw new Error(
        "Wallet account not initialized. Please connect a wallet."
      );
    }

    // Authenticate as Onboarding User
    const authenticated = await client.login({
      onboardingUser: {
        app: LensAppAddresses.TESTNET,
        wallet: walletClient.account.address,
      },
      signMessage: await signMessageWith(walletClient),
    });

    if (authenticated.isErr()) {
      throw new Error(authenticated.error.message);
    }

    // const sessionClient: SessionClient<Context> = authenticated.value;

    // Create metadata
    const metadata = createMetadata(
      name,
      bio,
      picture,
      coverPicture,
      attributes
    );
    const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);

    if (!metadataUri) {
      throw new Error("Failed to upload metadata");
    }

    // GraphQL mutation to create account
    const CREATE_ACCOUNT_MUTATION = gql`
      mutation CreateAccount($username: String!, $metadataUri: String!) {
        createAccountWithUsername(
          request: {
            username: { localName: $username }
            metadata: $metadataUri
          }
        ) {
          ... on CreateAccountResponse {
            hash
          }
          ... on UsernameTaken {
            reason
          }
          ... on NamespaceOperationValidationFailed {
            reason
          }
          ... on TransactionWillFail {
            reason
          }
        }
      }
    `;

    const { data } = await apolloClient.mutate({
      mutation: CREATE_ACCOUNT_MUTATION,
      variables: { username: name, metadataUri },
    });

    if (data.createAccountWithUsername.__typename !== "CreateAccountResponse") {
      throw new Error(
        data.createAccountWithUsername.reason || "Account creation failed"
      );
    }

    const txHash = data.createAccountWithUsername.hash;

    // GraphQL query to fetch profile
    const FETCH_PROFILE_QUERY = gql`
      query Profile($username: String!) {
        profile(request: { handle: $username }) {
          id
          handle
          ownedBy
        }
      }
    `;

    // Retry fetching profile to handle indexing delay
    let profileData;
    for (let attempts = 0; attempts < 3; attempts++) {
      const { data } = await apolloClient.query({
        query: FETCH_PROFILE_QUERY,
        variables: { username: name },
        fetchPolicy: "network-only",
      });
      if (data.profile) {
        profileData = data;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
    }

    if (!profileData?.profile) {
      throw new Error("Failed to fetch created profile after retries");
    }

    // Re-authenticate as Account Owner
    const ownerAuthenticated = await client.login({
      accountOwner: {
        app: LensAppAddresses.TESTNET,
        owner: profileData.profile.ownedBy,
        account: profileData.profile.id,
      },
      signMessage: await signMessageWith(walletClient),
    });

    if (ownerAuthenticated.isErr()) {
      throw new Error(ownerAuthenticated.error.message);
    }

    return {
      success: true,
      message: "Account created and switched successfully",
      profile: profileData.profile,
    };
  } catch (error) {
    console.error("Error creating user:", String(error));
    throw new Error(`Failed to create user: ${String(error)}`);
  }
}

export async function updateUser(
  walletClient: WalletClient,
  profileId: string,
  name: string,
  bio: string,
  picture: string,
  coverPicture: string,
  attributes: MetadataAttribute[]
) {
  try {
    // Check walletClient.account
    if (!walletClient.account) {
      throw new Error(
        "Wallet account not initialized. Please connect a wallet."
      );
    }

    // Authenticate as Account Owner
    const authenticated = await client.login({
      accountOwner: {
        app: LensAppAddresses.TESTNET,
        owner: walletClient.account.address,
        account: profileId,
      },
      signMessage: await signMessageWith(walletClient),
    });

    if (authenticated.isErr()) {
      throw new Error(authenticated.error.message);
    }

    // const sessionClient: SessionClient<Context> = authenticated.value;

    // Create metadata
    const metadata = createMetadata(
      name,
      bio,
      picture,
      coverPicture,
      attributes
    );
    const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);

    if (!metadataUri) {
      throw new Error("Failed to upload metadata");
    }

    // GraphQL mutation to update metadata
    // Verify mutation name via https://api.testnet.lens.xyz
    const SET_PROFILE_METADATA_MUTATION = gql`
      mutation SetProfileMetadata($metadataUri: String!) {
        setProfileMetadata(request: { metadataUri: $metadataUri }) {
          ... on SetProfileMetadataResponse {
            hash
          }
          ... on SponsoredTransactionRequest {
            reason
          }
          ... on TransactionWillFail {
            reason
          }
        }
      }
    `;

    const { data } = await apolloClient.mutate({
      mutation: SET_PROFILE_METADATA_MUTATION,
      variables: { metadataUri },
    });

    if (data.setProfileMetadata.__typename === "SetProfileMetadataResponse") {
      return {
        success: true,
        message: "Metadata updated successfully",
        hash: data.setProfileMetadata.hash,
      };
    }

    if (data.setProfileMetadata.__typename === "SponsoredTransactionRequest") {
      throw new Error(
        data.setProfileMetadata.reason || "Sponsored transaction request"
      );
    }

    if (data.setProfileMetadata.__typename === "TransactionWillFail") {
      throw new Error(
        data.setProfileMetadata.reason || "Transaction will fail"
      );
    }

    throw new Error("Unknown response type from setProfileMetadata mutation");
  } catch (error) {
    console.error("Error updating user:", String(error));
    throw new Error(`Failed to update user: ${String(error)}`);
  }
}
