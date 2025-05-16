import { PublicClient, testnet } from "@lens-protocol/react";
import { fragments } from "@/graphql/fragments";

export const client = PublicClient.create({
  environment: testnet,
  fragments,
});
