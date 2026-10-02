# Current handoff

Updated 2026-10-02 (Asia/Calcutta).

## Current direction

The user asked to rebuild Gear5 in a Vengeance UI style and replace the previous
general-purpose library. The root application now focuses on original animated
React blocks for portfolios and product launches.

Collection 01: Orbit Hero, Project Showcase, Feature Switcher, Pricing Switch,
Testimonial Deck. Folio 01 composes all five into a complete fictional designer
portfolio. The catalog, homepage, component docs, installation guide, metadata,
and machine-readable index now match that direction.

Old root component sources and unused demonstrations were removed. The
independent historical `gear5/` app is outside this collection.

## Verification

- `pnpm verify` passed: type checking, lint with zero errors/warnings,
  14 native registry regressions and 81 Vitest tests across eight files.
- `pnpm build` passed and generated 22 static outputs and eight registry files.
- Every block/template fixture passed axe and server rendering. Distributed
  template source bundled successfully in a fresh consumer file tree.
- Blocks are 1,226–1,660 B gzip. Template including dependencies is 6,005 B
  with React external, within its 10,000 B budget.
- Desktop and 390/320 px browser checks passed without horizontal page overflow.
  Checked keyboard tabs, native disclosure, annual billing totals, testimonials,
  customized code copying/reset, and portfolio section links.
- The optimized production homepage rendered with no captured browser errors.
- Vite still emits its CJS Node API deprecation notice. Reduced-motion styles
  are covered by source checks; OS preference emulation and manual screen-reader
  testing were not performed.

## Implementation notes

- Registry supports registry:block templates and a page budget (10 KB gzip,
  including block dependencies, React external).
- Source copies come from generated registry JSON with installer-ready aliases.
- Customization copies the chosen headline and accent, including escaped input.
- Project disclosures and billing controls use native browser behaviour.
- Feature tabs use roving keyboard focus and computed writing direction.
- Testimonial navigation wraps manually and retains focus.
- Replace every fictional sample before using the portfolio as a real site.
- Registry writes remain atomic per file; concurrent different builds need
  separate output folders.

## Next step

After hosting deploys the pushed commit, check public registry URLs and run a
real shadcn CLI installation against the deployed site. The automated consumer
test covers generated files and bundling, not the CLI's network/install workflow.
Future additions should be original blocks that complete a real page, with a
live example and an honest bundle budget.
