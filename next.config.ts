// next.config.js
const nextConfig = {
  output: 'export',
   distDir: 'out', // Explicitly set output directory
  images: {
    domains: ['thumbs.dreamstime.com'],
    unoptimized: true,
  },
  // Add these to fix dynamic routes
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  skipTrailingSlashRedirect: true
};