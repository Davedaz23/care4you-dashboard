/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static export
  output: undefined, // Explicitly remove static export
  
  // TypeScript server configuration
  typescript: {
    ignoreBuildErrors: false, // Set to true in development if needed
  },
  
  // Plesk-specific settings
  distDir: '.next',
  compress: true,
}

module.exports = nextConfig