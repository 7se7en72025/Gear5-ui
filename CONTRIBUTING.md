# Contributing to Gear5 UI

Gear5 builds expressive, reusable React blocks for portfolios and product
launches. A contribution should help someone ship a real page: selected work,
a product story, pricing, social proof, or a clear next action.

## Component requirements

- Keep runtime imports to React, React DOM, and local registry helpers.
- Make text, links, visual content, and accent colors caller-editable.
- Use safe links, semantic markup, logical spacing, keyboard controls, and
  reduced-motion fallbacks. No network requests or unsafe HTML in blocks.
- Include a manifest entry with an honest budget tier and every local dependency.
- Add a fixture in `components/demos.tsx`. It feeds the generic axe and SSR checks.
- Test meaningful state and focus changes. Native disclosures and radio inputs
  should keep their browser behaviour.
- Provide a runnable usage example and practical notes in `lib/doc-examples.ts`.
- Record the page job, distinct behaviour, responsive states, and acceptance
  bar in `components.md`; add verified discoveries to `learnings.md`.
- Templates use `registry:block` and the `page` tier. Their bundle budget counts
  all transitive component code, with React external.

## Validate a change

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm build
```

Record what changed, why, and actual results in `CHANGELOG.md`. Update architecture
and handoff records when the build or product direction changes. See
`IMPROVEMENT.md` for the evidence-first loop.

Use original code and visual concepts. Explain any external source you adapt and
respect its licence. The sample portfolio is fictional: avoid presenting its
example people, quotes, or prices as real endorsements or offers.

Report bugs with the block, input/state, browser, viewport, and reproduction.
Include keyboard or reduced-motion settings where relevant.
