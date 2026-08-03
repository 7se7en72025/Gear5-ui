import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "#demo", label: "Demo" },
  { href: "#props", label: "API" },
  { href: "#handles", label: "Handles" },
  { href: "#roadmap", label: "Roadmap" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span
            aria-hidden
            className="size-5 rounded-[6px] bg-gradient-to-br from-accent to-accent/40 ring-1 ring-inset ring-white/20"
          />
          <span className="font-mono text-sm font-medium tracking-tight">bharat-ui</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/raiyyan/bharat-ui"
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-2.5 py-1.5 text-sm text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
