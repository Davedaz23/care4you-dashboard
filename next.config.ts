/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  reactStrictMode: true,
  
  // Only use output: 'export' if you're doing static HTML export
  // output: 'export', // Consider removing this for full functionality
  
  images: {
    // For static export (if you must keep it)
    unoptimized: true,
    
    // Add Firebase Storage domain
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com' // For Firebase Auth profile images if used
    ],
    
    // If you need to support other image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebasestorage.googleapis.com',
      },
    ],
    
    // Minimum Cache Time to Live (in seconds)
    minimumCacheTTL: 60,
  },
  
  // Enable CORS headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
        ],
      },
    ];
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Plesk settings
  distDir: process.env.NODE_ENV === 'production' ? 'out' : '.next',
  compress: true,
}

module.exports = nextConfig