const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' // Disable PWA in dev for faster reloads
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Enable SWC minification for faster builds
  output: process.env.CAPACITOR_BUILD ? 'export' : undefined, // Static export for Capacitor
  images: {
    domains: ['localhost'],
    unoptimized: process.env.CAPACITOR_BUILD ? true : false, // Disable image optimization for static export
  },
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'], // Optimize Ant Design imports
  },
};

module.exports = withPWA(nextConfig);