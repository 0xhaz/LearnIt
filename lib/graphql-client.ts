import { GraphQLClient } from "graphql-request";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
  "https://localhost:3000/api/graphql";

export function getClient(token?: string) {
  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}
