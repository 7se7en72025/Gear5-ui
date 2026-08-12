import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/registry/code-block";
import { CATALOG } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How to install Handoff UI, how the two layers fit together, and what we hold every component to.",
};

const SECTIONS = [
  { id: "install", label: "Install" },
  { id: "two-layers", label: "Two layers" },
  { id: "adapters", label: "Adapters" },
  { id: "styling", label: "Styling" },
  { id: "accessibility", label: "Accessibility" },
  { id: "contributing", label: "Contributing" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <nav
          aria-label="On this page"
          className="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:self-start"
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
            <h1 className="text-3xl">Getting started</h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-fg-muted">
              Handoff UI gives you the interface around an agent loop. It does
              not talk to a model, it does not own your state, and it will not
              ask you to restructure anything.
            </p>
          </header>

          <section id="install" className="mt-14 scroll-mt-24">
            <h2 className="text-xl">Install</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              Two ways in, and you can mix them freely. The npm package gives
              you the headless primitives. The registry copies our styled
              versions straight into your repo, where you own the files.
            </p>

            <div className="mt-5 space-y-3">
              <CodeBlock code="pnpm add handoff-ui" language="bash" bare />
              <CodeBlock
                code="npx shadcn@latest add https://handoff-ui.dev/r/approval.json"
                language="bash"
                bare
              />
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
              React 18 or 19. Nothing else is required, and the package ships no
              runtime dependencies of its own.
            </p>
          </section>

          <section id="two-layers" className="mt-14 scroll-mt-24">
            <h2 className="text-xl">Two layers</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              The primitive holds behaviour, state, and semantics. It renders no
              styles whatsoever. The styled version is a thin wrapper that adds
              classes and nothing else, which is why you can delete it and write
              your own without losing anything that matters.
            </p>

            <div className="mt-5">
              <CodeBlock
                language="tsx"
                filename="your-approval.tsx"
                code={`import {
  Approval,
  ApprovalAction,
  ApprovalActions,
  ApprovalApprove,
  ApprovalDeny,
} from "handoff-ui";

// Your classes, our behaviour.
export function MyApproval(props) {
  return (
    <Approval className="rounded-xl border p-4" {...props}>
      <ApprovalAction className="font-medium" />
      <ApprovalActions className="mt-4 flex gap-2">
        <ApprovalDeny className="btn-ghost" />
        <ApprovalApprove className="btn-primary" />
      </ApprovalActions>
    </Approval>
  );
}`}
              />
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
              Every part also takes asChild, which renders into the element you
              pass instead of ours. Useful when a trigger needs to be a link, or
              when a part has to be your own button component.
            </p>
          </section>

          <section id="adapters" className="mt-14 scroll-mt-24">
            <h2 className="text-xl">Adapters</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              The types here depend on no AI SDK. Adapters translate whatever
              your backend emits into one normalised shape, so swapping the
              backend does not mean rewriting the interface.
            </p>

            <div className="mt-5">
              <CodeBlock
                language="tsx"
                code={`import { fromAISDK } from "handoff-ui/adapters/ai-sdk";

const parts = fromAISDK(message.parts);`}
              />
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
              The adapter is plain functions with no React in sight, so it runs
              inside a Server Component. Only the components themselves are a
              client boundary.
            </p>
          </section>

          <section id="styling" className="mt-14 scroll-mt-24">
            <h2 className="text-xl">Styling</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              Every part publishes its state as data attributes, so you can
              style from CSS without threading props through your tree.
            </p>

            <div className="mt-5">
              <CodeBlock
                language="css"
                code={`[data-handoff-part="tool-call"][data-status="error"] {
  border-color: var(--danger);
}

[data-handoff-part="approval"][data-risk="high"] {
  border-color: var(--danger);
}

/* Armed, waiting for the second press. */
[data-handoff-slot="approve"][data-confirming] {
  background: var(--danger);
}`}
              />
            </div>
          </section>

          <section id="accessibility" className="mt-14 scroll-mt-24">
            <h2 className="text-xl">Accessibility</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              This is the bar every component has to clear before it goes in.
            </p>

            <ul className="mt-5 space-y-3">
              {[
                "Reachable and operable by keyboard, including scroll containers, which are otherwise unreachable entirely.",
                "Real semantics. Ordered lists for traces, progressbars for progress, buttons that are buttons.",
                "Status conveyed as text, never by colour alone. A green dot means nothing to a screen reader.",
                "Live regions chosen per component. Approvals interrupt because the run is blocked. Tool results are polite. Build logs stay silent unless you ask, because hundreds of lines a second through a live region makes a page unusable.",
                "Focus is left where the user put it. Nothing steals it unless you opt in.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                  />
                  <span className="text-fg-muted">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="contributing" className="mt-14 scroll-mt-24">
            <h2 className="text-xl">Contributing</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              The scope is narrow on purpose. General components like buttons
              and dropdowns belong in shadcn or Radix, and we will point you
              there. What belongs here is anything specific to running an agent
              in front of a person.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              Open an issue describing the problem before writing code, and have
              a look at{" "}
              <Link href="/components" className="text-accent underline underline-offset-2">
                the {CATALOG.length} existing components
              </Link>{" "}
              to see the shape things take.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
