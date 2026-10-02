import Link from "next/link";
import { siteConfig } from "@/lib/site";
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-xl">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8"
      >
        <Link
          href="/"
          aria-label="Gear5 UI home"
          className="flex items-center gap-2.5"
        >
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-coral font-mono text-xs font-black text-on-accent"
          >
            G5
          </span>
          <span className="text-base font-semibold tracking-[-.05em]">
            gear5<span className="text-smoke"> / ui</span>
          </span>
        </Link>
        <div className="flex items-center gap-5 text-xs text-smoke sm:gap-7">
          <Link href="/components" className="hover:text-cream">
            Components
          </Link>
          <Link href="/templates" className="hover:text-cream">
            Templates
          </Link>
          <Link
            href="/getting-started"
            className="hidden hover:text-cream sm:block"
          >
            Docs
          </Link>
          <a
            href={siteConfig.repo}
            className="rounded-full border border-hairline px-3 py-2 hover:text-cream"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <Link href="/" className="text-3xl font-semibold tracking-[-.07em]">
              gear5 / ui<span className="text-coral">.</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-smoke">
              A little character. A lot of possibility.
              <br />
              React blocks for your next big thing.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-8 gap-y-4 text-xs text-smoke"
          >
            <Link href="/components">Components</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/getting-started">Documentation</Link>
            <a href={siteConfig.repo}>Source ↗</a>
          </nav>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-hairline pt-5 font-mono text-[10px] text-smoke">
          <span>OPEN SOURCE · MIT LICENSED</span>
          <span>DESIGNED TO BE MADE YOURS.</span>
        </div>
      </div>
    </footer>
  );
}
