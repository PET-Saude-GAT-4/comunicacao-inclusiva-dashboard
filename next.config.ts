import type { NextConfig } from "next";

// The API builds file URLs from its own base URL, which matches API_URL. When
// API_URL points at a LAN IP (e.g. to reach the API from a phone), next/image
// must allow that host too, not only localhost.
const apiUrl = new URL(process.env.API_URL || "http://localhost:8080");

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: apiUrl.protocol === "https:" ? "https" : "http",
        hostname: apiUrl.hostname,
      },
    ],
  },
};

export default nextConfig;
