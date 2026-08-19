/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  Palette,
  Terminal,
  Sparkles,
  Shield,
  ArrowRight,
  Star,
} from "lucide-react";

import { GithubIcon, INSTALL_COMMAND, REPO_URL } from "./_components/site";
import { InstallCommand } from "./_components/install-command";
import { Reveal, RevealGroup } from "./_components/reveal";

function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-white">
            Gear5 UI
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Docs
          </Link>
          <Link
            href="/components"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Components
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Gear5 UI on GitHub"
            className="text-neutral-400 transition-colors hover:text-white"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      </div>

      <RevealGroup
        animate
        stagger={0.15}
        className="relative z-10 mx-auto flex max-w-[800px] flex-col items-center text-center"
      >
        <Reveal duration={0.6}>
          <img src="/favicon.svg" alt="" className="mb-8 h-[72px] w-[72px]" />
        </Reveal>

        <Reveal duration={0.6}>
          <h1 className="text-5xl font-bold tracking-[-0.03em] text-white sm:text-7xl">
            Gear5 UI
          </h1>
        </Reveal>

        <Reveal duration={0.6}>
          <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-neutral-400">
            Design-first components for shadcn/ui. Built from real design
            decisions, not copied defaults.
          </p>
        </Reveal>

        <Reveal duration={0.6} className="mt-10 w-full">
          <InstallCommand command={INSTALL_COMMAND} />
        </Reveal>

        <Reveal
          duration={0.6}
          className="mt-6 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/components"
            className="group inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-cyan-400 hover:shadow-[0_0_32px_rgba(6,182,212,0.3)]"
          >
            Browse Components
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-neutral-300 transition-all hover:border-white/20 hover:text-white"
          >
            <GithubIcon className="h-4 w-4" />
            View on GitHub
          </a>
        </Reveal>
      </RevealGroup>

      <div className="pointer-events-none absolute bottom-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}

const features = [
  {
    icon: Palette,
    title: "Design System First",
    description:
      "Every component starts as an actual design in Figma. Real spacing, real hierarchy, real motion choices, not guesswork.",
  },
  {
    icon: Terminal,
    title: "shadcn CLI Compatible",
    description:
      "Install components with npx shadcn add. You own the code once it hits your project. No vendor lock-in.",
  },
  {
    icon: Sparkles,
    title: "Thoughtful Motion",
    description:
      "Framer Motion animations that explain state changes and guide attention. Never added just for show.",
  },
  {
    icon: Shield,
    title: "Accessible by Default",
    description:
      "Built on Radix UI primitives with proper focus management, keyboard navigation, and ARIA support throughout.",
  },
];

function WhyGear5() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-[1200px]">
        <RevealGroup className="flex flex-col items-center text-center">
          <Reveal>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
              Why Gear5
            </p>
          </Reveal>
          <Reveal>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
              Built different, on purpose
            </h2>
          </Reveal>
          <Reveal>
            <p className="mt-4 max-w-[480px] text-neutral-400">
              Most UI kits feel the same. We started from design principles
              instead of copying the last library.
            </p>
          </Reveal>
        </RevealGroup>

        <RevealGroup stagger={0.08} className="mt-16 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Reveal key={feature.title}>
              <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
                <div className="mb-5 inline-flex rounded-xl bg-cyan-500/10 p-3">
                  <feature.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-400">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[100px]" />
      </div>

      <RevealGroup className="relative z-10 mx-auto max-w-[600px] text-center">
        <Reveal>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400">
            Coming Soon
          </p>
        </Reveal>
        <Reveal>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-5xl">
            Components in progress
          </h2>
        </Reveal>
        <Reveal>
          <p className="mt-4 text-neutral-400">
            One component is shipping today and the rest of the core set is being
            designed right now. Star the repo to stay in the loop.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-neutral-300 transition-all hover:border-white/20 hover:text-white"
          >
            <Star className="h-4 w-4" />
            Star on GitHub
          </a>
        </Reveal>
      </RevealGroup>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-5 w-5" />
          <span className="text-sm text-neutral-500">
            Gear5 UI &middot; MIT License
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/docs"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Docs
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            GitHub
          </a>
          <span className="text-sm text-neutral-600">
            Built with{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noreferrer"
              className="underline transition-colors hover:text-neutral-400"
            >
              shadcn/ui
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <Hero />
      <WhyGear5 />
      <Roadmap />
      <Footer />
    </main>
  );
}
