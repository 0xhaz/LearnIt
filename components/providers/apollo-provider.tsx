"use client";

import { ApolloProvider as Provider } from "@apollo/client";
import { PropsWithChildren } from "react";
import { client } from "@/lib/apollo-client";

export const ApolloProvider = ({ children }: PropsWithChildren) => {
  return <Provider client={client}>{children}</Provider>;
};
