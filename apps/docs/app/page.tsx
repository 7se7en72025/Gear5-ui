import Link from "next/link";
import { AgentRunDemo } from "@/components/agent-run-demo";
import { HeroApproval } from "@/components/hero-approval";
import { SectionHeading, Stats } from "@/components/site-ui";
import { CodeBlock } from "@/registry/code-block";
import { CATALOG, CATEGORIES } from "@/lib/catalog";

const STATS = [
  { value: String(CATALOG.length), label: "Components" },
  { value: "16.3 kB", label: "Core, gzipped" },
  { value: "0", label: "Runtime deps" },
  { value: "125", label: "Tests" },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Accessible, or it does not ship",
    body: "Keyboard paths, correct ARIA, managed focus, and live regions tuned so streaming output does not talk over the person watching it. This is the reason the library exists, not a pass someone did at the end.",
  },
  {
    n: "02",
    title: "Headless underneath",
    body: "The core package renders no styles at all. It handles behaviour, state, and semantics. Every part takes asChild, so you can render into your own components and keep all of that.",
  },
  {
    n: "03",
    title: "Built for partial state",
    body: "Agent interfaces spend most of their time half finished. Arguments arrive as broken JSON, output is missing, status flips mid render. Nothing here throws or jumps when that happens.",
  },
  {
    n: "04",
    title: "No SDK to marry",
    body: "The types depend on no AI SDK. Small adapters translate from the Vercel AI SDK, LangGraph, Mastra, or whatever you built yourself. Change your backend without touching your interface.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="bg-grid absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[100px]"
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
            <div>
              <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-panel/60 px-3 py-1 font-mono text-[11px] text-fg-muted backdrop-blur">
                <span
                  aria-hidden="true"
                  className="inline-block size-1.5 rounded-full bg-accent animate-pulse-soft"
                />
                {CATALOG.length} components, MIT licensed
              </p>

              <h1 className="text-balance text-[2.6rem] leading-[1.03] sm:text-[3.4rem]">
                Agent apps are not chat apps.
              </h1>

              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted">
                Chat is a solved problem. What nobody ships is the rest of the
                interface: the approval that stops a destructive write, the tool
                call you need to inspect, the diff still streaming in, the log
                you are trying to read while it scrolls past.
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

              <div className="mt-8 max-w-sm">
                <CodeBlock code="pnpm add handoff-ui" language="bash" bare />
              </div>
            </div>

            <HeroApproval />
          </div>

          <div className="mt-16">
            <Stats items={STATS} />
          </div>
        </div>
      </section>

      <section aria-labelledby="run-heading" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading
            id="run-heading"
            eyebrow="Live"
            title="A run, start to finish"
            lede="Every component below is the real thing, not a screenshot. It stops at the approval and waits for you, because that pause is the whole argument."
          />
          <div className="mt-10">
            <AgentRunDemo />
          </div>
        </div>
      </section>

      <section aria-labelledby="principles-heading" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading
            id="principles-heading"
            eyebrow="Principles"
            title="Four decisions worth knowing about"
          />

          <dl className="mt-12 grid gap-x-14 gap-y-10 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="flex gap-5">
                <span
                  aria-hidden="true"
                  className="font-mono text-[13px] text-fg-faint"
                >
                  {item.n}
                </span>
                <div>
                  <dt className="text-[15px] font-medium">{item.title}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-fg-muted">
                    {item.body}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="catalog-heading">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading
            id="catalog-heading"
            eyebrow="Catalog"
            title="Thirteen pieces, one job each"
            lede="Every component has a live demo, its props, and notes on the details it gets right."
            action={
              <Link
                href="/components"
                className="rounded-chip border border-line px-3.5 py-2 text-[13px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                See all {CATALOG.length}
              </Link>
            }
          />

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/components/${entry.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-panel border border-line bg-panel p-5 transition-colors hover:border-line-strong"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                  />

                  <span className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[13px] font-medium">
                      {entry.name}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-fg-faint">
                      {CATEGORIES[entry.category].label}
                    </span>
                  </span>

                  <span className="mt-2 text-[13px] leading-relaxed text-fg-muted">
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
