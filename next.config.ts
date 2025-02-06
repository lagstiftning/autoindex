import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_LAW
    ? `/${process.env.NEXT_PUBLIC_LAW}`
    : "",
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
