import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [],
  },
  trailingSlash: false,
  experimental: {
    // Help with hydration warnings
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei'],
  },
  // Suppress hydration warnings in development (common with browser extensions)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
