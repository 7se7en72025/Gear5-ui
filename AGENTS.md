<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gear5 UI working guide

Start with `HANDOFF.md` for current state, then `ARCHITECTURE.md` for the file
map, `CONTRIBUTING.md` for component requirements, and `IMPROVEMENT.md` for
how to verify a change. `CLAUDE.md` points here so agents share one guide.

- Establish the failing case or baseline before editing. Change one behaviour
  at a time and retain a regression test when failure could affect consumers.
- Keep the block requirements in `CONTRIBUTING.md`: React-only
  registry imports, caller-provided strings, logical layout, safe URLs, no
  network calls, and a fixture for every component.
- Use the committed pnpm version and `pnpm install --frozen-lockfile`. Run
  `pnpm verify` and `pnpm build` before pushing root application changes.
  Report actual output, including warnings and blocked checks; do not claim
  a test, accessibility audit, or production build passed without running it.
- Record material changes and measured results in `CHANGELOG.md`; update the
  relevant architecture section when paths or build behaviour change. Leave
  `HANDOFF.md` with current results, limitations, and the next concrete step.
- Keep generated `public/r/`, `.next/`, local secrets, and dependencies out of
  commits. Registry generation must read all inputs before replacing outputs,
  publish complete JSON files, and remove retired items only after success.
- `gear5/` is an independent application with its own instructions and CI.
  Validate it with its own declared scripts when changing it.

The current product is a curated library of original expressive blocks for
portfolios and product launches. Collection 01 has five blocks and Folio 01.
Do not restore the retired general-purpose catalog or its old positioning.

These workflow practices are adapted from
https://github.com/medhu123/amzn_code (AGENTS.md, IMPROVEMENT.md,
HANDOFF.md, and src/common.py). Its ML competition rules and scoring
thresholds do not apply to this UI library.
