import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "newsroom.serverizz.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/wordpress",
        destination: "/hosting/wordpress",
        permanent: true,
      },
      {
        source: "/hosting/reseller",
        destination: "/hosting",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
