# Contributing to Gear5 UI

Thanks for taking the time to contribute. This guide covers how to get the
project running and what we look for in a pull request.

## Getting started

Requires Node 20+ and pnpm 9+.

```bash
git clone https://github.com/7se7en72025/NYXA-UI.git
cd NYXA-UI
pnpm install
pnpm dev
```

`pnpm dev` starts the docs site at `http://localhost:3000` and rebuilds
`gear5-ui` on change.

## Repository layout

| Path                 | What lives there                                              |
| -------------------- | ------------------------------------------------------------- |
| `packages/core`      | Headless, unstyled primitives. Published to npm.               |
| `packages/registry`  | Styled components distributed via the `shadcn` CLI.            |
| `apps/docs`          | Next.js documentation site and live playground.                |

## Before you open a pull request

Run the full check locally:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## What we look for

Gear5 UI has a narrow, deliberate scope: **UI for agent applications**. We are
unlikely to merge general-purpose components (buttons, dropdowns, modals) — use
shadcn/ui or Radix for those.

Every component must meet these bars before it ships:

- **Accessible.** Keyboard navigable, correct ARIA roles, managed focus.
  Streaming content announces through a live region. This is not optional; it is
  the main reason the library exists.
- **Headless first.** The primitive goes in `packages/core` with no styling and
  `asChild` support. The styled version in `packages/registry` composes it.
- **Streaming aware.** Agent UIs render partial state. Components must handle
  incomplete input, missing output, and mid-flight status changes without
  layout thrash.
- **Server-component safe.** Mark `"use client"` only where genuinely needed,
  and keep the module graph tree-shakeable.
- **Adapter agnostic.** Core types must not depend on any specific AI SDK.
  Framework bindings belong in adapters.

## Adding a component

1. Open an issue describing the agent-app problem it solves before writing code.
2. Add the headless primitive under `packages/core/src/<component>/`.
3. Add the styled version under `packages/registry/`.
4. Add a docs page with a live example and a props table.
5. Add tests, including keyboard interaction and ARIA assertions.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org):
`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## Good first issues

Issues tagged [`good first issue`](https://github.com/7se7en72025/NYXA-UI/labels/good%20first%20issue)
are scoped so you can land them without deep context. Comment on one to claim it.

## Code of Conduct

Participation is governed by the [Code of Conduct](./CODE_OF_CONDUCT.md).
