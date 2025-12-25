/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_OUTPUT === 'export'
const basePath = isStaticExport ? '/Mirae.ai' : ''

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? {
        output: 'export',
        basePath,
        assetPrefix: `${basePath}/`,
        // Ensure public folder assets are copied
        trailingSlash: true,
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
