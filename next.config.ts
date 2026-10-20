import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_LAW
    ? `/${process.env.NEXT_PUBLIC_LAW}`
    : "",
  output: "export",
  trailingSlash: true,
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
