import Link from "next/link";

import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { GithubIcon, REPO_URL } from "@/app/_components/site";
import { CATALOG } from "@/lib/catalog";

const NAV = [
  { href: "/docs", label: "Docs" },
  { href: "/components", label: "Components" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="" className="h-6 w-6" />
          <span className="text-[15px] font-medium tracking-tight">Gear5 UI</span>
        </Link>

        <div className="flex items-center gap-1">
          <nav aria-label="Main" className="hidden sm:flex sm:items-center sm:gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-chip px-2.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-panel hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <CommandPalette
            items={CATALOG.map((e) => ({
              slug: e.slug,
              name: e.name,
              tagline: e.tagline,
              category: e.category,
            }))}
          />

          <ThemeToggle />

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Gear5 UI on GitHub"
            className="rounded-chip p-2 text-fg-muted transition-colors hover:bg-panel hover:text-fg"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="" className="h-5 w-5" />
          <span className="text-[13px] text-fg-faint">
            Gear5 UI &middot; MIT License
          </span>
        </div>
        <div className="flex items-center gap-5 text-[13px] text-fg-faint">
          <Link href="/docs" className="transition-colors hover:text-fg">
            Docs
          </Link>
          <Link href="/components" className="transition-colors hover:text-fg">
            Components
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-fg"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
