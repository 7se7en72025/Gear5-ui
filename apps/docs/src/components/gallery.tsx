"use client";

import { Check, Copy, Search } from "lucide-react";
import * as React from "react";

import { DEMOS } from "@/components/gallery-data";
import { CATEGORIES, type Category, GALLERY_META } from "@/lib/gallery-meta";
import { cn } from "@/lib/utils";

const BASE = "https://bharat-ui.vercel.app/r";

function InstallButton({ registry }: { registry: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `npx shadcn@latest add ${BASE}/${registry}.json`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the registry name is visible either way.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy install command for ${registry}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-faint transition hover:border-accent hover:text-accent"
    >
      {copied ? (
        <>
          <Check className="size-3 text-emerald-500" /> copied
        </>
      ) : (
        <>
          <Copy className="size-3" /> {registry}
        </>
      )}
    </button>
  );
}

export function Gallery() {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<Category | "All">("All");

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return GALLERY_META.filter((entry) => {
      const matchesCategory = active === "All" || entry.category === active;
      const matchesQuery =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        entry.why.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, active]);

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-14 z-30 -mx-6 mb-8 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${GALLERY_META.length} components…`}
              aria-label="Search components"
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none transition placeholder:text-faint focus-visible:border-accent"
            />
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            {(["All", ...CATEGORIES] as const).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                aria-pressed={active === category}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition",
                  active === category
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-muted hover:border-border-strong hover:text-foreground",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {results.map((entry) => (
          <article
            key={entry.name}
            id={entry.name}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:border-border-strong"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-3">
              <div className="min-w-0">
                <h3 className="font-mono text-sm font-medium">{entry.name}</h3>
                <p className="mt-0.5 text-[11px] text-faint">{entry.category}</p>
              </div>
              <InstallButton registry={entry.registry} />
            </header>

            <div className="flex-1 px-5 py-5">{DEMOS[entry.name]}</div>

            <footer className="border-t border-border bg-surface-2/40 px-5 py-3">
              <p className="text-xs leading-relaxed text-muted">{entry.why}</p>
            </footer>
          </article>
        ))}
      </div>

      {results.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">
          Nothing matches “{query}”.{" "}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActive("All");
            }}
            className="text-accent underline underline-offset-2"
          >
            Clear filters
          </button>
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {results.length} components shown
      </p>
    </div>
  );
}
