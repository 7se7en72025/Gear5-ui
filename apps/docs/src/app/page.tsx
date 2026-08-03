import { ArrowUpRight } from "lucide-react";

import { CopyCommand, HandleTable, Playground } from "@/components/playground";
import { UPI_HANDLES } from "bharat-ui";

const INSTALL = "npx shadcn@latest add https://bharat-ui.dev/r/upi-input.json";

const STATS = [
  [String(UPI_HANDLES.length), "handles indexed"],
  ["11", "distinct error codes"],
  ["0", "runtime dependencies"],
  ["MIT", "licensed"],
] as const;

const DECISIONS = [
  {
    title: "Unknown ≠ invalid",
    body: "New PSPs launch constantly. An unrecognised handle is surfaced as a hint, never a blocked submission — nobody should fail checkout because our dataset went stale.",
  },
  {
    title: "Structural only",
    body: "Nothing here proves an account exists. That needs NPCI, through your PSP's ValidateVPA call. This catches typos, not fictional accounts. Verify server-side before you move money.",
  },
  {
    title: "Errors that teach",
    body: "“Invalid UPI ID” helps nobody. Every failure mode returns its own code and a message that says what to actually do — a missing @ reads differently from a bad character.",
  },
] as const;

const PROPS = [
  ["value", "string", "—", "Controlled value. Omit for uncontrolled use."],
  ["defaultValue", "string", '""', "Initial value when uncontrolled."],
  ["onValueChange", "(value: string) => void", "—", "Fires on every keystroke."],
  ["onValidationChange", "(result: VpaResult) => void", "—", "Fires when the result changes."],
  ["validateOn", '"blur" | "change"', '"blur"', "When errors first appear."],
  ["showProvider", "boolean", "true", "Show the app badge once the handle resolves."],
  ["suggestHandles", "boolean", "true", "Autocomplete handles after @."],
  ["label", "string", "—", "Rendered as an associated <label>."],
  ["description", "string", "—", "Helper text shown when there's no error."],
] as const;

const ROADMAP = [
  ["UPIInput", "VPA validation, handle autocomplete, provider detection.", "shipped"],
  ["AmountInput", "Indian digit grouping — ₹12,34,567, not ₹1,234,567.", "next"],
  ["PANInput", "Format plus the checks the 4th and 10th characters encode.", "next"],
  ["IFSCField", "Bank and branch lookup on blur.", "planned"],
  ["AadhaarInput", "Verhoeff checksum, masked display, OTP step.", "planned"],
  ["GSTInput", "15-character structure, cross-checked against the embedded PAN.", "planned"],
  ["PincodeAddress", "PIN code auto-fills city and state.", "planned"],
] as const;

function SectionHeading({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  id: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {children && <p className="mt-2 max-w-2xl text-[15px] text-muted">{children}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid-bg" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 glow" />

        <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-16 sm:pb-20 sm:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] text-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
              UPIInput is live
            </span>

            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-6xl">
              The form primitives{" "}
              <span className="text-accent">Indian fintech</span> keeps rebuilding.
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
              UPI, PAN, Aadhaar, IFSC, GST. Every Indian product rewrites these fields from
              scratch, and most get the validation subtly wrong. These are those fields, done
              properly — installed through the shadcn CLI, so the code lands in your repo and
              stays yours.
            </p>

            <div className="mt-8 max-w-2xl">
              <CopyCommand command={INSTALL} />
            </div>

            <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {STATS.map(([value, label]) => (
                <div key={label}>
                  <dt className="font-mono text-2xl font-medium tracking-tight">{value}</dt>
                  <dd className="mt-0.5 text-xs text-faint">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-6">
        {/* ── Demo ───────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20" aria-labelledby="demo">
          <SectionHeading eyebrow="Component" title="UPIInput" id="demo">
            Live validation, ranked handle autocomplete, and provider detection. Watch the result
            object change as you type.
          </SectionHeading>
          <Playground />
        </section>

        {/* ── Decisions ──────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20" aria-labelledby="notes">
          <SectionHeading eyebrow="Design" title="Three decisions worth knowing" id="notes" />
          <div className="grid gap-4 md:grid-cols-3">
            {DECISIONS.map((note, index) => (
              <div
                key={note.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-surface p-6 transition hover:border-border-strong"
              >
                <span
                  aria-hidden
                  className="font-mono text-[11px] tabular-nums text-faint"
                >
                  0{index + 1}
                </span>
                <h3 className="mb-2 mt-3 text-base font-semibold tracking-tight">{note.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{note.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Props ──────────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20" aria-labelledby="props">
          <SectionHeading eyebrow="API" title="Props" id="props">
            Everything else is forwarded to the underlying <code className="font-mono">input</code>.
          </SectionHeading>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/60">
                <tr className="border-b border-border">
                  {["Prop", "Type", "Default", "Notes"].map((head, index) => (
                    <th
                      key={head}
                      className={[
                        "px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-faint",
                        index === 2 && "hidden sm:table-cell",
                        index === 3 && "hidden md:table-cell",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROPS.map(([name, type, def, note]) => (
                  <tr
                    key={name}
                    className="border-b border-border/60 align-top transition last:border-0 hover:bg-surface-2/70"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px] text-accent">
                      {name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted">{type}</td>
                    <td className="hidden whitespace-nowrap px-4 py-3 font-mono text-[12px] text-muted sm:table-cell">
                      {def}
                    </td>
                    <td className="hidden px-4 py-3 text-muted md:table-cell">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Handles ────────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20" aria-labelledby="handles">
          <SectionHeading eyebrow="Data" title="Handle registry" id="handles">
            Which app issued a VPA, and which bank actually settles it. NPCI doesn&apos;t publish
            this in machine-readable form, so it&apos;s maintained by hand.
          </SectionHeading>
          <HandleTable />
        </section>

        {/* ── Roadmap ────────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20" aria-labelledby="roadmap">
          <SectionHeading eyebrow="Next" title="What's coming" id="roadmap" />
          <ul className="grid gap-3 sm:grid-cols-2">
            {ROADMAP.map(([name, body, status]) => (
              <li
                key={name}
                className={[
                  "rounded-xl border p-5 transition",
                  status === "shipped"
                    ? "border-accent/30 bg-accent-soft"
                    : "border-border bg-surface hover:border-border-strong",
                ].join(" ")}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{name}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]",
                      status === "shipped"
                        ? "bg-accent text-white dark:text-black"
                        : status === "next"
                          ? "bg-accent/15 text-accent"
                          : "border border-border text-faint",
                    ].join(" ")}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section className="border-t border-border py-16 sm:py-20">
          <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-8 text-center shadow-card sm:p-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid-bg" />
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Missing a handle?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
              The registry is only as good as its contributors. A one-line correction is the most
              useful pull request you can send.
            </p>
            <a
              href="https://github.com/raiyyan/bharat-ui"
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>MIT licensed. Built in the open.</p>
          <p className="font-mono text-xs">
            Structural validation only — always verify server-side.
          </p>
        </div>
      </footer>
    </>
  );
}
