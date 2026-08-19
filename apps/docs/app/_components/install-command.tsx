"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure origin, denied permission) — the command
      // is still selectable, so fail quietly rather than flashing a fake check.
    }
  }

  return (
    <div className="flex w-full max-w-[640px] items-center gap-3 rounded-panel border border-line bg-panel px-4 py-3 text-left">
      <span aria-hidden className="select-none font-mono text-sm text-accent">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-fg-muted">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied to clipboard" : "Copy install command"}
        className="shrink-0 rounded-lg p-2 text-fg-faint transition-colors hover:bg-panel-raised hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {copied ? (
          <Check className="h-4 w-4 text-accent" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
