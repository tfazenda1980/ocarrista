import type { NextConfig } from "next";

const GESCO_APP_URL = "https://gesco-beta.vercel.app";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/images/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/gesco",
        destination: GESCO_APP_URL,
        permanent: false,
      },
      {
        source: "/gesco/:path*",
        destination: `${GESCO_APP_URL}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
