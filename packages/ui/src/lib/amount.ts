/**
 * Indian number formatting.
 *
 * The Indian numbering system groups the last three digits, then every two
 * after that — 12,34,567 where most locales would write 1,234,567. Getting this
 * wrong is the single most common localisation bug in Indian products, and
 * `Intl.NumberFormat("en-IN")` gets it right, so we lean on it rather than
 * hand-rolling the grouping.
 */

export interface AmountParts {
  /** Digits only, no separators. Empty string when there's no integer part. */
  integer: string;
  /** Up to two digits, no leading dot. Empty when no decimal was typed. */
  fraction: string;
  /** True when the user has typed the decimal point but no digits yet. */
  trailingPoint: boolean;
}

/**
 * Split raw user input into parts. Tolerant by design: strips currency symbols,
 * spaces and existing separators so pasting "₹ 1,23,456.50" works.
 */
export function parseAmountInput(raw: string): AmountParts {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");

  if (firstDot === -1) {
    return { integer: cleaned, fraction: "", trailingPoint: false };
  }

  const integer = cleaned.slice(0, firstDot);
  // Ignore any further dots the user typed, and cap paise at two digits.
  const fraction = cleaned
    .slice(firstDot + 1)
    .replace(/\./g, "")
    .slice(0, 2);

  return { integer, fraction, trailingPoint: fraction.length === 0 };
}

/** Group an integer digit-string the Indian way. `"1234567"` → `"12,34,567"`. */
export function groupIndian(digits: string): string {
  const normalised = digits.replace(/^0+(?=\d)/, "");
  if (normalised.length <= 3) return normalised;
  return new Intl.NumberFormat("en-IN").format(BigInt(normalised));
}

/**
 * Format raw input for display, preserving what the user is mid-way through
 * typing (a trailing `.`, a single paise digit) instead of snapping to 2dp.
 */
export function formatAmountInput(raw: string): string {
  const { integer, fraction, trailingPoint } = parseAmountInput(raw);
  if (!integer && !fraction && !trailingPoint) return "";

  const grouped = groupIndian(integer || "0");
  if (trailingPoint) return `${grouped}.`;
  if (fraction) return `${grouped}.${fraction}`;
  return grouped;
}

/** Numeric value of raw input, or `null` if there's nothing usable. */
export function amountToNumber(raw: string): number | null {
  const { integer, fraction } = parseAmountInput(raw);
  if (!integer && !fraction) return null;
  const value = Number(`${integer || "0"}.${fraction || "0"}`);
  return Number.isFinite(value) ? value : null;
}

/** Whole paise, avoiding float drift. Use this when talking to a payments API. */
export function amountToPaise(raw: string): number | null {
  const { integer, fraction } = parseAmountInput(raw);
  if (!integer && !fraction) return null;
  const paise = `${fraction}00`.slice(0, 2);
  return Number(integer || "0") * 100 + Number(paise);
}

/** `123456.5` → `"₹1,23,456.50"`. */
export function formatINR(
  value: number,
  options: { paise?: boolean } = {},
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: options.paise === false ? 0 : 2,
    maximumFractionDigits: options.paise === false ? 0 : 2,
  }).format(value);
}

/**
 * Render an amount the way Indian finance writes it in prose — "₹1.2 L",
 * "₹3.5 Cr". Useful for summaries; never for an editable field.
 */
export function formatIndianShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, "");

  if (abs >= 1_00_00_000) return `${sign}₹${trim(abs / 1_00_00_000)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${trim(abs / 1_00_000)} L`;
  if (abs >= 1_000) return `${sign}₹${trim(abs / 1_000)} K`;
  return `${sign}₹${trim(abs)}`;
}

export type AmountErrorCode =
  | "empty"
  | "not_a_number"
  | "below_min"
  | "above_max";

export interface AmountResult {
  valid: boolean;
  value: number | null;
  paise: number | null;
  formatted: string;
  error?: { code: AmountErrorCode; message: string };
}

export function validateAmount(
  raw: string,
  bounds: { min?: number; max?: number } = {},
): AmountResult {
  const value = amountToNumber(raw);
  const paise = amountToPaise(raw);
  const formatted = formatAmountInput(raw);
  const base = { value, paise, formatted };

  if (!raw.trim()) {
    return {
      ...base,
      valid: false,
      error: { code: "empty", message: "Enter an amount." },
    };
  }
  if (value === null) {
    return {
      ...base,
      valid: false,
      error: { code: "not_a_number", message: "That isn't a valid amount." },
    };
  }
  if (bounds.min !== undefined && value < bounds.min) {
    return {
      ...base,
      valid: false,
      error: {
        code: "below_min",
        message: `Enter at least ${formatINR(bounds.min, { paise: false })}.`,
      },
    };
  }
  if (bounds.max !== undefined && value > bounds.max) {
    return {
      ...base,
      valid: false,
      error: {
        code: "above_max",
        message: `Enter no more than ${formatINR(bounds.max, { paise: false })}.`,
      },
    };
  }

  return { ...base, valid: true };
}
