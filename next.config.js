/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.50.46'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
