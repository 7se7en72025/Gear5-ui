/**
 * Aadhaar number validation.
 *
 * ⚠️ Handling Aadhaar carries legal obligations under the Aadhaar Act and the
 * DPDP Act. Do not log it, do not store it unmasked, and prefer a Virtual ID
 * or offline KYC where you can. This module deliberately provides `maskAadhaar`
 * so the full number never has to reach your UI logs or analytics.
 *
 * A valid Aadhaar is 12 digits, does not begin with 0 or 1, and ends in a
 * Verhoeff check digit. Passing these checks proves the number is *well-formed*,
 * not that it was ever issued to anyone — only a UIDAI API can tell you that.
 */

/** Verhoeff multiplication table (dihedral group D5). */
const D: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

/** Verhoeff permutation table. */
const P: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * True when `digits` (digits only) carries a valid Verhoeff check digit as its
 * last character. Exported because GSTIN and other schemes reuse the idea.
 */
export function verhoeffValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let c = 0;
  const reversed = digits.split("").reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = D[c][P[i % 8][Number(reversed[i])]];
  }
  return c === 0;
}

/** The check digit that would make `digits` (without one) valid. */
export function verhoeffCheckDigit(digits: string): number {
  const INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
  let c = 0;
  const reversed = `${digits}0`.split("").reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = D[c][P[i % 8][Number(reversed[i])]];
  }
  return INV[c];
}

export type AadhaarErrorCode =
  | "empty"
  | "not_digits"
  | "too_short"
  | "too_long"
  | "bad_leading_digit"
  | "bad_checksum";

export interface AadhaarResult {
  valid: boolean;
  /** Digits only, separators stripped. */
  normalized: string;
  /** `XXXX XXXX 1234` — safe to render and to log. */
  masked?: string;
  error?: { code: AadhaarErrorCode; message: string };
}

function fail(
  code: AadhaarErrorCode,
  message: string,
  normalized: string,
): AadhaarResult {
  return { valid: false, normalized, error: { code, message } };
}

/** Strip everything but digits. Accepts `1234 5678 9012` and `1234-5678-9012`. */
export function normalizeAadhaar(input: string): string {
  return input.replace(/\D/g, "");
}

/** Group as `1234 5678 9012` for display. */
export function formatAadhaar(input: string): string {
  return (normalizeAadhaar(input).match(/.{1,4}/g) ?? []).join(" ");
}

/** Mask all but the last four digits. Use this anywhere the value is displayed. */
export function maskAadhaar(input: string): string {
  const digits = normalizeAadhaar(input);
  if (digits.length !== 12) return digits.replace(/\d/g, "X");
  return `XXXX XXXX ${digits.slice(8)}`;
}

export function validateAadhaar(input: string): AadhaarResult {
  const digits = normalizeAadhaar(input);

  if (!input.trim()) return fail("empty", "Enter an Aadhaar number.", digits);
  if (/\D/.test(input.replace(/[\s-]/g, ""))) {
    return fail("not_digits", "An Aadhaar number is digits only.", digits);
  }
  if (digits.length < 12) {
    return fail(
      "too_short",
      `Aadhaar is 12 digits — ${digits.length} so far.`,
      digits,
    );
  }
  if (digits.length > 12) {
    return fail("too_long", "An Aadhaar number is exactly 12 digits.", digits);
  }
  // UIDAI never issues numbers starting 0 or 1, which keeps them distinct from
  // other 12-digit identifiers.
  if (digits[0] === "0" || digits[0] === "1") {
    return fail(
      "bad_leading_digit",
      "An Aadhaar number can't start with 0 or 1.",
      digits,
    );
  }
  if (!verhoeffValid(digits)) {
    return fail(
      "bad_checksum",
      "That number failed its checksum — check for a typo.",
      digits,
    );
  }

  return { valid: true, normalized: digits, masked: maskAadhaar(digits) };
}
