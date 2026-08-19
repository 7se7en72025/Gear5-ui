import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { InstallCommand } from "../_components/install-command";
import { components, installCommandFor } from "../_components/registry";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How to install Gear5 UI, how the registry works, and what every component is held to.",
};

const SECTIONS = [
  { id: "install", label: "Install" },
  { id: "how-it-works", label: "How it works" },
  { id: "styling", label: "Styling" },
  { id: "accessibility", label: "Accessibility" },
  { id: "contributing", label: "Contributing" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-neutral-400">
        {children}
      </div>
    </section>
  );
}

export default function DocsPage() {
  const first = components[0];

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-24">
      <div className="mx-auto max-w-[1100px] lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <nav
          aria-label="On this page"
          className="mb-12 lg:sticky lg:top-24 lg:mb-0 lg:self-start"
        >
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-neutral-600">
            On this page
          </p>
          <ul className="space-y-1">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-lg px-2 py-1.5 text-[13px] text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="min-w-0">
          <Link
            href="/"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            ← Back to home
          </Link>

          <header className="mt-6">
            <h1 className="text-4xl font-bold tracking-[-0.02em] text-white">
              Getting started
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-400">
              Gear5 UI is a shadcn-compatible registry. Components are copied
              into your repo as plain source you own and edit — there is no
              runtime package to keep in step with.
            </p>
          </header>

          <Section id="install" title="Install">
            <p>
              Every component is installed with the shadcn CLI, one URL per
              component. Run it inside a project that already has shadcn
              initialised.
            </p>
            {first ? <InstallCommand command={installCommandFor(first.slug)} /> : null}
            <p>
              Requires React 18 and Tailwind CSS 3. The files land in{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                components/ui/
              </code>{" "}
              and pull in no dependencies of their own beyond what your project
              already has.
            </p>
          </Section>

          <Section id="how-it-works" title="How it works">
            <p>
              The catalog lives in one file,{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                packages/core/registry.json
              </code>
              . A build step turns it into the installable JSON served from{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                /r/
              </code>
              , and this site reads the same file for its component index.
            </p>
            <p>
              That means the source the CLI hands you is the exact source
              rendering the demos on these pages — CI fails the build if the two
              ever drift apart.
            </p>
            <p>
              You can browse the raw index at{" "}
              <a
                href="/r/index.json"
                className="text-cyan-400 underline-offset-4 hover:underline"
              >
                /r/index.json
              </a>
              .
            </p>
          </Section>

          <Section id="styling" title="Styling">
            <p>
              Components are styled with Tailwind utility classes and read from
              the CSS custom properties defined in your{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                globals.css
              </code>
              , so they inherit whatever theme you already have.
            </p>
            <p>
              Because the source is yours once installed, restyling is editing
              the file — no wrapper components, no config escape hatches, no
              overrides fighting specificity.
            </p>
          </Section>

          <Section id="accessibility" title="Accessibility">
            <p>
              Decorative motion is placed behind{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                prefers-reduced-motion
              </code>
              , and purely visual layers are marked{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                aria-hidden
              </code>{" "}
              so they are skipped by assistive technology.
            </p>
            <p>
              Interactive components are held to keyboard operability and
              visible focus. As the set grows, anything with a disclosure,
              dialog, or menu pattern is built on established primitives rather
              than hand-rolled.
            </p>
          </Section>

          <Section id="contributing" title="Contributing">
            <p>
              Adding a component means adding its source under{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                packages/core/src/
              </code>{" "}
              and an entry in{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                registry.json
              </code>
              . The registry, the component index, and its route are generated
              from there.
            </p>
            <p>
              Before opening a PR, run the same three commands CI does:{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                pnpm typecheck
              </code>
              ,{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                pnpm lint
              </code>
              , and{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-neutral-300">
                pnpm build
              </code>
              .
            </p>
          </Section>

          <div className="mt-16 border-t border-white/[0.06] pt-8">
            <Link
              href="/components"
              className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              Browse all components
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
