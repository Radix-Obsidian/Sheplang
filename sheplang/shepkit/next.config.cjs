/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@sheplang/language', '@adapters/sheplang-to-boba'],
  // Enable standalone output for Docker
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@sheplang/language', '@adapters/sheplang-to-boba']
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
      '.cjs': ['.cjs', '.cts']
    };
    return config;
  }
};

module.exports = nextConfig;
