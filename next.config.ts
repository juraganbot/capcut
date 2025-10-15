import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // Disable telemetry
  telemetry: false,
};

export default nextConfig;
