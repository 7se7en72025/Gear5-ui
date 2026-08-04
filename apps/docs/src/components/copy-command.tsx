"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

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
      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px]">
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
