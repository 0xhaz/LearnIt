"use client";

import { LensProvider, PublicClient, testnet } from "@lens-protocol/react";
import { fragments } from "@/graphql/fragments";

const client = PublicClient.create({
  environment: testnet,
});

export const LensWrapper = ({ children }: { children: React.ReactNode }) => {
  return <LensProvider client={client}>{children}</LensProvider>;
};
