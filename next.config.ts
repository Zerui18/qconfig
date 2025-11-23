import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Required for static export
  images: {
    unoptimized: true, // Required for static export
  },
  // If deploying to https://<USERNAME>.github.io/<REPO_NAME>/
  // Set basePath to '/<REPO_NAME>'
  basePath: '/qconfig',
  assetPrefix: '/qconfig/', // Asset prefix is often needed for static exports in subpaths
  trailingSlash: true, // Recommended for GitHub Pages
};

export default nextConfig;
