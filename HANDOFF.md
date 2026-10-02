# Current handoff

Updated 2026-10-02 (Asia/Calcutta).

## Scope and state

The user requested transferring good engineering practices from
`medhu123/amzn_code` into this `gear5-ui` repository and pushing the changes.
The adapted practices are an evidence-first change loop, shared agent read
order, architecture and handoff records, and safe generated-file replacement.

Registry generation previously deleted `public/r/` before reading component
sources. It now validates and prepares all items first, replaces each JSON via
a temporary file and rename, publishes the index last, and then removes retired
items. Tests exercise both input failures and output replacement failures.
`pnpm verify` includes these tests and CI uses the same command.

## Verification

- Registry regression suite: 13/13 passed.
- Real registry generation: 222 JSON files written (221 items plus index).
- `pnpm verify`: passed (13 registry tests and 1,485 Vitest tests in 11 files;
  type checking passed; lint had 0 errors and the same 27 baseline warnings).
- `pnpm build`: passed; 430 static pages generated with Next.js 16.3.2.
- Compatibility comparison against the previous committed generator: all 222
  real registry JSON files were byte-identical under the same deployment URL.
- Missing-source failure reproduced on both generators: the old build removed
  the index; the new build preserved all 222 previous files byte for byte.
- Existing lint baseline: 0 errors, 27 warnings; these are outside this change.

## Limitations and next step

Atomic replacement applies per JSON file. A write interrupted between items can
leave mixed complete generations; rerun to finish. Concurrent builds with
different inputs should use separate output folders.

The independent `gear5/` application was not changed. Its workflow refers to
typecheck and test scripts that its current package manifest does not declare;
fix that separately with checks appropriate to that application.

Implementation and verification are complete. For future work, start from a
concrete reported component failure and follow
`IMPROVEMENT.md`. The 27 existing lint warnings remain a separate cleanup task.
