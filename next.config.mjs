/** @type {import('next').NextConfig} */
import path from 'path'

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
<<<<<<< HEAD
      '@': path.resolve(process.cwd()),
=======
      '@': path.resolve(__dirname),
>>>>>>> c7c7669ca3c0c46b7c476c6b56edfa488f5ee760
    }
    return config
  },
}

export default nextConfig
