"use client";

import * as React from "react";
import { Check, Copy, Search } from "lucide-react";

import { JsonView } from "@/components/json-view";
import { UPIInput, UPI_HANDLES, type VpaResult } from "bharat-ui";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { label: "Phone + PhonePe", value: "9876543210@ybl" },
  { label: "Google Pay", value: "raiyyan@okhdfcbank" },
  { label: "Unknown handle", value: "someone@newpsp" },
  { label: "Typo — no @", value: "raiyyan.paytm" },
  { label: "Bad characters", value: "raiyyan!!@ybl" },
];

function StatusPill({ result }: { result: VpaResult | null }) {
  if (!result) return null;

  const [tone, text] = result.valid
    ? result.unrecognisedHandle
      ? (["warn", "unrecognised handle"] as const)
      : (["ok", "valid"] as const)
    : (["bad", result.error?.code ?? "invalid"] as const);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        tone === "ok" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        tone === "warn" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        tone === "bad" && "bg-red-500/10 text-red-600 dark:text-red-400",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          tone === "ok" && "bg-emerald-500",
          tone === "warn" && "bg-amber-500",
          tone === "bad" && "bg-red-500",
        )}
      />
      {text}
    </span>
  );
}

export function Playground() {
  const [value, setValue] = React.useState("9876543210@ybl");
  const [result, setResult] = React.useState<VpaResult | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="grid md:grid-cols-2">
        {/* Preview */}
        <div className="border-b border-border p-6 md:border-b-0 md:border-r sm:p-8">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            Preview
          </p>

          <UPIInput
            label="UPI ID"
            description="Type an @ to see handle suggestions."
            value={value}
            onValueChange={setValue}
            onValidationChange={setResult}
          />

          <div className="mt-7">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              Try these
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((example) => (
                <button
                  key={example.value}
                  type="button"
                  onClick={() => setValue(example.value)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    value === example.value
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-muted hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="bg-surface-2/60 p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              validateVpa()
            </p>
            <StatusPill result={result} />
          </div>
          <pre className="overflow-x-auto font-mono text-xs leading-[1.7]">
            <JsonView value={result ?? {}} />
          </pre>
        </div>
      </div>
    </div>
  );
}

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions). The command is
      // visible and selectable either way, so there's nothing to recover from.
    }
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card transition hover:border-border-strong">
      <span aria-hidden className="font-mono text-sm text-accent">
        ❯
      </span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-foreground">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy install command"}
        className="shrink-0 rounded-lg border border-transparent p-1.5 text-faint transition hover:border-border hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {copied ? (
          <Check className="size-4 text-emerald-500" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
    </div>
  );
}

export function HandleTable() {
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return UPI_HANDLES;
    return UPI_HANDLES.filter(
      (h) =>
        h.handle.includes(q) ||
        h.provider.toLowerCase().includes(q) ||
        h.bank.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div>
      <div className="relative mb-3 max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by handle, app, or bank…"
          aria-label="Filter handles"
          className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none transition placeholder:text-faint focus-visible:border-accent"
        />
      </div>

      <div className="max-h-96 overflow-auto rounded-xl border border-border bg-surface shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-surface-2/95 backdrop-blur">
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
                Handle
              </th>
              <th className="px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
                App
              </th>
              <th className="hidden px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-faint sm:table-cell">
                Settling bank
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((handle) => (
              <tr
                key={handle.handle}
                className="border-b border-border/60 transition last:border-0 hover:bg-surface-2/70"
              >
                <td className="whitespace-nowrap px-4 py-2 font-mono text-[13px] text-accent">
                  @{handle.handle}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        handle.kind === "psp" ? "bg-accent" : "bg-faint",
                      )}
                    />
                    {handle.provider}
                  </span>
                </td>
                <td className="hidden px-4 py-2 text-muted sm:table-cell">{handle.bank}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                  No handles match “{query}”.
                  <br />
                  <span className="text-faint">
                    Know one we&apos;re missing? That&apos;s the best PR you can send.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          payment app
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-1.5 rounded-full bg-faint" />
          bank-issued
        </span>
        <span>
          {rows.length} of {UPI_HANDLES.length} shown — compiled by hand, corrections welcome.
        </span>
      </p>
    </div>
  );
}
