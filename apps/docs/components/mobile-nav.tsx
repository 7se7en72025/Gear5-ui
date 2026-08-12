"use client";

import * as React from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
}

/**
 * Small screen navigation.
 *
 * A plain disclosure rather than a modal drawer: the panel sits under the bar,
 * so there is no focus trap to get wrong and no scroll lock to leak.
 */
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();

  // Close on Escape from anywhere, which is what people expect from a menu.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="rounded-chip px-2.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-panel hover:text-fg"
      >
        <span aria-hidden="true">{open ? "Close" : "Menu"}</span>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-14 border-b border-line bg-bg p-3 shadow-lg"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-chip px-3 py-2.5 text-sm text-fg-muted transition-colors hover:bg-panel hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://github.com/7se7en72025/NYXA-UI"
              className="rounded-chip px-3 py-2.5 text-sm text-fg-muted transition-colors hover:bg-panel hover:text-fg"
            >
              GitHub
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
