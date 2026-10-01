import type { NextConfig } from "next";

// Private-preview mode (koovis-hq ops B14): the API this app needs is off until
// B13, so every app route goes to the holding page. Temporary (307) redirects;
// delete `redirects` to restore the app.
const PREVIEW_ROUTES = ["/", "/chat", "/chat/:path*", "/agents", "/agents/:path*", "/login"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return PREVIEW_ROUTES.map((source) => ({ source, destination: "/preview", permanent: false }));
  },
};

export default nextConfig;
