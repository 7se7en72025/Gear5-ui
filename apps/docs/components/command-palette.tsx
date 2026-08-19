"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Item = { slug: string; name: string; tagline: string; category: string };

/**
 * Plain dialog rather than a library: the list is small, and the behaviour we
 * need — focus the input, trap nothing, close on Escape — is less code than
 * wiring a dependency.
 */
export function CommandPalette({ items }: { items: Item[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.slug.includes(q) ||
          i.tagline.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [items, query]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // Focus after paint, or the input is not in the DOM yet.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => setActive(0), [query]);

  const go = React.useCallback(
    (slug: string) => {
      setOpen(false);
      router.push(`/components/${slug}`);
    },
    [router],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-chip border border-line px-2.5 py-1.5 text-[13px] text-fg-faint transition-colors hover:border-line-strong hover:text-fg sm:flex"
      >
        Search
        <kbd className="rounded border border-line px-1 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search components"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-panel border border-line-strong bg-panel shadow-2xl"
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => (i + 1) % Math.max(results.length, 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive(
                    (i) =>
                      (i - 1 + Math.max(results.length, 1)) %
                      Math.max(results.length, 1),
                  );
                } else if (e.key === "Enter" && results[active]) {
                  e.preventDefault();
                  go(results[active].slug);
                }
              }}
              placeholder="Search components…"
              aria-controls={listId}
              className="w-full border-b border-line bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-fg-faint"
            />
            <ul id={listId} className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-[13px] text-fg-faint">
                  Nothing matches “{query}”
                </li>
              ) : (
                results.map((item, i) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(item.slug)}
                      className={`flex w-full items-center justify-between gap-3 rounded-chip px-3 py-2.5 text-left transition-colors ${
                        i === active ? "bg-panel-raised" : ""
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-[14px]">{item.name}</span>
                        <span className="block truncate text-[12px] text-fg-faint">
                          {item.tagline}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-fg-faint">
                        {item.category}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
