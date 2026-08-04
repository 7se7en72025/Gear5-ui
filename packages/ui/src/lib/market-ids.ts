/**
 * Capital-markets and banking identifiers.
 *
 * Two of these carry genuinely public checksums, which is rare for Indian
 * forms and worth using:
 *   - LEI  — ISO 17442, checked with ISO 7064 MOD 97-10.
 *   - ISIN — ISO 6166, a Luhn variant over letter-expanded digits.
 *
 * The rest (MICR, DEMAT, CKYC, UTR, SWIFT) have no check digit, so they are
 * validated structurally only.
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

/** A=10 … Z=35, digits unchanged. Shared by the LEI and ISIN algorithms. */
function expandAlphanumerics(value: string): string {
  let out = "";
  for (const char of value) {
    if (char >= "0" && char <= "9") out += char;
    else out += String(char.charCodeAt(0) - 55);
  }
  return out;
}

/** ISO 7064 MOD 97-10 over an arbitrarily long digit string. */
function mod97(digits: string): number {
  let remainder = 0;
  for (const digit of digits) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder;
}

/* ── LEI ─────────────────────────────────────────────────────────────────── */

const LEI_RE = /^[0-9A-Z]{18}[0-9]{2}$/;

export type LeiErrorCode =
  | "empty"
  | "wrong_length"
  | "bad_shape"
  | "bad_checksum";

/**
 * Legal Entity Identifier — 20 characters, the last two being an ISO 7064
 * MOD 97-10 check. Required for anyone trading derivatives or doing large
 * cross-border transfers, and increasingly asked for in Indian KYB flows.
 */
export function validateLei(input: string): IdResult<LeiErrorCode> {
  const lei = upper(input);
  if (!input.trim()) return bad("empty", "Enter an LEI.", lei);
  if (lei.length !== 20) {
    return bad(
      "wrong_length",
      `An LEI is 20 characters — ${lei.length} so far.`,
      lei,
    );
  }
  if (!LEI_RE.test(lei)) {
    return bad(
      "bad_shape",
      "An LEI is 18 alphanumerics then two check digits.",
      lei,
    );
  }
  if (mod97(expandAlphanumerics(lei)) !== 1) {
    return bad(
      "bad_checksum",
      "That LEI failed its checksum — check for a typo.",
      lei,
    );
  }
  return { valid: true, normalized: lei };
}

/* ── ISIN ────────────────────────────────────────────────────────────────── */

const ISIN_RE = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;

export type IsinErrorCode =
  | "empty"
  | "wrong_length"
  | "bad_shape"
  | "bad_checksum";

export interface IsinResult extends IdResult<IsinErrorCode> {
  /** Two-letter ISO country code — `IN` for Indian securities. */
  country?: string;
  /** True when this is an Indian security. */
  indian?: boolean;
}

