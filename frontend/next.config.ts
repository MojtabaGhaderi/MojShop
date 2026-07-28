import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: false,
  },
  // Silence the workspace root warning
  turbopack: {
    root: process.cwd(),
  },
  // Allow dev from my local network IP
  allowedDevOrigins: ['192.168.1.60'],
};

export default nextConfig;