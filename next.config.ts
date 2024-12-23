// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        // If your images are stored under a specific path, specify it. Otherwise, use wildcard.
        pathname: "/v0/b/**",
      },
    ],
  },
};

export default nextConfig;
