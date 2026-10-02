# Gear5 UI architecture

The root application documents and distributes the components in
`registry/gear5/`. `gear5/` is an independent earlier application with a
separate package manifest and workflow.

| Stage | Source | Output or responsibility |
| --- | --- | --- |
| Component source | `registry/gear5/ui/`, `registry/gear5/lib/` | React components and shared hooks/utilities, with relative local imports |
| Registry manifest | `registry.json` | Item names, files, dependency edges, categories, and size tiers |
| Distribution build | `scripts/build-registry.mjs` | Consumer aliases and complete install JSON files in ignored `public/r/` |
| Documentation data | `lib/registry.ts`, `lib/catalog.ts`, `lib/source.ts` | Catalog, dependency navigation, and source display |
| Verified examples | `components/demos.tsx` | Shared fixtures for documentation, accessibility, SSR, and budgets |
| Site | `app/`, `components/site/`, `components/demo/` | Next.js routes, search, previews, and interactive demonstrations |
| Verification | `tests/`, `.github/workflows/ci.yml` | Types, lint, registry regressions, component checks, and production build |

## Registry generation

`pnpm registry:build` runs the generator. `next.config.ts` also invokes it
when Next.js loads its configuration, covering hosts that invoke Next directly.
The generator resolves URLs from `NEXT_PUBLIC_SITE_URL`, then
`VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, then `localhost:3000`.
Keep this precedence aligned with `lib/site.ts`.

The generator validates item names, supported types, source paths, unique file
basenames, and dependency existence. It reads and rewrites every source file in
memory before changing published output. Missing inputs and invalid manifests
therefore preserve the previous registry. Relative `from` imports using either
quote style become consumer aliases; external imports are preserved.

Each JSON is written to a unique temporary sibling and renamed into place. The
index is published after all items, then retired JSON files are removed. A failed
write cleans its temporary file. This prevents truncated JSON; it is **not a
directory transaction**. A process interrupted between renames can leave a mix
of complete old and new items. Rerun the build to converge. Do not run concurrent
builds with different manifests or deployment URLs into the same output folder.

## Verification and reproducibility

Use the Node version in `.nvmrc` and pnpm version in `package.json`. Install
with `pnpm install --frozen-lockfile`; dependencies resolve from `pnpm-lock.yaml`.
`pnpm verify` runs type checking, lint, the native Node registry tests, then
Vitest. `pnpm build` generates the registry and builds the production site.
CI runs both commands with a read-only repository token and a 20-minute limit.

`tests/registry-build.test.mjs` uses temporary repositories to exercise failed
inputs, failed file replacement, deterministic output, import rewriting, URL
precedence, and retired-item cleanup. Component verification is described in
README.md; automated checks do not replace manual screen-reader testing.
