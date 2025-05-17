import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  gql,
  from,
} from "@apollo/client";

const ENDPOINT = "https://api.lens/xyz/graphql";

const httpLink = createHttpLink({
  uri: ENDPOINT,
});

const authLink = new ApolloLink((operation, forward) => {
  const lensAuth =
    typeof window !== "undefined" ? localStorage.getItem("lens_auth") : null;

  let token = null;

  if (lensAuth) {
    try {
      const { accessToken } = JSON.parse(lensAuth);
      token = accessToken;
    } catch (error) {
      console.error("Error parsing lens_auth token:", error);
    }
  }

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { "x-access-token": token } : {}),
    },
  }));
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
    },
  },
});

export const GET_POSTS_QUERY = gql`
  query GetPosts($request: PostsRequest!) {
    posts(request: $request) {
      items {
        id
        author {
          handle {
            fullHandle
          }
          id
        }
        metadata {
          ... on TextOnlyMetadata {
            content
          }
        }
      }
      pageInfo {
        prev
        next
      }
    }
  }
`;
