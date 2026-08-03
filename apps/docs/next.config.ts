import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The library is consumed straight from TypeScript source in this monorepo,
  // so Next has to compile it rather than expect a prebuilt dist.
  transpilePackages: ["bharat-ui"],
};

export default nextConfig;
