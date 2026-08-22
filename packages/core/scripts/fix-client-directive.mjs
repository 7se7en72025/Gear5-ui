/**
 * Guarantee `"use client"` is the first directive in the CJS bundle.
 *
 * esbuild's CJS transform emits its interop helpers ahead of the source
 * directive, which buries `"use client"` mid-file where no bundler treats it as
 * a directive prologue. Next.js then pulls the module into a Server Component
 * graph and consumers hit "useState is not a function" at runtime.
 *
 * The rewrite stays on line 1, where the whole helper preamble already lives,
 * so source map line numbers are unaffected.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DIRECTIVE = '"use client";';
const CLIENT_BUNDLES = ["dist/index.cjs", "dist/index.js"];

let failed = false;

for (const relativePath of CLIENT_BUNDLES) {
  const file = path.resolve(process.cwd(), relativePath);

  if (!existsSync(file)) {
    console.error(`[gear5] expected build output missing: ${relativePath}`);
    failed = true;
    continue;
  }

  const original = await readFile(file, "utf8");

  // Drop the misplaced copy, then reinstate it at position zero.
  const withoutDirective = original.replace(DIRECTIVE, "");
  const fixed = DIRECTIVE + withoutDirective;

  if (!fixed.startsWith(DIRECTIVE)) {
    console.error(`[gear5] could not place the directive in ${relativePath}`);
    failed = true;
    continue;
  }

  if (fixed !== original) {
    await writeFile(file, fixed, "utf8");
  }
  console.log(`[gear5] "use client" verified in ${relativePath}`);
}

// The adapters entry is pure functions and must stay usable from Server
// Components. A directive here would silently drag it into the client bundle.
for (const relativePath of ["dist/adapters/ai-sdk.js", "dist/adapters/ai-sdk.cjs"]) {
  const file = path.resolve(process.cwd(), relativePath);
  if (!existsSync(file)) continue;

  if ((await readFile(file, "utf8")).includes(DIRECTIVE)) {
    console.error(
      `[gear5] ${relativePath} must not be a client module — it is meant to run on the server.`,
    );
    failed = true;
  }
}

if (failed) process.exit(1);
