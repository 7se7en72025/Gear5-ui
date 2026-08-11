import { AgentRunDemo } from "@/components/agent-run-demo";
import {
  AgentStatusExample,
  ApprovalExample,
  DiffExample,
  ReasoningExample,
  RunTimelineExample,
  TaskListExample,
  ToolCallExample,
  UsageMeterExample,
} from "@/components/component-gallery";

const COMPONENTS = [
  {
    id: "approval",
    name: "Approval",
    blurb:
      "The human-in-the-loop gate. Risk levels, a two-press confirm on destructive actions, an expiry countdown, and an assertive announcement because the run is blocked on you.",
    demo: <ApprovalExample />,
  },
  {
    id: "tool-call",
    name: "ToolCall",
    blurb:
      "A tool invocation as a real disclosure: a button with aria-expanded, a labelled region, live duration, and partial arguments rendered safely while they stream.",
    demo: <ToolCallExample />,
  },
  {
    id: "reasoning",
    name: "Reasoning",
    blurb:
      "Collapsible thinking. Expands while streaming and folds away once settled — unless you clicked it, in which case your choice wins.",
    demo: <ReasoningExample />,
  },
  {
    id: "diff",
    name: "Diff",
    blurb:
      "A line diff with its own LCS, prefix and suffix trimming, and a table-size guard so a streamed rewrite of a large file cannot lock the main thread.",
    demo: <DiffExample />,
  },
  {
    id: "run-timeline",
    name: "RunTimeline",
    blurb:
      "The trace, as a real ordered list. Markers are decorative; their status is exposed as text.",
    demo: <RunTimelineExample />,
  },
  {
    id: "task-list",
    name: "TaskList",
    blurb:
      "The agent's plan. Progress is aggregated into one progressbar rather than announcing every item as it flips.",
    demo: <TaskListExample />,
  },
  {
    id: "agent-status",
    name: "AgentStatus",
    blurb:
      "What the agent is doing. Only waiting and error interrupt; everything else stays polite.",
    demo: <AgentStatusExample />,
  },
  {
    id: "usage-meter",
    name: "UsageMeter",
    blurb:
      "Tokens, cost, and how close the run is to filling its context window.",
    demo: <UsageMeterExample />,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="py-16 sm:py-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-brand">
          Headless · Accessible · MIT
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          The UI layer for agent apps.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Agent apps are not chat apps. Chat is solved. What nobody ships is
          everything around the loop — approvals, tool calls, traces, and diffs.
          Handoff UI is that missing layer.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#components"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Browse components
          </a>
          <code className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm">
            pnpm add handoff-ui
          </code>
        </div>
      </section>

      <section aria-labelledby="demo-heading" className="pb-20">
        <h2 id="demo-heading" className="mb-1 text-xl font-semibold tracking-tight">
          A run, end to end
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Every component below is live. The run genuinely stops at the approval
          until you decide — that pause is the point.
        </p>
        <AgentRunDemo />
      </section>

      <section aria-labelledby="why-heading" className="border-t border-border py-16">
        <h2 id="why-heading" className="text-xl font-semibold tracking-tight">
          Four decisions
        </h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <dt className="font-medium">Accessible or it does not ship</dt>
            <dd className="mt-1.5 text-sm text-muted-foreground">
              Keyboard navigable, correct ARIA, managed focus, and live regions
              that announce streaming content without flooding you. This is the
              reason the library exists, not a checkbox at the end.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Headless first</dt>
            <dd className="mt-1.5 text-sm text-muted-foreground">
              The core package renders zero styles — only behaviour, state, and
              ARIA. Every part takes <code className="font-mono">asChild</code>,
              so you can render into your own components and keep all of it.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Streaming aware</dt>
            <dd className="mt-1.5 text-sm text-muted-foreground">
              Agent UIs render partial state constantly. Components handle
              incomplete arguments, missing output, and mid-flight status changes
              without throwing or shifting layout.
            </dd>
          </div>
          <div>
            <dt className="font-medium">No SDK lock-in</dt>
            <dd className="mt-1.5 text-sm text-muted-foreground">
              Core types depend on no AI SDK. Thin adapters translate from the
              Vercel AI SDK, LangGraph, Mastra, or your own protocol. Swap your
              backend without touching your UI.
            </dd>
          </div>
        </dl>
      </section>

      <section
        id="components"
        aria-labelledby="components-heading"
        className="border-t border-border py-16"
      >
        <h2 id="components-heading" className="text-xl font-semibold tracking-tight">
          Components
        </h2>

        <div className="mt-10 space-y-14">
          {COMPONENTS.map((component) => (
            <article key={component.id} id={component.id} className="scroll-mt-20">
              <h3 className="font-mono text-base font-semibold">{component.name}</h3>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                {component.blurb}
              </p>
              <div className="mt-5">{component.demo}</div>
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                npx shadcn@latest add https://handoff-ui.dev/r/{component.id}.json
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
