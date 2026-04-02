import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    scrollRestoration: false,
  },
};

export default nextConfig;
