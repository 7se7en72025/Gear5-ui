import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The core package is consumed straight from source in the workspace, so it
  // has to go through this app's compiler rather than being treated as a
  // prebuilt dependency.
  transpilePackages: ["handoff-ui"],

  // Without this, Next walks up and finds an unrelated lockfile in the home
  // directory, then traces files against the wrong root.
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
};

export default nextConfig;
