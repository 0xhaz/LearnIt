import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "hz2ju81wyx.ufs.sh" },
    ],
  },
};

export default nextConfig;
