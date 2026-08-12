import type { Metadata } from "next";
import Link from "next/link";
import { CATALOG, CATEGORIES, byCategory } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Every component in Handoff UI, grouped by the part of the run it belongs to.",
};

export default function ComponentsIndex() {
  const groups = byCategory();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl">Components</h1>
        <p className="mt-3 text-lg leading-relaxed text-fg-muted">
          {CATALOG.length} pieces, grouped by where they sit in a run. Each one
          is headless underneath and copy paste on top, so you can take the
          behaviour and throw away our styling.
        </p>
      </header>

      <div className="mt-16 space-y-16">
        {groups.map(({ category, entries }) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3">
              <h2 id={`cat-${category}`} className="text-lg">
                {CATEGORIES[category].label}
              </h2>
              <p className="text-sm text-fg-muted">
                {CATEGORIES[category].blurb}
              </p>
              <span className="ml-auto font-mono text-xs text-fg-faint">
                {entries.length}
              </span>
            </div>

            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/components/${entry.slug}`}
                    className="group flex h-full flex-col rounded-panel border border-line bg-panel p-5 transition-colors hover:border-line-strong"
                  >
                    <span className="font-mono text-[13px] font-medium">
                      {entry.name}
                    </span>
                    <span className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                      {entry.tagline}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-4 text-[13px] text-fg-faint transition-colors group-hover:text-accent"
                    >
                      View
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
