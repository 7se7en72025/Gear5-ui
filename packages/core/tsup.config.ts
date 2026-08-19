import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "adapters/ai-sdk": "src/adapters/ai-sdk.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],

  // The `"use client"` directive lives at the top of `src/index.ts` rather than
  // in a `banner` here, for two reasons:
  //
  // 1. A banner is global, and it would wrongly mark `adapters/ai-sdk` as a
  //    client module. That entry is pure functions with no React, so it must
  //    stay usable inside Server Components.
  // 2. tsup's rollup tree-shaking pass strips module-level directives, banner
  //    included, which silently breaks App Router consumers. Disabling it below
  //    keeps the directive intact.
  //
  // Nothing is lost by turning it off: `"sideEffects": false` in package.json
  // lets the consumer's own bundler shake unused exports, which is where the
  // real savings come from anyway.
  treeshake: false,
});
