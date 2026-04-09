import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/england',
        destination: '/great-britain',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ]
  },
};

export default nextConfig;
