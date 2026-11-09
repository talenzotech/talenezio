import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
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
