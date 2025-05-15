import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
    "http://localhost:3000/api/graphql",
  cache: new InMemoryCache(),
});
