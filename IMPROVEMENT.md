# Making and accepting improvements

Adapted from the evidence-first loop in
[amzn_code](https://github.com/medhu123/amzn_code/blob/main/IMPROVEMENT.md).
Use this for component behaviour and build reliability changes.

1. Describe a concrete failure, with a component, locale, browser state, input,
   or build condition that reproduces it. Run the existing relevant checks.
2. State the hypothesis and acceptance condition before implementation. For
   example: removing one source file must fail generation without deleting
   any previously published registry file.
3. Make one focused change. For a consumer-facing regression, keep a test
   that exercises the failure and checks the observable result. Reuse the
   shared fixture suite for generic component requirements.
4. Compare under the same inputs and configuration. For size claims, use the
   same React externals, gzip settings, and declared budget. For locale or
   keyboard changes, check affected states and an unaffected control case.
5. Accept when the reproduction passes and the required checks pass without
   new failures. Run `pnpm verify` and `pnpm build`; record warnings and manual
   checks still needed. Record rejected approaches with their evidence when
   they would otherwise be tried again.
6. Update `CHANGELOG.md` with what changed, why, and actual verification;
   update `ARCHITECTURE.md` if the pipeline changed, and `HANDOFF.md` with the
   current state and next step.

Use facts in the record: a passing axe fixture is an automated check, not a
screen-reader certification; a component gzip ceiling is not total page size.
Do not replace a measured failure with an unsupported performance claim.
