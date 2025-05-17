import { SessionClient, Context } from "@lens-protocol/react";
import {
  currentSession,
  fetchAuthenticatedSessions,
  lastLoggedInAccount,
} from "@lens-protocol/client/actions";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { evmAddress } from "@lens-protocol/client";

// Environment variable for Lens Testnet GraphQL endpoint
const ENDPOINT = process.env.NEXT_PUBLIC_LENS_TESTNET_GRAPHQL_URL;

if (!ENDPOINT) {
  throw new Error("NEXT_PUBLIC_LENS_TESTNET_GRAPHQL_URL is not defined");
}

// Apollo Client setup
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

import { client } from "@/lens/client";

export async function resumeSession(): Promise<SessionClient<Context> | null> {
  try {
    const resumed = await client.resumeSession();
    if (resumed.isErr()) {
      throw new Error(`Failed to resume session: ${resumed.error.message}`);
    }
    return resumed.value;
  } catch (error) {
    console.error("Error resuming session:", String(error));
    return null;
  }
}

export async function getCurrentSession(
  sessionClient: SessionClient<Context>
): Promise<any | null> {
  try {
    if (!sessionClient) {
      throw new Error("Session client is required");
    }

    try {
      const result = await currentSession(sessionClient);
      if (result.isErr()) {
        throw new Error(
          `Failed to get current session: ${result.error.message}`
        );
      }
      return result.value;
    } catch (sdkError) {
      console.warn(
        "SDK currentSession failed, falling back to GraphQL:",
        sdkError
      );

      // GraphQL fallback
      const CURRENT_SESSION_QUERY = gql`
        query CurrentSession {
          currentSession {
            authenticationId
            role
            app
            signedBy
          }
        }
      `;

      const { data } = await apolloClient.query({
        query: CURRENT_SESSION_QUERY,
        fetchPolicy: "network-only",
      });

      if (!data.currentSession) {
        throw new Error("No current session found");
      }

      return data.currentSession;
    }
  } catch (error) {
    console.error("Error getting current session:", String(error));
    return null;
  }
}

export async function getAuthenticatedSessions(
  sessionClient: SessionClient<Context>
): Promise<any[] | null> {
  try {
    if (!sessionClient) {
      throw new Error("Session client is required");
    }

    try {
      const result = await fetchAuthenticatedSessions(sessionClient);
      if (result.isErr()) {
        throw new Error(
          `Failed to fetch authenticated sessions: ${result.error.message}`
        );
      }
      return [...result.value.items];
    } catch (sdkError) {
      console.warn(
        "SDK fetchAuthenticatedSessions failed, falling back to GraphQL:",
        sdkError
      );

      // GraphQL fallback
      const AUTHENTICATED_SESSIONS_QUERY = gql`
        query AuthenticatedSessions {
          authenticatedSessions {
            items {
              authenticationId
              role
              app
              signedBy
            }
          }
        }
      `;

      const { data } = await apolloClient.query({
        query: AUTHENTICATED_SESSIONS_QUERY,
        fetchPolicy: "network-only",
      });

      if (!data.authenticatedSessions?.items) {
        throw new Error("No authenticated sessions found");
      }

      return data.authenticatedSessions.items;
    }
  } catch (error) {
    console.error("Error fetching authenticated sessions:", String(error));
    return null;
  }
}

export async function getLastLoggedInAccount(
  address: string
): Promise<any | null> {
  try {
    if (!address) {
      throw new Error("Wallet address is required");
    }

    try {
      const result = await lastLoggedInAccount(client, {
        address: evmAddress(address),
      });
      if (result.isErr()) {
        throw new Error(
          `Failed to get last logged-in account: ${result.error.message}`
        );
      }
      return result.value;
    } catch (sdkError) {
      console.warn(
        "SDK lastLoggedInAccount failed, falling back to GraphQL:",
        sdkError
      );

      // GraphQL fallback
      const LAST_LOGGED_IN_ACCOUNT_QUERY = gql`
        query LastLoggedInAccount($address: String!) {
          lastLoggedInAccount(address: $address) {
            id
            handle
            ownedBy
          }
        }
      `;

      const { data } = await apolloClient.query({
        query: LAST_LOGGED_IN_ACCOUNT_QUERY,
        variables: { address },
        fetchPolicy: "network-only",
      });

      if (!data.lastLoggedInAccount) {
        throw new Error("No last logged-in account found");
      }

      return data.lastLoggedInAccount;
    }
  } catch (error) {
    console.error(
      `Error getting last logged-in account for address ${address}:`,
      String(error)
    );
    return null;
  }
}

export async function logout(authenticationId?: string): Promise<boolean> {
  try {
    // Prefer SDK logout
    try {
      // Clear the authentication token from local storage
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("lens_auth_token");
      }
      return true;
    } catch (sdkError) {
      console.warn("SDK logout failed, falling back to GraphQL:", sdkError);

      // GraphQL fallback
      const REVOKE_AUTHENTICATION_MUTATION = gql`
        mutation RevokeAuthentication($request: RevokeAuthenticationRequest!) {
          revokeAuthentication(request: $request)
        }
      `;

      const { data } = await apolloClient.mutate({
        mutation: REVOKE_AUTHENTICATION_MUTATION,
        variables: {
          request: {
            authenticationId: authenticationId || null, // Optional authenticationId
          },
        },
      });

      // Assume success if mutation executes without errors
      // Verify schema for actual response
      return !!data?.revokeAuthentication;
    }
  } catch (error) {
    console.error("Error during logout:", String(error));
    return false;
  }
}
