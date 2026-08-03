"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

import { cn } from "./field";

export interface CopyableIdProps {
  value: string;
  label?: string;
  /** Optional right-hand annotation, e.g. the bank or state a code resolves to. */
  hint?: string;
  /** Copy this instead of `value` — useful when the display form has separators. */
  copyValue?: string;
  className?: string;
}

/**
 * A read-only identifier with a copy button — reference numbers, ARNs, UTRs,
 * application IDs. The kind of value a user has to quote back to support, so
 * making it one click to copy removes a genuine transcription-error class.
 */
export function CopyableId({
  value,
  label,
  hint,
  copyValue,
  className,
}: CopyableIdProps) {
  const [copied, setCopied] = React.useState(false);
  const reactId = React.useId();
  const statusId = `copyable-${reactId}-status`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the value stays selectable.
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {label && <p className="mb-1.5 text-sm font-medium">{label}</p>}
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <code className="min-w-0 flex-1 truncate font-mono text-sm">
          {value}
        </code>
        {hint && (
          <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
            {hint}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label ?? "value"}`}
          className="shrink-0 rounded-md p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          {copied ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
      {/* Announced without moving focus, so the copy is confirmed audibly. */}
      <span id={statusId} aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