/** Luhn over the letter-expanded body, as ISO 6166 specifies. */
export function isinCheckDigit(first11: string): number | null {
  if (first11.length !== 11) return null;
  const digits = expandAlphanumerics(first11);

  let sum = 0;
  let double = true; // ISO 6166 doubles starting from the rightmost body digit
  for (let i = digits.length - 1; i >= 0; i--) {
    let value = Number(digits[i]);
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * International Securities Identification Number. Indian equities and mutual
 * funds all carry one (`INE...`, `INF...`), so any broking or wealth product
 * ends up validating these.
 */
export function validateIsin(input: string): IsinResult {
  const isin = upper(input);
  if (!input.trim()) return bad("empty", "Enter an ISIN.", isin);
  if (isin.length !== 12) {
    return bad(
      "wrong_length",
      `An ISIN is 12 characters — ${isin.length} so far.`,
      isin,
    );
  }
  if (!ISIN_RE.test(isin)) {
    return bad("bad_shape", "An ISIN looks like INE002A01018.", isin);
  }

  const expected = isinCheckDigit(isin.slice(0, 11));
  if (expected === null || expected !== Number(isin[11])) {
    return bad("bad_checksum", "That ISIN failed its check digit.", isin);
  }

  const country = isin.slice(0, 2);
  return { valid: true, normalized: isin, country, indian: country === "IN" };
}

/* ── MICR ────────────────────────────────────────────────────────────────── */

export type MicrErrorCode = "empty" | "not_digits" | "wrong_length";

export interface MicrResult extends IdResult<MicrErrorCode> {
  cityCode?: string;
  bankCode?: string;
  branchCode?: string;
}

/**
 * The nine digits along the bottom of a cheque: city, bank, branch. No check
 * digit — the magnetic ink is the integrity mechanism, not the number.
 */
export function validateMicr(input: string): MicrResult {
  const micr = input.replace(/\D/g, "");
  if (!input.trim()) return bad("empty", "Enter a MICR code.", micr);
  if (/[^\d\s-]/.test(input))
    return bad("not_digits", "A MICR code is digits only.", micr);
  if (micr.length !== 9) {
    return bad(
      "wrong_length",
      `A MICR code is 9 digits — ${micr.length} so far.`,
      micr,
    );
  }
  return {
    valid: true,
    normalized: micr,
    cityCode: micr.slice(0, 3),
    bankCode: micr.slice(3, 6),
    branchCode: micr.slice(6),
  };
}

/* ── Demat account ───────────────────────────────────────────────────────── */

export type DematErrorCode = "empty" | "wrong_length" | "bad_shape";

export interface DematResult extends IdResult<DematErrorCode> {
  /** NSDL accounts start `IN`; CDSL accounts are 16 digits. */
  depository?: "NSDL" | "CDSL";
}

export function validateDemat(input: string): DematResult {
  const id = upper(input);
  if (!input.trim()) return bad("empty", "Enter a demat account number.", id);
  if (id.length !== 16) {
    return bad(
      "wrong_length",
      `A demat account is 16 characters — ${id.length} so far.`,
      id,
    );
  }
  if (/^IN\d{14}$/.test(id)) {
    return { valid: true, normalized: id, depository: "NSDL" };
  }
  if (/^\d{16}$/.test(id)) {
    return { valid: true, normalized: id, depository: "CDSL" };
  }
  return bad(
    "bad_shape",
    "NSDL accounts start with IN; CDSL accounts are 16 digits.",
    id,
  );
}

/* ── SWIFT / BIC ─────────────────────────────────────────────────────────── */

const SWIFT_RE = /^[A-Z]{4}[A-Z]{2}[0-9A-Z]{2}([0-9A-Z]{3})?$/;

export type SwiftErrorCode = "empty" | "wrong_length" | "bad_shape";

export interface SwiftResult extends IdResult<SwiftErrorCode> {
  bankCode?: string;
  countryCode?: string;
  branch?: string;
}

/** 8 or 11 characters. 11 means a specific branch; 8 means head office. */
export function validateSwift(input: string): SwiftResult {
  const code = upper(input);
  if (!input.trim()) return bad("empty", "Enter a SWIFT/BIC code.", code);
  if (code.length !== 8 && code.length !== 11) {
    return bad("wrong_length", "A SWIFT code is 8 or 11 characters.", code);
  }
  if (!SWIFT_RE.test(code)) {
    return bad(
      "bad_shape",
      "A SWIFT code looks like HDFCINBB or HDFCINBBXXX.",
      code,
    );
  }
  return {
    valid: true,
    normalized: code,
    bankCode: code.slice(0, 4),
    countryCode: code.slice(4, 6),
    branch: code.length === 11 ? code.slice(8) : undefined,
  };
}

/* ── CKYC ────────────────────────────────────────────────────────────────── */

export type CkycErrorCode = "empty" | "not_digits" | "wrong_length";

/** Central KYC Registry number — 14 digits, no public check digit. */
export function validateCkyc(input: string): IdResult<CkycErrorCode> {
  const id = input.replace(/\D/g, "");
  if (!input.trim()) return bad("empty", "Enter a CKYC number.", id);
  if (/[^\d\s-]/.test(input))
    return bad("not_digits", "A CKYC number is digits only.", id);
  if (id.length !== 14) {
    return bad(
      "wrong_length",
      `A CKYC number is 14 digits — ${id.length} so far.`,
      id,
    );
  }
  return { valid: true, normalized: id };
}

/* ── UTR ─────────────────────────────────────────────────────────────────── */

export type UtrErrorCode = "empty" | "bad_shape" | "bad_length";

export interface UtrResult extends IdResult<UtrErrorCode> {
  /** Inferred from length — a hint for support flows, not a guarantee. */
  rail?: "UPI" | "IMPS" | "NEFT / RTGS";
}

/**
 * Unique Transaction Reference — what a user reads off their statement when
 * payment support asks "what's the UTR?". Length varies by rail, so we infer
 * rather than enforce.
 */
export function validateUtr(input: string): UtrResult {
  const utr = upper(input);
  if (!input.trim()) return bad("empty", "Enter a UTR.", utr);
  if (!/^[0-9A-Z]+$/.test(utr)) {
    return bad("bad_shape", "A UTR is letters and digits only.", utr);
  }

  const rail =
    utr.length === 12
      ? ("UPI" as const)
      : utr.length === 16
        ? ("IMPS" as const)
        : utr.length === 22
          ? ("NEFT / RTGS" as const)
          : undefined;

  if (!rail) {
    return bad(
      "bad_length",
      "A UTR is 12, 16 or 22 characters depending on the rail.",
      utr,
    );
  }
  return { valid: true, normalized: utr, rail };
}
