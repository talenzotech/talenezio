import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  experimental: {
    // Avoid multi-second cache writes/compaction on slow Windows filesystems.
    turbopackFileSystemCacheForDev: process.platform !== "win32",
    // Keep recently visited dynamic feature routes in the client router cache so
    // switching between dashboard sections does not refetch them immediately.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    localPatterns: [
      {
        pathname: "/talenezio-certificate-blank-template-hd.png",
        search: "",
      },
      {
        pathname: "/talenezio-certificate-demo.png",
        search: "?v=1",
      },
      {
        pathname: "/talenezio-wordmark-light-mode.png",
        search: "",
      },
      {
        pathname: "/talenezio-wordmark-transparent.png",
        search: "?v=3",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
