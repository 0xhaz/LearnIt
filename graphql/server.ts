import { ApolloServer } from "@apollo/server";
import { readFileSync } from "fs";
import path from "path";
import { resolvers } from "./resolvers";
import { createContext } from "./context";

const typeDefs = readFileSync(
  path.join(process.cwd(), "graphql/schema.graphql"),
  "utf-8"
);

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});
