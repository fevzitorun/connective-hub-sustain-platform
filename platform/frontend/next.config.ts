import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/urunler', destination: '/products', permanent: true },
      { source: '/hakkimizda', destination: '/about', permanent: true },
    ]
  }
};

export default nextConfig;
