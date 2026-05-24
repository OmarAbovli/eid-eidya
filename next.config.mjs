/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ivorytech.online',
      },
    ],
  },
}

export default nextConfig
