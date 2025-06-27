import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Core static export configuration
  output: 'export',
  distDir: 'out',
   basePath: '/care4you', // Add this line
   assetPrefix: './', // Makes all asset paths relative
  trailingSlash: true,
  
  // App Directory configuration (moved out of experimental)
  appDir: true, // Only include if using App Router
  
  // Image handling
  images: {
    unoptimized: true,
    domains: [], // Add your WordPress domain if loading images from there
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    return config
  },

  // Environment variables
  env: {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
  },

  // TypeScript settings
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // Remaining experimental features
  experimental: {
    typedRoutes: true, // Better TypeScript support for routes
    
    // Other valid experimental features could go here
    // serverActions: true, // Example of another experimental feature
  }
}

export default nextConfig