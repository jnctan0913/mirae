/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_OUTPUT === 'export'

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? {
        output: 'export',
        basePath: '/Mirae.ai',
        assetPrefix: '/Mirae.ai/',
        // Ensure public folder assets are copied
        trailingSlash: true,
      }
    : {
        output: 'export',
      }),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
