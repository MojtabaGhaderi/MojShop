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
  allowedDevOrigins: ['192.168.1.60', '192.168.1.144', '10.144.75.91', '0.0.0.0', '10.209.61.91'],
};

export default nextConfig;