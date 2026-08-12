import Link from "next/link";
import { AgentRunDemo } from "@/components/agent-run-demo";
import { CodeBlock } from "@/registry/code-block";
import { CATALOG } from "@/lib/catalog";

const PRINCIPLES = [
  {
    title: "Accessible, or it does not ship",
    body: "Keyboard paths, correct ARIA, managed focus, and live regions tuned so streaming output does not talk over the person watching it. This is the reason the library exists, not a pass someone did at the end.",
  },
  {
    title: "Headless underneath",
    body: "The core package renders no styles at all. It handles behaviour, state, and semantics. Every part takes asChild, so you can render into your own components and keep all of that.",
  },
  {
    title: "Built for partial state",
    body: "Agent interfaces spend most of their time half finished. Arguments arrive as broken JSON, output is missing, status flips mid render. Nothing here throws or jumps when that happens.",
  },
  {
    title: "No SDK to marry",
    body: "The types depend on no AI SDK. Small adapters translate from the Vercel AI SDK, LangGraph, Mastra, or whatever you built yourself. Change your backend without touching your interface.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-50" />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:pt-28">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[11px] text-fg-muted">
            <span
              aria-hidden="true"
              className="inline-block size-1.5 rounded-full bg-accent animate-pulse-soft"
            />
            {CATALOG.length} components, MIT licensed
          </p>

          <h1 className="max-w-3xl text-balance text-4xl leading-[1.08] sm:text-5xl">
            Agent apps are not chat apps.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
            Chat is a solved problem. What nobody ships is the rest of the
            interface: the approval that stops a destructive write, the tool
            call you need to inspect, the diff still streaming in, the log you
            are trying to read while it scrolls. Handoff UI is that layer.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/components"
              className="rounded-chip bg-fg px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              Browse components
            </Link>
            <Link
              href="/docs"
              className="rounded-chip border border-line px-4 py-2.5 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              Read the docs
            </Link>
          </div>

          <div className="mt-8 max-w-md">
            <CodeBlock code="pnpm add handoff-ui" language="bash" bare />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="run-heading"
        className="mx-auto max-w-6xl px-5 py-20"
      >
        <div className="mb-8 max-w-2xl">
          <h2 id="run-heading" className="text-2xl">
            A run, start to finish
          </h2>
          <p className="mt-2.5 text-fg-muted">
            Every component below is the real thing, not a screenshot. It stops
            at the approval and waits for you, because that pause is the whole
            argument.
          </p>
        </div>

        <AgentRunDemo />
      </section>

      <section
        aria-labelledby="principles-heading"
        className="border-t border-line"
      >
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 id="principles-heading" className="text-2xl">
            Four decisions worth knowing about
          </h2>

          <dl className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div key={item.title}>
                <dt className="text-[15px] font-medium">{item.title}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-fg-muted">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="catalog-heading"
        className="border-t border-line"
      >
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="catalog-heading" className="text-2xl">
                The catalog
              </h2>
              <p className="mt-2.5 text-fg-muted">
                Each one has a live demo, the props, and notes on what it gets
                right.
              </p>
            </div>
            <Link
              href="/components"
              className="text-sm text-accent transition-opacity hover:opacity-80"
            >
              See all {CATALOG.length}
            </Link>
          </div>

          <ul className="mt-8 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG.map((entry) => (
              <li key={entry.slug} className="bg-bg">
                <Link
                  href={`/components/${entry.slug}`}
                  className="group flex h-full flex-col gap-1.5 p-5 transition-colors hover:bg-panel"
                >
                  <span className="font-mono text-[13px] font-medium">
                    {entry.name}
                  </span>
                  <span className="text-[13px] leading-relaxed text-fg-muted">
                    {entry.tagline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
