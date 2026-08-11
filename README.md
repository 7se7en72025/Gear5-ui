<div align="center">

# Handoff UI

**The UI layer for agent apps.**

Approvals, tool calls, traces, and diffs — accessible, streaming-aware, and unstyled by default.

[![CI](https://github.com/handoff-ui/handoff-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/handoff-ui/handoff-ui/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/handoff-ui.svg)](https://www.npmjs.com/package/handoff-ui)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

</div>

---

## Why this exists

Agent apps are not chat apps. Chat is a solved problem — there are good libraries
for message bubbles and markdown streaming, and you should use them.

What nobody ships is everything *around* the loop:

- The agent wants to delete twelve files. **How does the user approve that?**
- A tool has been running for nine seconds. **What is on screen right now?**
- The model rewrote a file mid-stream. **How do you show a diff that is still arriving?**
- A screen reader user is on this page. **Does any of the above reach them?**

Every team building an agent product rebuilds these from scratch, and almost
always without accessibility. Handoff UI is that missing layer.

## Design principles

**Accessible or it does not ship.** Keyboard navigable, correct ARIA roles,
managed focus, and live regions that announce streaming content without flooding
the user. This is the main reason the library exists, not a checkbox at the end.

**Headless first.** `handoff-ui` renders zero styles — only behaviour,
state, and ARIA wiring. Every part accepts `asChild`, so you can render into your
own components without losing any of it.

**Streaming aware.** Agent UIs render partial state constantly. Components handle
incomplete arguments, missing output, and mid-flight status changes without
throwing or shifting layout.

**No SDK lock-in.** Core types depend on no AI SDK. Thin adapters translate from
the Vercel AI SDK, LangGraph, Mastra, or your own protocol into one normalized
model. Swap your backend without touching your UI.

## Install

Headless primitives:

```bash
pnpm add handoff-ui
```

Or copy the styled components into your project, shadcn-style:

```bash
npx shadcn@latest add https://handoff-ui.dev/r/tool-call.json
```

## Usage

```tsx
import {
  ToolCall,
  ToolCallTrigger,
  ToolCallPanel,
  ToolCallName,
  ToolCallStatusText,
  ToolCallDuration,
  ToolCallInput,
  ToolCallOutput,
} from "handoff-ui";

<ToolCall
  name="read_file"
  status="running"
  input={{ path: "src/index.ts" }}
  startedAt={startedAt}
>
  <ToolCallTrigger>
    <ToolCallName />
    <ToolCallStatusText />
    <ToolCallDuration />
  </ToolCallTrigger>
  <ToolCallPanel>
    <ToolCallInput />
    <ToolCallOutput />
  </ToolCallPanel>
</ToolCall>;
```

The root supplies state and ARIA; every visible piece is a part you compose, so
styling never fights the primitive. Style with the `data-status` and `data-state`
attributes each part exposes:

```css
[data-handoff-part="tool-call"][data-status="error"] {
  border-color: var(--color-danger);
}
```

### With the Vercel AI SDK

```tsx
import { fromAISDK } from "handoff-ui/adapters/ai-sdk";

const parts = fromAISDK(message.parts);
```

The adapter is pure functions with no React, so it runs in Server Components.

## Components

| Component     | What it does                                                            |
| ------------- | ----------------------------------------------------------------------- |
| `Approval`    | Human-in-the-loop gate: risk levels, two-press confirm, expiry auto-deny |
| `ToolCall`    | Tool invocation as an accessible disclosure, with live duration          |
| `Reasoning`   | Collapsible thinking that folds away once the model settles              |
| `Diff`        | Streaming line diff, with its own LCS and optional context collapsing    |
| `RunTimeline` | Ordered trace of agent steps                                            |
| `TaskList`    | The agent's plan, with aggregate progress                               |
| `AgentStatus` | idle / thinking / running / waiting indicator                           |
| `UsageMeter`  | Tokens, cost, and context window fill                                   |

Planned next: `ArtifactPanel`, `LogStream`, `Citation`, `PromptComposer`.

## Repository layout

| Path                                         | What lives there                                       |
| -------------------------------------------- | ------------------------------------------------------ |
| [`packages/core`](./packages/core)            | The `handoff-ui` package. Headless primitives, on npm.  |
| [`apps/docs/registry`](./apps/docs/registry)  | Styled components, served to the `shadcn` CLI.          |
| [`apps/docs`](./apps/docs)                    | Documentation site and live playground.                 |

The styled layer lives inside the docs app on purpose: `scripts/build-registry.mjs`
generates `public/r/*.json` from the exact files the site renders, so what
`shadcn add` installs can never drift from the demos you clicked.

## Development

Requires Node 20+ and pnpm 9+.

```bash
pnpm install
pnpm dev
```

`pnpm build` runs the whole pipeline, `pnpm test` runs the suite.

## Deploying the docs

A standard Next.js app. On Vercel, set **Root Directory** to `apps/docs`; the
rest is detected automatically.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md)
for setup and the bar every component has to clear. Issues tagged
[`good first issue`](https://github.com/handoff-ui/handoff-ui/labels/good%20first%20issue)
are scoped to land without deep context.

Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE)
