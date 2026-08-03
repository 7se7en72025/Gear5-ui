"use client";

import { amountToNumber, formatINR } from "../../lib/amount";
import { amountToWords } from "../../lib/words";
import { cn } from "./field";

export interface AmountInWordsProps {
  /** A number, or the raw string from an `AmountInput`. */
  value: number | string;
  /** Leading word. Set to `""` to drop it. Default `"Rupees"`. */
  prefix?: string;
  /** Trailing word, as required on cheques. Default `"Only"`. */
  suffix?: string;
  /** Also render the numeric form above the words. */
  showNumeric?: boolean;
  className?: string;
}

/**
 * The amount spelled out in Indian English — lakh and crore, not million.
 * Required on cheques, invoices and loan agreements.
 */
export function AmountInWords({
  value,
  prefix = "Rupees",
  suffix = "Only",
  showNumeric = false,
  className,
}: AmountInWordsProps) {
  const numeric = typeof value === "number" ? value : amountToNumber(value);

  if (numeric === null || !Number.isFinite(numeric)) {
    return null;
  }

  return (
    <div className={cn("space-y-1", className)}>
      {showNumeric && (
        <p className="font-mono text-sm tabular-nums">{formatINR(numeric)}</p>
      )}
      {/* aria-live so the words update audibly as the amount is typed. */}
      <p
        aria-live="polite"
        className="text-sm capitalize leading-relaxed text-neutral-600 dark:text-neutral-400"
      >
        {amountToWords(numeric, { prefix, suffix })}
      </p>
    </div>
  );
}
