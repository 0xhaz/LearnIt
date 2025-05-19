import {
  EnvironmentConfig,
  PublicClient,
  SessionClient,
  mainnet,
  staging,
  testnet,
} from "@lens-protocol/client";
import { fragments } from "../graphql/fragments";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { storage } from "./features/storage";
import { Environments } from "../types";

export const environments: Record<Environments, EnvironmentConfig> = {
  [Environments.Staging]: staging,
  [Environments.Mainnet]: mainnet,
  [Environments.Testnet]: testnet,
  [Environments.Production]: mainnet,
};

export const client = PublicClient.create({
  environment: environments[Environments.Testnet],
  apiKey: process.env.NEXT_PUBLIC_LENS_API_KEY,
  storage: storage,
  // fragments: fragments, // Removed as it is not part of ClientConfig

  origin: "http://localhost:3000",
});
