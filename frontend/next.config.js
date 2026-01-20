/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_VERIFIER_ADDRESS: process.env.NEXT_PUBLIC_VERIFIER_ADDRESS,
    NEXT_PUBLIC_REPUTATION_NFT_ADDRESS: process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
  },
  
  // Output configuration
  output: 'standalone',
};

module.exports = nextConfig;
