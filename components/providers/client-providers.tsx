// components/providers/client-providers.tsx

"use client";

import { PropsWithChildren, useState, useEffect } from "react";
import { ApolloProvider } from "@/components/providers/apollo-provider";
import { Web3Provider } from "@/components/providers/web3-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { ThirdwebProvider } from "thirdweb/react";

export const ClientProviders = ({ children }: PropsWithChildren) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ApolloProvider>
      <Web3Provider>
        <ThirdwebProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConfettiProvider />
            <ToastProvider />
            {children}
          </ThemeProvider>
        </ThirdwebProvider>
      </Web3Provider>
    </ApolloProvider>
  );
};
