/**
 * Indian mobile number validation.
 *
 * Ten digits starting 6–9. Anything shorter is a landline, a short code, or a
 * typo. We accept and strip the prefixes people actually paste — `+91`, `0091`,
 * a leading `0`, spaces, dashes and brackets — because rejecting a correct
 * number over formatting is the rudest thing a form can do.
 */

const MOBILE_RE = /^[6-9]\d{9}$/;

export type MobileErrorCode =
  | "empty"
  | "not_digits"
  | "too_short"
  | "too_long"
  | "bad_leading_digit";

export interface MobileResult {
  valid: boolean;
  /** Ten digits, no country code. */
  normalized: string;
  /** `+919876543210` — what most SMS/OTP APIs want. */
  e164?: string;
  /** `98765 43210` — how Indians actually read a number out. */
  formatted?: string;
  error?: { code: MobileErrorCode; message: string };
}

function fail(
  code: MobileErrorCode,
  message: string,
  normalized: string,
): MobileResult {
  return { valid: false, normalized, error: { code, message } };
}

/** Strip country codes, trunk prefix and separators down to ten digits. */
export function normalizeMobile(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.startsWith("91") && digits.length > 10)
    digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length > 10) digits = digits.slice(1);
  return digits;
}

/** `9876543210` → `98765 43210`. */
export function formatMobile(input: string): string {
  const digits = normalizeMobile(input);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
}

export function validateMobile(input: string): MobileResult {
  const digits = normalizeMobile(input);

  if (!input.trim()) return fail("empty", "Enter a mobile number.", digits);
  if (/[^\d\s+\-()]/.test(input)) {
    return fail("not_digits", "A mobile number is digits only.", digits);
  }
  if (digits.length < 10) {
    return fail(
      "too_short",
      `Indian mobile numbers are 10 digits — ${digits.length} so far.`,
      digits,
    );
  }
  if (digits.length > 10) {
    return fail(
      "too_long",
      "That's more than 10 digits. Drop the country code.",
      digits,
    );
  }
  if (!MOBILE_RE.test(digits)) {
    return fail(
      "bad_leading_digit",
      "An Indian mobile number starts with 6, 7, 8 or 9.",
      digits,
    );
  }

  return {
    valid: true,
    normalized: digits,
    e164: `+91${digits}`,
    formatted: formatMobile(digits),
  };
}
