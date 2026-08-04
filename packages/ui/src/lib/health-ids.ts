/**
 * Health, pension and welfare identifiers.
 *
 * None of these publish a check-digit algorithm. ABHA is 14 digits and looks
 * Aadhaar-like, and it is tempting to assume Verhoeff — but NHA has not
 * published that, so asserting it would risk rejecting real numbers. All
 * structural.
 *
 * ⚠️ ABHA and ESIC numbers are health data. Under the DPDP Act that is
 * sensitive personal data — mask on display and never log it.
 */

import type { IdResult } from "./gov-ids";

function bad<E extends string>(
  code: E,
  message: string,
  normalized: string,
): IdResult<E> {
  return { valid: false, normalized, error: { code, message } };
}

const digitsOnly = (input: string) => input.replace(/\D/g, "");

function fixedDigits<E extends string>(
  input: string,
  length: number,
  label: string,
  codes: { empty: E; notDigits: E; wrongLength: E },
): IdResult<E> {
  const value = digitsOnly(input);
  if (!input.trim()) return bad(codes.empty, `Enter ${label}.`, value);
  if (/[^\d\s-]/.test(input)) {
    return bad(
      codes.notDigits,
      `${label[0].toUpperCase()}${label.slice(1)} is digits only.`,
      value,
    );
  }
  if (value.length !== length) {
    return bad(
      codes.wrongLength,
      `${label[0].toUpperCase()}${label.slice(1)} is ${length} digits — ${value.length} so far.`,
      value,
    );
  }
  return { valid: true, normalized: value };
}

/* ── ABHA (Ayushman Bharat Health Account) ───────────────────────────────── */

export type AbhaErrorCode =
  | "empty"
  | "not_digits"
  | "wrong_length"
  | "bad_prefix";

/** 14 digits, conventionally displayed as 91-1234-5678-9012. */
export function validateAbha(input: string): IdResult<AbhaErrorCode> {
  const result = fixedDigits<AbhaErrorCode>(input, 14, "an ABHA number", {
    empty: "empty",
    notDigits: "not_digits",
    wrongLength: "wrong_length",
  });
  if (!result.valid) return result;
  // Issued ABHA numbers begin 91 — a cheap guard against a mistyped Aadhaar.
  if (!result.normalized.startsWith("91")) {
    return bad(
      "bad_prefix",
      "An ABHA number starts with 91.",
      result.normalized,
    );
  }
  return result;
}

/** Group as 91-1234-5678-9012 for display. */
export function formatAbha(input: string): string {
  const d = digitsOnly(input).slice(0, 14);
  const parts = [d.slice(0, 2), d.slice(2, 6), d.slice(6, 10), d.slice(10)];
  return parts.filter(Boolean).join("-");
}

/* ── UAN (EPFO) ──────────────────────────────────────────────────────────── */

export type UanErrorCode = "empty" | "not_digits" | "wrong_length";

/** Universal Account Number — 12 digits, follows a member across employers. */
export function validateUan(input: string): IdResult<UanErrorCode> {
  return fixedDigits<UanErrorCode>(input, 12, "a UAN", {
    empty: "empty",
    notDigits: "not_digits",
    wrongLength: "wrong_length",
  });
}

/* ── ESIC ────────────────────────────────────────────────────────────────── */

export type EsicErrorCode = "empty" | "not_digits" | "wrong_length";

/** Employees' State Insurance number — 17 digits. */
export function validateEsic(input: string): IdResult<EsicErrorCode> {
  return fixedDigits<EsicErrorCode>(input, 17, "an ESIC number", {
    empty: "empty",
    notDigits: "not_digits",
    wrongLength: "wrong_length",
  });
}

/* ── PRAN (NPS) ──────────────────────────────────────────────────────────── */

export type PranErrorCode = "empty" | "not_digits" | "wrong_length";

/** Permanent Retirement Account Number — 12 digits. */
export function validatePran(input: string): IdResult<PranErrorCode> {
  return fixedDigits<PranErrorCode>(input, 12, "a PRAN", {
    empty: "empty",
    notDigits: "not_digits",
    wrongLength: "wrong_length",
  });
}

/* ── Ration card ─────────────────────────────────────────────────────────── */

export type RationCardErrorCode =
  | "empty"
  | "too_short"
  | "too_long"
  | "bad_shape";

/**
 * Ration card numbers are issued per state and share no national format —
 * lengths and alphabets genuinely differ. We accept 8–16 alphanumerics and
 * deliberately do not pretend to know more than that.
 */
export function validateRationCard(
  input: string,
): IdResult<RationCardErrorCode> {
  const id = input.replace(/[\s-]/g, "").toUpperCase();
  if (!input.trim()) return bad("empty", "Enter a ration card number.", id);
  if (!/^[0-9A-Z]+$/.test(id)) {
    return bad(
      "bad_shape",
      "A ration card number is letters and digits only.",
      id,
    );
  }
  if (id.length < 8)
    return bad(
      "too_short",
      "That looks too short for a ration card number.",
      id,
    );
  if (id.length > 16)
    return bad("too_long", "That looks too long for a ration card number.", id);
  return { valid: true, normalized: id };
}
