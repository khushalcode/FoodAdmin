import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Pin the Turbopack workspace root to this project directory so Next.js
  // doesn't auto-detect a parent (e.g. /home/z/my-project) and fail to find
  // `next/package.json` when the project lives inside a deeper workspace.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;