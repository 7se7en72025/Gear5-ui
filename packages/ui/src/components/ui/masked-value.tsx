"use client";

import { Check, Copy, Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "./field";

export type MaskPreset = "aadhaar" | "pan" | "account" | "card" | "mobile";

export interface MaskedValueProps {
  value: string;
  /** Masking rule. `custom` uses `visibleEnd` alone. */
  preset?: MaskPreset | "custom";
  /** Characters left visible at the end when `preset="custom"`. Default 4. */
  visibleEnd?: number;
  /** Allow revealing the full value. Default `true`. */
  revealable?: boolean;
  /** Offer a copy button. Copies the *unmasked* value. */
  copyable?: boolean;
  label?: string;
  className?: string;
}

function maskWith(
  value: string,
  preset: MaskedValueProps["preset"],
  visibleEnd: number,
) {
  const raw = value.trim();
  if (!raw) return "";

  switch (preset) {
    case "aadhaar":
      return raw.length >= 4
        ? `XXXX XXXX ${raw.replace(/\D/g, "").slice(-4)}`
        : "XXXX";
    case "pan":
      // First three characters are the issuing series, not identifying.
      return raw.length === 10
        ? `${raw.slice(0, 3)}XXXXX${raw.slice(8)}`
        : "XXXXXXXXXX";
    case "card":
      return raw.length >= 4
        ? `•••• •••• •••• ${raw.replace(/\D/g, "").slice(-4)}`
        : "••••";
    case "mobile":
      return raw.length >= 4
        ? `XXXXXX${raw.replace(/\D/g, "").slice(-4)}`
        : "XXXXXX";
    default: {
      const keep = Math.min(visibleEnd, raw.length);
      return `${"X".repeat(Math.max(0, raw.length - keep))}${raw.slice(raw.length - keep)}`;
    }
  }
}

/**
 * Displays a sensitive identifier masked, with optional reveal and copy.
 *
 * Use this anywhere an Aadhaar, PAN, account or card number is shown back to
 * the user. The unmasked value never renders until they ask for it, which keeps
 * it out of screenshots, screen shares and over-the-shoulder reads.
 */
export function MaskedValue({
  value,
  preset = "custom",
  visibleEnd = 4,
  revealable = true,
  copyable = false,
  label,
  className,
}: MaskedValueProps) {
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const masked = maskWith(value, preset, visibleEnd);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be blocked; the value is selectable when revealed.
    }
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {label && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
      )}

      <span className="font-mono text-sm tabular-nums">
        {revealed ? value : masked}
      </span>

      {/* The masked form is what's announced until the user opts in. */}
      <span className="sr-only">
        {revealed ? "Full value shown" : "Value is masked"}
      </span>

      {revealable && (
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-pressed={revealed}
          aria-label={revealed ? "Hide value" : "Reveal value"}
          className="rounded-md p-1 text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          {revealed ? (
            <EyeOff className="size-3.5" />
          ) : (
            <Eye className="size-3.5" />
          )}
        </button>
      )}

      {copyable && (
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy value"}
          className="rounded-md p-1 text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
