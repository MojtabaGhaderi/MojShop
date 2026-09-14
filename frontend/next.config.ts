import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
  // Silence the workspace root warning
  turbopack: {
    root: process.cwd(),
  },
  // Allow dev from my local network IP
  allowedDevOrigins: ['192.168.1.60', '192.168.1.144', '10.144.75.91', '0.0.0.0', '10.209.61.91'],
};

export default nextConfig;