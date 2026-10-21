import type { NextConfig } from "next";

// The website forwards /api/v1 requests to the API. The browser then sees one site, so the admin session cookie
// is first-party. Set NEXT_PUBLIC_API_BASE_URL=/api/v1 in production. Local development keeps its absolute URL.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "https://robocare-api.onrender.com";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${API_PROXY_TARGET}/api/v1/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
