/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static export
  output: 'export', // This enables static HTML export
  
  // Optional: Add basePath if your site is not deployed at root
  // basePath: '/your-base-path',
  
  // Optional: Add assetPrefix if assets are served from a CDN
  // assetPrefix: '/your-asset-prefix',
  
  // TypeScript server configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable image optimization as it's not supported with static export
  images: {
    unoptimized: true,
  },
  
  // Plesk-specific settings
  distDir: 'out', // Standard directory for static exports
  compress: true,
}

module.exports = nextConfig