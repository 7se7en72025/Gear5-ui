/**
 * Corporate registration and compliance identifiers.
 *
 * All structural — none of these publish a check digit. IEC is the interesting
 * one: since 2021 the DGFT stopped issuing separate codes and an entity's IEC
 * simply *is* its PAN, so we reuse the PAN validator rather than duplicating it.
 */

import type { IdResult } from "./gov-ids";
import { type PanResult, validatePan } from "./pan";

function bad<E extends string>(
  code: E,
  message: string,
  normalized: string,
): IdResult<E> {
  return { valid: false, normalized, error: { code, message } };
}

const upper = (input: string) => input.replace(/[\s-]/g, "").toUpperCase();

/* ── DIN ─────────────────────────────────────────────────────────────────── */

export type DinErrorCode = "empty" | "not_digits" | "wrong_length";

/** Director Identification Number — 8 digits, one per person for life. */
export function validateDin(input: string): IdResult<DinErrorCode> {
  const din = input.replace(/\D/g, "");
  if (!input.trim()) return bad("empty", "Enter a DIN.", din);
  if (/[^\d\s-]/.test(input))
    return bad("not_digits", "A DIN is digits only.", din);
  if (din.length !== 8) {
    return bad(
      "wrong_length",
      `A DIN is 8 digits — ${din.length} so far.`,
      din,
    );
  }
  return { valid: true, normalized: din };
}

/* ── LLPIN ───────────────────────────────────────────────────────────────── */

const LLPIN_RE = /^[A-Z]{3}[0-9]{4}$/;

export type LlpinErrorCode = "empty" | "wrong_length" | "bad_shape";

/** LLP Identification Number — three letters then four digits, e.g. AAB-1234. */
export function validateLlpin(input: string): IdResult<LlpinErrorCode> {
  const id = upper(input);
  if (!input.trim()) return bad("empty", "Enter an LLPIN.", id);
  if (id.length !== 7) {
    return bad(
      "wrong_length",
      `An LLPIN is 7 characters — ${id.length} so far.`,
      id,
    );
  }
  if (!LLPIN_RE.test(id)) {
    return bad(
      "bad_shape",
      "An LLPIN looks like AAB-1234 — three letters, four digits.",
      id,
    );
  }
  return { valid: true, normalized: id };
}

/** Re-insert the hyphen LLPINs are printed with. */
export function formatLlpin(input: string): string {
  const id = upper(input).slice(0, 7);
  return id.length > 3 ? `${id.slice(0, 3)}-${id.slice(3)}` : id;
}

/* ── FCRA ────────────────────────────────────────────────────────────────── */

export type FcraErrorCode = "empty" | "not_digits" | "wrong_length";

/**
 * FCRA registration — 9 digits. Required of any NGO receiving foreign
 * contributions, and checked constantly in donation flows.
 */
export function validateFcra(input: string): IdResult<FcraErrorCode> {
  const id = input.replace(/\D/g, "");
  if (!input.trim())
    return bad("empty", "Enter an FCRA registration number.", id);
  if (/[^\d\s-]/.test(input))
    return bad("not_digits", "An FCRA number is digits only.", id);
  if (id.length !== 9) {
    return bad(
      "wrong_length",
      `An FCRA number is 9 digits — ${id.length} so far.`,
      id,
    );
  }
  return { valid: true, normalized: id };
}

/* ── IEC ─────────────────────────────────────────────────────────────────── */

export type IecErrorCode =
  | "empty"
  | "wrong_length"
  | "bad_shape"
  | "bad_holder_type";

/**
 * Import Export Code. Since 2021 the DGFT issues no separate code — an
 * entity's IEC is its PAN. So this is the PAN validator with IEC wording,
 * which is exactly the sort of thing a hand-rolled regex gets wrong by
 * still expecting the old 10-digit numeric format.
 */
export function validateIec(input: string): PanResult {
  const result = validatePan(input);
  if (result.valid || !result.error) return result;

  return {
    ...result,
    error: {
      code: result.error.code,
      message: result.error.message.replace(/\bPAN\b/g, "IEC"),
    },
  };
}

/* ── RERA ────────────────────────────────────────────────────────────────── */

export type ReraErrorCode = "empty" | "too_short" | "too_long" | "bad_shape";

/**
 * RERA registration numbers are issued per state authority and share no
 * national format — Maharashtra's differ from Karnataka's in both length and
 * alphabet. We accept 8–30 alphanumerics (slashes and hyphens stripped) and
 * don't pretend to more precision than exists.
 */
export function validateRera(input: string): IdResult<ReraErrorCode> {
  const id = input.replace(/[\s\-/]/g, "").toUpperCase();
  if (!input.trim())
    return bad("empty", "Enter a RERA registration number.", id);
  if (!/^[0-9A-Z]+$/.test(id)) {
    return bad("bad_shape", "A RERA number is letters and digits only.", id);
  }
  if (id.length < 8)
    return bad("too_short", "That looks too short for a RERA number.", id);
  if (id.length > 30)
    return bad("too_long", "That looks too long for a RERA number.", id);
  return { valid: true, normalized: id };
}

/* ── TIN (legacy VAT / CST) ──────────────────────────────────────────────── */

export type TinErrorCode =
  | "empty"
  | "not_digits"
  | "wrong_length"
  | "unknown_state";

export interface TinResult extends IdResult<TinErrorCode> {
  stateCode?: string;
}

/**
 * Taxpayer Identification Number — 11 digits, first two being the state code.
 * Superseded by GSTIN in 2017, but still turns up on historical invoices and
 * in ledger migrations, which is the only reason to support it.
 */
export function validateTin(input: string): TinResult {
  const tin = input.replace(/\D/g, "");
  if (!input.trim()) return bad("empty", "Enter a TIN.", tin);
  if (/[^\d\s-]/.test(input))
    return bad("not_digits", "A TIN is digits only.", tin);
  if (tin.length !== 11) {
    return bad(
      "wrong_length",
      `A TIN is 11 digits — ${tin.length} so far.`,
      tin,
    );
  }

  const stateCode = tin.slice(0, 2);
  if (Number(stateCode) < 1 || Number(stateCode) > 38) {
    return bad(
      "unknown_state",
      `“${stateCode}” isn't a valid state code.`,
      tin,
    );
  }
  return { valid: true, normalized: tin, stateCode };
}
