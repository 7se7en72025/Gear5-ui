import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CATALOG } from "@/lib/catalog";
import { Eyebrow } from "@/components/site-ui";
import { InstallCommand } from "../_components/install-command";
import { installCommandFor } from "../_components/registry";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How to install Gear5 UI, how the two layers fit together, and what every component is held to.",
};

const SECTIONS = [
  { id: "install", label: "Install" },
  { id: "two-layers", label: "Two layers" },
  { id: "styling", label: "Styling" },
  { id: "accessibility", label: "Accessibility" },
  { id: "contributing", label: "Contributing" },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-panel-raised px-1.5 py-0.5 font-mono text-[13px]">
      {children}
    </code>
  );
}

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
    <section id={id} className="mt-14 scroll-mt-20">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-fg-muted">
        {children}
      </div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <nav
          aria-label="On this page"
          className="mb-10 lg:sticky lg:top-20 lg:mb-0 lg:self-start"
        >
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-fg-faint">
            On this page
          </p>
          <ul className="space-y-1">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-chip px-2 py-1.5 text-[13px] text-fg-muted transition-colors hover:bg-panel hover:text-fg"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="min-w-0">
          <header>
            <Eyebrow>Getting started</Eyebrow>
            <h1 className="text-3xl">Install and go</h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-fg-muted">
              Gear5 UI gives you the interface around an agent loop. It does not
              talk to a model, it does not own your state, and it will not ask
              you to restructure anything.
            </p>
          </header>

          <Section id="install" title="Install">
            <p>
              Two ways in, and you can mix them freely. The workspace package
              gives you the headless primitives. The registry copies our styled
              versions straight into your repo, where you own the files.
            </p>
            <InstallCommand command={installCommandFor("approval")} />
            <p>
              Requires React 18 or 19 and Tailwind CSS 3. Styled files land in{" "}
              <Code>components/ui/</Code> along with the <Code>cn</Code> helper
              they share. The headless package ships no runtime dependencies of
              its own.
            </p>
          </Section>

          <Section id="two-layers" title="Two layers">
            <p>
              <Code>@gear5/core</Code> is headless. It owns behaviour — focus
              order, keyboard paths, live-region announcements, controlled and
              uncontrolled state — and renders no styles at all. Use it directly
              if you have your own design system.
            </p>
            <p>
              The registry layer is our styling on top of those primitives. The
              catalog lives in one file, <Code>registry/manifest.json</Code>, and
              a build step turns it into the installable JSON served from{" "}
              <Code>/r/</Code>. This site reads the same file for its index, so
              the source the CLI hands you is the source rendering the demos on
              these pages. CI fails if the two drift apart.
            </p>
            <p>
              Browse the raw index at{" "}
              <a
                href="/r/index.json"
                className="text-accent underline-offset-4 hover:underline"
              >
                /r/index.json
              </a>
              .
            </p>
          </Section>

          <Section id="styling" title="Styling">
            <p>
              Components read from CSS custom properties, so they inherit
              whatever theme you already have. The token set is deliberately
              small: surfaces, lines, one accent, and colours that mean
              something — risk, status, and the two sides of a diff.
            </p>
            <p>
              Because the source is yours once installed, restyling is editing
              the file. No wrapper components, no config escape hatches, no
              overrides fighting specificity.
            </p>
          </Section>

          <Section id="accessibility" title="Accessibility">
            <p>
              This is the part that is genuinely hard, so it is the part that is
              tested. {CATALOG.length} components are covered by 181 tests
              exercising keyboard paths, focus movement, and announcements — not
              snapshots of markup.
            </p>
            <p>
              Decorative motion sits behind <Code>prefers-reduced-motion</Code>,
              purely visual layers are <Code>aria-hidden</Code>, and the focus
              ring is deliberately unmissable. A library that sells itself on
              accessibility cannot ship a focus ring you have to squint at.
            </p>
          </Section>

          <Section id="contributing" title="Contributing">
            <p>
              A component is a headless primitive in <Code>packages/core/src/</Code>
              , a styled version in <Code>apps/docs/registry/</Code>, an entry in{" "}
              <Code>manifest.json</Code>, and a row in <Code>lib/catalog.ts</Code>.
              The registry, the index, and the route generate from there.
            </p>
            <p>
              Before opening a PR, run what CI runs:{" "}
              <Code>pnpm typecheck</Code>, <Code>pnpm lint</Code>,{" "}
              <Code>pnpm test</Code>, and <Code>pnpm build</Code>.
            </p>
          </Section>

          <div className="mt-14 border-t border-line pt-8">
            <Link
              href="/components"
              className="group inline-flex items-center gap-2 text-[14px] text-fg-muted transition-colors hover:text-fg"
            >
              Browse all {CATALOG.length} components
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
