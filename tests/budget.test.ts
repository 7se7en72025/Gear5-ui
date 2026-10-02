// @vitest-environment node
//
// Node, not jsdom: jsdom replaces TextEncoder with an implementation whose
// output fails esbuild's `instanceof Uint8Array` check, and nothing here needs
// a DOM anyway.
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { build } from "esbuild";
import { beforeAll, describe, expect, it } from "vitest";
import manifest from "@/registry.json";

const root = process.cwd();

type Tier = "xs" | "sm" | "md" | "lg" | "page";

/**
 * Gzipped-size ceiling per declared tier, bundled and minified with React
 * external — i.e. what a user actually adds to their production bundle by
 * installing the item, including the primitives it pulls in with it.
 *
 * A tier, not a bespoke number per component: with a couple of dozen items a
 * hand-picked budget per name is precise, but at library scale it is a hundred
 * numbers nobody reviews. A tier is a claim a reviewer can sanity-check by
 * reading the component once — "this is a two-state toggle, xs is right" —
 * and it still fails loudly the moment a change makes something meaningfully
 * heavier than its declared class of component should be.
 */
const TIER_BUDGETS: Record<Tier, number> = {
  xs: 350, // static display primitives: Kbd, Divider, VisuallyHidden
  sm: 950, // a hook, a small utility, a single-purpose field or control
  md: 1950, // a component with a few states or a live subscription
  lg: 3300, // a component composing several of the above (forms, boundaries)
  page: 10000, // a complete page, including its bundled component dependencies
};

const items = manifest.items as Array<{
  name: string;
  tier?: Tier;
  dependencies?: string[];
  files: Array<{ path: string }>;
}>;

const sizes = new Map<string, number>();

async function measure(entry: string): Promise<number> {
  const result = await build({
    entryPoints: [join(root, entry)],
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2020",
    jsx: "automatic",
    // React is already in every consumer's bundle; counting it here would
    // measure React, not us.
    external: ["react", "react-dom", "react/jsx-runtime"],
    write: false,
    logLevel: "silent",
  });

  return gzipSync(result.outputFiles[0].contents).length;
}

beforeAll(async () => {
  await Promise.all(
    items.map(async (item) => {
      sizes.set(item.name, await measure(item.files[0].path));
    }),
  );

  const total = [...sizes.values()].reduce((sum, size) => sum + size, 0);
  const report = items
    .map(
      (item) =>
        `  ${item.name.padEnd(20)} ${String(sizes.get(item.name)).padStart(5)} B  (${item.tier})`,
    )
    .join("\n");
  console.log(
    `\ngzipped, bundled, React external:\n${report}\n  ${"— sum of parts".padEnd(20)} ${String(total).padStart(5)} B\n` +
      `  (informational: nobody bundles the whole library — components are taken one at a time)\n`,
  );
}, 120_000);

describe("size budgets", () => {
  it("every item declares a tier", () => {
    for (const item of items) {
      expect(item.tier, `${item.name} has no tier`).toBeDefined();
    }
  });

  it("the docs site quotes the budgets this suite actually enforces", async () => {
    // lib/registry.ts restates these so component pages can show a budget.
    // A docs page quoting a ceiling nobody enforces is worse than one quoting
    // nothing, so the two definitions are pinned together here.
    const { TIER_BUDGETS: published } = await import("@/lib/registry");
    expect(published).toEqual(TIER_BUDGETS);
  });

  it.each(items.map((item) => [item.name, item.tier] as const))(
    "%s stays within its %s budget",
    (name, tier) => {
      const budget = TIER_BUDGETS[tier as Tier];
      const size = sizes.get(name)!;

      expect(
        size,
        `${name} is ${size} B gzipped, over its "${tier}" tier budget of ${budget} B`,
      ).toBeLessThanOrEqual(budget);
    },
  );
});

/**
 * Remove block and line comments so prose is never mistaken for code.
 *
 * Not a parser, and does not need to be: it runs over this repo's own source,
 * where the failure mode it guards against is a doc comment quoting an import
 * that does not exist, never a string literal containing `//`.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("dependencies", () => {
  it("ships zero runtime dependencies", () => {
    // The reason a size budget is possible at all: a single transitive
    // dependency can quietly cost more than everything here put together.
    for (const item of items) {
      expect(
        item.dependencies ?? [],
        `${item.name} declares runtime dependencies`,
      ).toEqual([]);
    }
  });

  it("imports nothing but react (and its own react-dom) across the whole registry", () => {
    // react-dom ships in every React DOM app react itself does — it is not an
    // additional install, only the createPortal/render half of the same
    // runtime — so it does not compromise the zero-dependency claim.
    const allowed = new Set(["react", "react-dom", "react-dom/server"]);

    for (const item of items) {
      for (const file of item.files) {
        // Comments are stripped first: prose can legitimately contain the
        // words `from "…"`, and matching that as an import made a doc comment
        // explaining a component look like a forbidden dependency.
        const source = stripComments(
          readFileSync(join(root, file.path), "utf8"),
        );
        const specifiers = [...source.matchAll(/from\s+"([^"]+)"/g)].map(
          (m) => m[1],
        );

        for (const specifier of specifiers) {
          if (specifier.startsWith(".")) continue;
          expect(
            allowed.has(specifier),
            `${file.path} imports "${specifier}"`,
          ).toBe(true);
        }
      }
    }
  });
});
