import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: [
    '@goldensheepai/sheplang-compiler',
    '@goldensheepai/sheplang-language',
  ],
  turbopack: {
    root: process.cwd(),
  },
  // Configure webpack to handle .mjs files from Langium
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
    };
    return config;
  },
};

export default nextConfig;
