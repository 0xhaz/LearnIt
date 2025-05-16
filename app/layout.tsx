import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { Web3Provider } from "@/components/providers/web3-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { ThirdwebProvider } from "thirdweb/react";
import { LensWrapper } from "@/components/providers/lens-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnIt",
  description: "LearnIt is a platform for learning and sharing knowledge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <ThirdwebProvider>
            <LensWrapper>
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
            </LensWrapper>
          </ThirdwebProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
