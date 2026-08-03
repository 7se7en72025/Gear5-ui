# Contributing

Thanks for helping out. The bar for a useful contribution here is low — the handle
registry alone will never be complete without people who spot gaps.

## The most useful contribution

**Adding or correcting a UPI handle.** NPCI doesn't publish a machine-readable list of
handles, so [`packages/ui/src/lib/upi-handles.ts`](packages/ui/src/lib/upi-handles.ts)
is compiled by hand. If you know a handle we're missing, or one that's wrong:

1. Add or fix the entry in `UPI_HANDLES`.
2. In the PR description, link a public source — the PSP's own docs, an app screenshot,
   a bank's UPI page. "I have this VPA" is a fine source too.
3. One handle per PR keeps review fast.

## Development

```bash
pnpm install
pnpm dev              # docs site
pnpm build            # registry + package + docs
pnpm lint
pnpm typecheck
```

Layout:

```
packages/ui/src/lib/            validation logic  → ships to consumers as lib/*
packages/ui/src/components/ui/  components        → ships as components/ui/*
apps/docs/                      the docs site, not shipped
registry.json                   registry manifest → built into apps/docs/public/r
```

Run `pnpm registry:build` after touching anything under `packages/ui/src`, and commit
the regenerated `apps/docs/public/r/*.json`. CI fails if they've drifted.

## Two rules that are easy to break

**1. Components must use relative imports, not `@/` aliases.**

The shadcn CLI does *not* rewrite import paths on install, and a `@/` alias would also
collide with the docs app's own `@/`. The directory structure under `packages/ui/src`
mirrors what a consumer ends up with, so `components/ui/x.tsx` importing `../../lib/y`
resolves correctly in all three places: this repo, the docs app, and the consumer.

**2. Don't import `cn` from a shared `lib/utils`.**

Shipping our own `lib/utils.ts` through the registry would overwrite the consumer's.
Define `cn` locally in the component file instead and declare `clsx` / `tailwind-merge`
in the registry item's `dependencies`.

## Adding a component

1. Create it under `packages/ui/src/components/ui/`.
2. Export it from `packages/ui/src/index.ts`.
3. Add an entry to `registry.json` with every file it needs, including libs, each with
   an explicit `target`.
4. Add a section to the docs site with a live playground — an example nobody can
   interact with isn't documentation.
5. `pnpm registry:build`, then verify a *real* install into a scratch project:
   `npx shadcn@latest add http://localhost:3000/r/your-component.json`. This step
   catches path bugs that never show up in the docs app.

## Principles

- **Structural validation only.** Nothing here should imply an identifier is real.
  Verification is a server-side, API-backed concern, and the docs must keep saying so.
- **Unknown is not invalid.** Never block a submission because our dataset is stale.
  Warn, don't reject.
- **Errors should teach.** Every failure returns a specific message. "Invalid input" is
  not acceptable.
- **Accessible by default.** Correct roles, labels, keyboard paths. If you add a listbox
  or dialog, follow the WAI-ARIA APG pattern for it. Where a lint rule conflicts with the
  APG pattern, suppress it *with a comment explaining why* rather than "fixing" it — the
  combobox options in `upi-input.tsx` are a worked example.

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
