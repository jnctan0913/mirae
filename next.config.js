/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/Mirae.ai',
  assetPrefix: '/Mirae.ai',
}

module.exports = nextConfig

