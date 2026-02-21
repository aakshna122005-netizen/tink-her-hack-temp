import type { NextConfig } from "next";

// Set this to your GitHub repo name, e.g. 'pitchbridge' for github.com/username/pitchbridge
// Leave as '' for custom domain or Vercel deployment
const REPO_NAME = process.env.GITHUB_REPOSITORY_NAME || '';

const nextConfig: NextConfig = {
  output: 'export',                    // Static HTML export for GitHub Pages
  basePath: REPO_NAME ? `/${REPO_NAME}` : '',
  trailingSlash: true,                 // Ensures /page/ instead of /page for static hosting
  images: {
    unoptimized: true,                 // Next.js image optimization is server-side only
  },
};

export default nextConfig;
