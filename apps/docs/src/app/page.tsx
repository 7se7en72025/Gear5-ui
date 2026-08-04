import { ArrowUpRight } from "lucide-react";
import { INDIAN_STATES, UPI_HANDLES } from "bharat-ui";

import { ChecksumLab } from "@/components/checksum-lab";
import { CopyCommand } from "@/components/copy-command";
import { Gallery } from "@/components/gallery";
import { COMPONENT_COUNT } from "@/lib/gallery-meta";

const INSTALL = "npx shadcn@latest add https://bharat-ui.vercel.app/r/upi-input.json";

const STATS = [
  [String(COMPONENT_COUNT), "components"],
  [String(UPI_HANDLES.length), "UPI handles indexed"],
  [String(INDIAN_STATES.length), "states & UTs"],
  ["3", "real checksums"],
] as const;

const DECISIONS = [
  {
    title: "Unknown ≠ invalid",
    body: "New PSPs and banks launch constantly. An unrecognised handle or bank code is a hint, never a blocked submission — nobody should fail checkout because a bundled dataset went stale.",
  },
  {
    title: "Structural, and honest about it",
    body: "Where a checksum is public — Verhoeff, Luhn, GSTIN's mod-36 — we run it. Where it isn't, like PAN's 10th character, we say so rather than pretending. Nothing here proves an identifier was ever issued.",
  },
  {
    title: "Errors that teach",
    body: "“Invalid input” helps nobody. Every failure returns its own code and a message that says what to do — a missing @ reads differently from a bad character, and a wrong 5th IFSC character is named outright.",
  },
  {
    title: "Accessible by construction",
    body: "One shared field primitive carries the label, message and aria wiring, so all 30 behave identically. Comboboxes follow the WAI-ARIA APG pattern, errors announce as alerts, and the form summary moves focus on submit.",
  },
] as const;

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid-bg" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 glow" />

        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16 sm:pb-20 sm:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] text-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
              {COMPONENT_COUNT} components, shipping
            </span>

            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
              The form primitives{" "}
              <span className="text-accent">Indian fintech</span> keeps rebuilding.
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
              UPI, PAN, Aadhaar, GSTIN, IFSC, RuPay. Every Indian product rewrites these fields
              from scratch, and most get the validation subtly wrong. These are those fields,
              done properly — copied into your repo by the shadcn CLI, so the code stays yours.
            </p>

            <div className="mt-8 max-w-2xl">
              <CopyCommand command={INSTALL} />
            </div>

            <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {STATS.map(([value, label]) => (
                <div key={label}>
                  <dt className="font-mono text-3xl font-medium tracking-tight tabular-nums">
                    {value}
                  </dt>
                  <dd className="mt-0.5 text-xs text-faint">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6">
        {/* ── Checksums ──────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20" aria-labelledby="checksums">
          <div className="mb-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Not regex theatre
            </p>
            <h2 id="checksums" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Three real checksums, running right here
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] text-muted">
              Most “validation” for Indian identifiers is a length check and a regex. Change a
              digit below and watch these actually catch it.
            </p>
          </div>
          <ChecksumLab />
        </section>

        {/* ── Gallery ────────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20" aria-labelledby="components">
          <div className="mb-2">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Every component
            </p>
            <h2 id="components" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              All {COMPONENT_COUNT}, live
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] text-muted">
              Every card below is the real component, seeded with real data. Type in them. The
              install command for each is one click away.
            </p>
          </div>
          <Gallery />
        </section>

        {/* ── Decisions ──────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20" aria-labelledby="notes">
          <div className="mb-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Design
            </p>
            <h2 id="notes" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Four decisions worth knowing
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {DECISIONS.map((note, index) => (
              <div
                key={note.title}
                className="rounded-xl border border-border bg-surface p-6 transition hover:border-border-strong"
              >
                <span aria-hidden className="font-mono text-[11px] tabular-nums text-faint">
                  0{index + 1}
                </span>
                <h3 className="mb-2 mt-3 text-base font-semibold tracking-tight">
                  {note.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{note.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20">
          <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-8 text-center shadow-card sm:p-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid-bg" />
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Missing a handle, a bank code, a state?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted">
              The datasets here are compiled by hand because nobody publishes them in
              machine-readable form. A one-line correction is the most useful pull request you
              can send.
            </p>
            <a
              href="https://github.com/7se7en72025/NYXA-UI"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Contribute on GitHub
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>MIT licensed. Built in the open.</p>
          <p className="font-mono text-xs">
            Structural validation only — always verify server-side.
          </p>
        </div>
      </footer>
    </>
  );
}
