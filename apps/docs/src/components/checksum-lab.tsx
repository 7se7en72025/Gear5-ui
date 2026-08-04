"use client";

import { Check, Shuffle, X } from "lucide-react";
import * as React from "react";
import {
  gstinCheckChar,
  luhnValid,
  validateAadhaar,
  validateCardNumber,
  validateGstin,
  verhoeffValid,
} from "bharat-ui";

import { cn } from "@/lib/utils";

interface Scheme {
  id: string;
  label: string;
  algorithm: string;
  seed: string;
  /** Which characters may be corrupted (digits only, for most). */
  mutable: (char: string, index: number) => boolean;
  check: (value: string) => boolean;
  explain: (value: string) => string;
}

const SCHEMES: Scheme[] = [
  {
    id: "aadhaar",
    label: "Aadhaar",
    algorithm: "Verhoeff (dihedral group D₅)",
    seed: "234567890124",
    mutable: (c) => /\d/.test(c),
    check: (v) => verhoeffValid(v),
    explain: (v) =>
      validateAadhaar(v).valid
        ? "Check digit agrees. Structurally a well-formed Aadhaar."
        : "Fails the Verhoeff check — a single-digit typo or a transposition.",
  },
  {
    id: "gstin",
    label: "GSTIN",
    algorithm: "Weighted mod-36",
    seed: "27AAPFU0939F1ZV",
    mutable: (_c, i) => i < 14,
    check: (v) => v.length === 15 && gstinCheckChar(v.slice(0, 14)) === v[14],
    explain: (v) => {
      const expected = v.length >= 14 ? gstinCheckChar(v.slice(0, 14)) : null;
      return validateGstin(v).valid
        ? "Checksum agrees, and the embedded PAN is itself valid."
        : `Check character should be “${expected ?? "?"}” for these first 14.`;
    },
  },
  {
    id: "card",
    label: "RuPay card",
    algorithm: "Luhn (mod 10)",
    seed: "6521111111111110",
    mutable: (c) => /\d/.test(c),
    check: (v) => luhnValid(v),
    explain: (v) =>
      validateCardNumber(v).valid
        ? "Passes Luhn, and the BIN resolves to RuPay."
        : "Fails Luhn — the digit sum isn't a multiple of 10.",
  },
];

function SchemeRow({ scheme }: { scheme: Scheme }) {
  const [value, setValue] = React.useState(scheme.seed);
  const valid = scheme.check(value);
  const dirty = value !== scheme.seed;

  /** Bump one mutable character, so the checksum breaks in a realistic way. */
  function corrupt() {
    const indices = value
      .split("")
      .map((char, index) => (scheme.mutable(char, index) ? index : -1))
      .filter((index) => index >= 0);

    const target = indices[Math.floor(Math.random() * indices.length)];
    const char = value[target];
    const next = /\d/.test(char)
      ? String((Number(char) + 1) % 10)
      : String.fromCharCode(((char.charCodeAt(0) - 65 + 1) % 26) + 65);

    setValue(value.slice(0, target) + next + value.slice(target + 1));
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{scheme.label}</h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {scheme.algorithm}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            valid
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400",
          )}
        >
          {valid ? <Check className="size-3" /> : <X className="size-3" />}
          {valid ? "passes" : "fails"}
        </span>
      </div>

      {/* Per-character view so a corrupted position is visible at a glance. */}
      <div className="mb-3 flex flex-wrap gap-0.5" aria-hidden>
        {value.split("").map((char, index) => (
          <span
            key={`${scheme.id}-${index}`}
            className={cn(
              "flex size-6 items-center justify-center rounded font-mono text-xs",
              char !== scheme.seed[index]
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : "bg-surface-2 text-foreground",
            )}
          >
            {char}
          </span>
        ))}
      </div>
      <span className="sr-only">
        {scheme.label}: {value}. Checksum {valid ? "passes" : "fails"}.
      </span>

      <p aria-live="polite" className="mb-3 min-h-[2.5rem] text-xs leading-relaxed text-muted">
        {scheme.explain(value)}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={corrupt}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs transition hover:border-accent hover:text-accent"
        >
          <Shuffle className="size-3" />
          Change a digit
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => setValue(scheme.seed)}
            className="rounded-lg px-2.5 py-1.5 text-xs text-faint transition hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Three real checksums, running in the browser. The point is that these aren't
 * regexes pretending to be validation — change one digit and they genuinely
 * catch it.
 */
export function ChecksumLab() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {SCHEMES.map((scheme) => (
        <SchemeRow key={scheme.id} scheme={scheme} />
      ))}
    </div>
  );
}
