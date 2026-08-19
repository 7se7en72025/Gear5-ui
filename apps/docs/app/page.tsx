import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ApprovalExample, ToolCallExample } from "@/components/component-gallery";
import { Eyebrow } from "@/components/site-ui";
import { byCategory, CATALOG } from "@/lib/catalog";
import { GithubIcon, INSTALL_COMMAND, REPO_URL } from "./_components/site";
import { InstallCommand } from "./_components/install-command";
import { Reveal, RevealGroup } from "./_components/reveal";

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line px-5 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.08] blur-[120px]" />
      </div>

      <RevealGroup
        animate
        stagger={0.12}
        className="relative mx-auto max-w-3xl text-center"
      >
        <Reveal duration={0.5}>
          <Eyebrow>
            <span className="mx-auto">{CATALOG.length} components</span>
          </Eyebrow>
        </Reveal>

        <Reveal duration={0.5}>
          <h1 className="text-balance text-4xl leading-[1.08] sm:text-6xl">
            The interface around your agent loop
          </h1>
        </Reveal>

        <Reveal duration={0.5}>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-fg-muted">
            Approvals, tool calls, traces, and diffs — headless and accessible
            underneath, styled source you own on top. It does not talk to a
            model or hold your state.
          </p>
        </Reveal>

        <Reveal duration={0.5}>
          <div className="mt-9 flex justify-center">
            <InstallCommand command={INSTALL_COMMAND} />
          </div>
        </Reveal>

        <Reveal duration={0.5}>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/components"
              className="group inline-flex items-center gap-2 rounded-chip bg-accent px-5 py-2.5 text-[14px] font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              Browse components
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-chip border border-line px-5 py-2.5 text-[14px] font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </Reveal>
      </RevealGroup>
    </section>
  );
}

/**
 * Two real components, running. A library that only describes itself is asking
 * to be taken on faith.
 */
function LiveProof() {
  return (
    <section className="border-b border-line px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealGroup>
          <Reveal>
            <Eyebrow>Not a screenshot</Eyebrow>
          </Reveal>
          <Reveal>
            <h2 className="max-w-2xl text-[1.6rem] leading-tight">
              The components on this page are the components you install
            </h2>
          </Reveal>
          <Reveal>
            <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
              Both of these are live, rendered from the same source the CLI
              copies into your repo. Try them.
            </p>
          </Reveal>
        </RevealGroup>

        <RevealGroup stagger={0.1} className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <figure className="h-full rounded-panel border border-line bg-panel p-6">
              <figcaption className="mb-5 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">
                  Approval
                </span>
                <Link
                  href="/components/approval"
                  className="text-[13px] text-fg-faint transition-colors hover:text-accent"
                >
                  Docs →
                </Link>
              </figcaption>
              <ApprovalExample />
            </figure>
          </Reveal>
          <Reveal>
            <figure className="h-full rounded-panel border border-line bg-panel p-6">
              <figcaption className="mb-5 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">
                  Tool Call
                </span>
                <Link
                  href="/components/tool-call"
                  className="text-[13px] text-fg-faint transition-colors hover:text-accent"
                >
                  Docs →
                </Link>
              </figcaption>
              <ToolCallExample />
            </figure>
          </Reveal>
        </RevealGroup>
      </div>
    </section>
  );
}

const PRINCIPLES = [
  {
    title: "Two layers, pick either",
    body: "The npm package gives you headless primitives with the behaviour and accessibility already solved. The registry copies our styled versions into your repo, where you own the files outright. Mix them freely.",
  },
  {
    title: "Accessibility is the product",
    body: "Focus management, keyboard paths, and live-region announcements are the hard part of these components, not the styling. 181 tests cover that behaviour, and they run on every commit.",
  },
  {
    title: "Colour reserved for meaning",
    body: "The base is near monochrome. Colour marks risk, status, and the two sides of a diff. If everything is accented then nothing reads as urgent, and this library is mostly about urgency.",
  },
  {
    title: "No runtime dependencies",
    body: "The headless package ships nothing but React as a peer. Nothing to keep in step, nothing to audit, no transitive surprises in your lockfile.",
  },
];

function Principles() {
  return (
    <section className="border-b border-line px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealGroup>
          <Reveal>
            <Eyebrow>Why it is built this way</Eyebrow>
          </Reveal>
          <Reveal>
            <h2 className="max-w-2xl text-[1.6rem] leading-tight">
              Opinionated where it counts
            </h2>
          </Reveal>
        </RevealGroup>

        <RevealGroup stagger={0.08} className="mt-12 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((item) => (
            <Reveal key={item.title}>
              <div className="h-full rounded-panel border border-line bg-panel p-6">
                <h3 className="text-[15px]">{item.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-fg-muted">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function Catalog() {
  const groups = byCategory();

  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealGroup>
          <Reveal>
            <Eyebrow>The set</Eyebrow>
          </Reveal>
          <Reveal>
            <h2 className="max-w-2xl text-[1.6rem] leading-tight">
              Everything an agent run needs a surface for
            </h2>
          </Reveal>
        </RevealGroup>

        <RevealGroup stagger={0.06} className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Reveal key={group.category}>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">
                  {group.category}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {group.entries.map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        href={`/components/${entry.slug}`}
                        className="text-[14px] text-fg-muted transition-colors hover:text-accent"
                      >
                        {entry.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </RevealGroup>

        <Reveal>
          <div className="mt-14">
            <Link
              href="/docs"
              className="group inline-flex items-center gap-2 text-[14px] text-fg-muted transition-colors hover:text-fg"
            >
              Read the docs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <LiveProof />
      <Principles />
      <Catalog />
    </>
  );
}
