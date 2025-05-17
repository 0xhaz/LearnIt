import {
  EnvironmentConfig,
  PublicClient,
  mainnet,
  staging,
  testnet,
} from "@lens-protocol/client";
import { fragments } from "@/graphql/fragments";
import { storage } from "./features/storage";
import { Environments } from "@/types";

export const environments: Record<Environments, EnvironmentConfig> = {
  [Environments.Staging]: staging,
  [Environments.Mainnet]: mainnet,
  [Environments.Testnet]: testnet,
  [Environments.Production]: mainnet,
};

export const client = PublicClient.create({
  environment: environments[Environments.Testnet],
  fragments,
  apiKey: process.env.NEXT_PUBLIC_LENS_RPC_URL,
  storage: storage,
});
