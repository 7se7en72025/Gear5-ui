/**
 * Payment and document reference numbers — the values a user reads off a
 * statement, an invoice or a mandate when support asks for them.
 *
 * All structural. None of these publish a check digit, including the e-way
 * bill number, which is sometimes claimed to have one.
 */

import type { IdResult } from "./gov-ids";

function bad<E extends string>(
  code: E,
  message: string,
  normalized: string,
): IdResult<E> {
  return { valid: false, normalized, error: { code, message } };
}

const upper = (input: string) => input.replace(/[\s-]/g, "").toUpperCase();

function fixedDigits<E extends string>(
  input: string,
  length: number,
  label: string,
  codes: { empty: E; notDigits: E; wrongLength: E },
): IdResult<E> {
  const value = input.replace(/\D/g, "");
  const Label = `${label[0].toUpperCase()}${label.slice(1)}`;
  if (!input.trim()) return bad(codes.empty, `Enter ${label}.`, value);
  if (/[^\d\s-]/.test(input))
    return bad(codes.notDigits, `${Label} is digits only.`, value);
  if (value.length !== length) {
    return bad(
      codes.wrongLength,
      `${Label} is ${length} digits — ${value.length} so far.`,
      value,
    );
  }
  return { valid: true, normalized: value };
}

/* ── UMRN (NACH mandate) ─────────────────────────────────────────────────── */

export type UmrnErrorCode = "empty" | "wrong_length" | "bad_shape";

/**
 * Unique Mandate Reference Number — 20 characters identifying an e-NACH
 * mandate. Every lending and subscription product in India ends up showing
 * this back to the user when they ask to cancel an auto-debit.
 */
export function validateUmrn(input: string): IdResult<UmrnErrorCode> {
  const id = upper(input);
  if (!input.trim()) return bad("empty", "Enter a UMRN.", id);
  if (id.length !== 20) {
    return bad(
      "wrong_length",
      `A UMRN is 20 characters — ${id.length} so far.`,
      id,
    );
  }
  if (!/^[0-9A-Z]{20}$/.test(id)) {
    return bad("bad_shape", "A UMRN is letters and digits only.", id);
  }
  return { valid: true, normalized: id };
}

/* ── Cheque number ───────────────────────────────────────────────────────── */

export type ChequeErrorCode = "empty" | "not_digits" | "wrong_length";

/** The six digits at the bottom-left of a cheque leaf. */
export function validateChequeNumber(input: string): IdResult<ChequeErrorCode> {
  return fixedDigits<ChequeErrorCode>(input, 6, "a cheque number", {
    empty: "empty",
    notDigits: "not_digits",
    wrongLength: "wrong_length",
  });
}

/* ── E-way bill ──────────────────────────────────────────────────────────── */

export type EWayBillErrorCode = "empty" | "not_digits" | "wrong_length";

/**
 * E-way bill number — 12 digits. Widely rumoured to carry a check digit; the
 * GSTN has never published one, so we don't invent it.
 */
export function validateEWayBill(input: string): IdResult<EWayBillErrorCode> {
  return fixedDigits<EWayBillErrorCode>(input, 12, "an e-way bill number", {
    empty: "empty",
    notDigits: "not_digits",
    wrongLength: "wrong_length",
  });
}

/* ── ARN (GST application reference) ─────────────────────────────────────── */

const ARN_RE = /^[A-Z]{2}[0-9]{10}[A-Z]$/;

export type ArnErrorCode = "empty" | "wrong_length" | "bad_shape";

/** GST Application Reference Number — what a pending registration is tracked by. */
export function validateArn(input: string): IdResult<ArnErrorCode> {
  const arn = upper(input);
  if (!input.trim()) return bad("empty", "Enter an ARN.", arn);
  if (arn.length !== 13) {
    return bad(
      "wrong_length",
      `An ARN is 13 characters — ${arn.length} so far.`,
      arn,
    );
  }
  if (!ARN_RE.test(arn)) {
    return bad("bad_shape", "An ARN looks like AA0701190003081.", arn);
  }
  return { valid: true, normalized: arn };
}

/* ── RRN (card transaction) ──────────────────────────────────────────────── */

export type RrnErrorCode = "empty" | "not_digits" | "wrong_length";

/**
 * Retrieval Reference Number — 12 digits, the reference a bank asks for when
 * disputing a card transaction.
 */
export function validateRrn(input: string): IdResult<RrnErrorCode> {
  return fixedDigits<RrnErrorCode>(input, 12, "an RRN", {
    empty: "empty",
    notDigits: "not_digits",
    wrongLength: "wrong_length",
  });
}

/* ── IRN (e-invoice) ─────────────────────────────────────────────────────── */

export type IrnErrorCode = "empty" | "wrong_length" | "bad_shape";

/**
 * Invoice Reference Number — the SHA-256 the Invoice Registration Portal
 * returns, so it's 64 lowercase hex characters. Not a number, despite the name.
 */
export function validateIrn(input: string): IdResult<IrnErrorCode> {
  const irn = input.replace(/\s/g, "").toLowerCase();
  if (!input.trim()) return bad("empty", "Enter an IRN.", irn);
  if (irn.length !== 64) {
    return bad(
      "wrong_length",
      `An IRN is a 64-character hash — ${irn.length} so far.`,
      irn,
    );
  }
  if (!/^[0-9a-f]{64}$/.test(irn)) {
    return bad(
      "bad_shape",
      "An IRN is a SHA-256 hash — hex characters only.",
      irn,
    );
  }
  return { valid: true, normalized: irn };
}

/* ── LPG consumer ID ─────────────────────────────────────────────────────── */

export type LpgErrorCode = "empty" | "not_digits" | "too_short" | "too_long";

/**
 * LPG consumer ID, used for subsidy and address-proof flows. Length differs
 * between Indane, HP and Bharat Gas, so we accept a range rather than pinning
 * one distributor's format.
 */
export function validateLpgConsumerId(input: string): IdResult<LpgErrorCode> {
  const id = input.replace(/\D/g, "");
  if (!input.trim()) return bad("empty", "Enter an LPG consumer ID.", id);
  if (/[^\d\s-]/.test(input))
    return bad("not_digits", "An LPG consumer ID is digits only.", id);
  if (id.length < 9)
    return bad(
      "too_short",
      `That's too short — ${id.length} digits so far.`,
      id,
    );
  if (id.length > 17)
    return bad("too_long", "An LPG consumer ID is at most 17 digits.", id);
  return { valid: true, normalized: id };
}
