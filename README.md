# Gear5 UI

Headless, accessible React primitives for agent applications — tool calls,
approvals, traces, and diffs.

Gear5 UI gives you the interface around an agent loop. It does not talk to a
model, it does not own your state, and it will not ask you to restructure
anything.

## Two layers

**`@gear5/core`** is headless. It owns behaviour — focus order, keyboard paths,
live-region announcements, controlled and uncontrolled state — and renders no
styles at all. Use it directly if you have your own design system. It ships no
runtime dependencies and takes React 18 or 19 as a peer.

**The registry** is our styling on top of those primitives, installed with the
shadcn CLI. The files land in your repo as source you own and edit.

```bash
npx shadcn@latest add https://raw.githubusercontent.com/7se7en72025/NYXA-UI/main/apps/docs/public/r/approval.json
```

## Components

24 components across five categories:

| Category | Components |
| --- | --- |
| Decide | Approval, Tool Permission, Checkpoint |
| Execute | Tool Call, Run Timeline, Task List, Agent Status, Run Controls, Agent Handoff |
| Output | Reasoning, Diff, Code Block, Log Stream, Artifact, Citation, Streaming Text |
| Input | Composer, Attachment, Suggestions, Context List |
| Signal | Usage Meter, Run Error, Retry After |

Plus One Piece Background, a decorative animated backdrop.

## Repository layout

```
packages/core        Headless primitives + 181 tests
apps/docs            Documentation site
apps/docs/registry   Styled layer served to the shadcn CLI
```

The catalog lives in `apps/docs/registry/manifest.json`. A build step turns it
into installable JSON under `apps/docs/public/r/`, and the docs site reads the
same file for its index — so the source the CLI serves cannot drift from the
source rendering the demos. CI fails the build if it does.

## Development

```bash
pnpm install
pnpm dev
```

Before opening a PR, run what CI runs:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add a component.

## Licence

MIT — see [LICENSE](LICENSE).
