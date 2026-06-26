import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.8", "192.168.18.20", "192.168.18.24", "10.177.5.64"],
  transpilePackages: ["mapbox-gl"],
};

export default nextConfig;
