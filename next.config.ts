import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.REPO_NAME ? `/${process.env.REPO_NAME}` : "",
  output: "export",
};

export default nextConfig;
