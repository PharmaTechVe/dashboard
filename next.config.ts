import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloudinary.images-iherb.com',
      },
      {
        protocol: 'https',
        hostname: 'farmaciard.com',
      },
    ],
  },
};


export default nextConfig;
