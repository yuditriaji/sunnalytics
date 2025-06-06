const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' // Disable PWA in dev for faster reloads
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Enable SWC minification for faster builds
  images: {
    domains: ['localhost'], // Add domains for image optimization if needed
  },
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'], // Optimize Ant Design imports
  },
};

module.exports = withPWA(nextConfig);