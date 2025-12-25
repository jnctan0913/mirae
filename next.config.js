/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/Mirae.ai',
  assetPrefix: '/Mirae.ai/',
  images: {
    unoptimized: true,
  },
  // Ensure public folder assets are copied
  trailingSlash: true,
}

module.exports = nextConfig
