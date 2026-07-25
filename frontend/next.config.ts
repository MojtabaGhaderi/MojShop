import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/backend/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;