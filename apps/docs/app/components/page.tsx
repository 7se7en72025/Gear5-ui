import type { Metadata } from "next";
import Link from "next/link";

import { byCategory, type Category } from "@/lib/catalog";
import { Eyebrow } from "@/components/site-ui";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Every component in Gear5 UI, grouped by the part of an agent run it belongs to.",
};

const CATEGORY_COPY: Record<Category, { title: string; lede: string }> = {
  decide: {
    title: "Decide",
    lede: "Moments where the run stops and waits for a person.",
  },
  execute: {
    title: "Execute",
    lede: "What the agent is doing, and how far along it is.",
  },
  output: {
    title: "Output",
    lede: "What came back, and where it came from.",
  },
  input: {
    title: "Input",
    lede: "How work and context get handed to the agent.",
  },
  signal: {
    title: "Signal",
    lede: "Cost, failure, and everything that needs noticing.",
  },
};

export default function ComponentsIndex() {
  const groups = byCategory();
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0);

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <header className="max-w-2xl">
        <Eyebrow>{total} components</Eyebrow>
        <h1 className="text-3xl">Components</h1>
        <p className="mt-3 text-lg leading-relaxed text-fg-muted">
          Grouped by the part of an agent run they belong to. Every one installs
          with the shadcn CLI and lands in your repo as source you own.
        </p>
      </header>

      <div className="mt-16 space-y-16">
        {groups.map((group) => (
          <section key={group.category}>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
              <div>
                <h2 className="text-xl">{CATEGORY_COPY[group.category].title}</h2>
                <p className="mt-1 text-[15px] text-fg-muted">
                  {CATEGORY_COPY[group.category].lede}
                </p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">
                {group.entries.length}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.entries.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/components/${entry.slug}`}
                  className="group rounded-panel border border-line bg-panel p-5 transition-colors hover:border-line-strong hover:bg-panel-raised"
                >
                  <h3 className="text-[15px] transition-colors group-hover:text-accent">
                    {entry.name}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                    {entry.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
