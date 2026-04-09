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
};

export default nextConfig;
