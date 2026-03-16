import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // TCGdex card images are served from tcgdex hosts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.tcgdex.net",
      },
      {
        protocol: "https",
        hostname: "tcgdex.net",
      },
    ],
  },
};

export default nextConfig;
