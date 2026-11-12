import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.SMARTTRACKER_BUILD_DIR || ".next",
  allowedDevOrigins: ["192.168.18.8", "192.168.18.20", "192.168.18.24", "10.177.5.64"],
  transpilePackages: ["mapbox-gl"],
};

export default nextConfig;
