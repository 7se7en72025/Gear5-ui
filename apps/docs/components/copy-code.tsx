"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

/** Multi-line code with a copy button. The install snippet has its own. */
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the code is still selectable.
    }
  }

  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-panel border border-line bg-panel-raised p-5">
        <code className="font-mono text-[13px] leading-relaxed">{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied to clipboard" : "Copy code"}
        className="absolute right-3 top-3 rounded-chip border border-line bg-panel p-2 text-fg-faint opacity-0 transition-all hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-accent" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
