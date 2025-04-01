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
      {
        protocol: 'https',
        hostname: 'pharmatech.sirv.com',

      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',

      }
     
    ],
  },
};

export default nextConfig;
