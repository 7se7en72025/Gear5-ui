/**
 * Business and tax identifiers: TAN, CIN, Udyam, HSN/SAC and FSSAI licence.
 *
 * CIN is the interesting one — 21 characters that encode the listing status,
 * industry, state, incorporation year, ownership type and registration number,
 * all of which can be decoded offline.
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

/* ── TAN ─────────────────────────────────────────────────────────────────── */

const TAN_RE = /^[A-Z]{4}[0-9]{5}[A-Z]$/;

export type TanErrorCode = "empty" | "wrong_length" | "bad_shape";

/**
 * Tax Deduction Account Number: `AAAA99999A`. The first three letters are the
 * city code of the issuing office, the fourth is the deductor's initial.
 */
export function validateTan(input: string): IdResult<TanErrorCode> {
  const tan = upper(input);
  if (!input.trim()) return bad("empty", "Enter a TAN.", tan);
  if (tan.length !== 10) {
    return bad(
      "wrong_length",
      `A TAN is 10 characters — ${tan.length} so far.`,
      tan,
    );
  }
  if (!TAN_RE.test(tan)) {
    return bad(
      "bad_shape",
      "A TAN looks like MUMA12345B — four letters, five digits, one letter.",
      tan,
    );
  }
  return { valid: true, normalized: tan };
}

/* ── CIN ─────────────────────────────────────────────────────────────────── */

const CIN_RE = /^([LU])(\d{5})([A-Z]{2})(\d{4})([A-Z]{3})(\d{6})$/;

const OWNERSHIP: Readonly<Record<string, string>> = {
  PLC: "Public Limited Company",
  PTC: "Private Limited Company",
  OPC: "One Person Company",
  FLC: "Financial Lease Company",
  GAP: "General Association Public",
  GAT: "General Association Private",
  FTC: "Subsidiary of a Foreign Company",
  ULL: "Unlimited Liability, Public",
  ULT: "Unlimited Liability, Private",
  NPL: "Not-for-Profit (Section 8)",
  SGC: "State Government Company",
  GOI: "Government of India Company",
};

export type CinErrorCode =
  | "empty"
  | "wrong_length"
  | "bad_shape"
  | "unknown_state"
  | "bad_year"
  | "unknown_ownership";

export interface CinResult extends IdResult<CinErrorCode> {
  listed?: boolean;
  industryCode?: string;
  stateCode?: string;
  state?: string;
  year?: number;
  ownershipCode?: string;
  ownership?: string;
  registrationNumber?: string;
}

/** Corporate Identity Number — 21 characters, fully decodable offline. */
export function validateCin(input: string): CinResult {
  const cin = upper(input);
  if (!input.trim()) return bad("empty", "Enter a CIN.", cin);
  if (cin.length !== 21) {
    return bad(
      "wrong_length",
      `A CIN is 21 characters — ${cin.length} so far.`,
      cin,
    );
  }

  const match = CIN_RE.exec(cin);
  if (!match) {
    return bad("bad_shape", "A CIN looks like U72200KA2013PTC098765.", cin);
  }

  const [
    ,
    listing,
    industryCode,
    stateCode,
    yearStr,
    ownershipCode,
    registrationNumber,
  ] = match;

  const state = CIN_STATE_CODES[stateCode];
  if (!state)
    return bad(
      "unknown_state",
      `“${stateCode}” isn't a state code we recognise.`,
      cin,
    );

  const year = Number(yearStr);
  const thisYear = new Date().getFullYear();
  if (year < 1850 || year > thisYear) {
    return bad(
      "bad_year",
      `“${yearStr}” isn't a plausible incorporation year.`,
      cin,
    );
  }

  const ownership = OWNERSHIP[ownershipCode];
  if (!ownership) {
    return bad(
      "unknown_ownership",
      `“${ownershipCode}” isn't a company class we recognise.`,
      cin,
    );
  }

  return {
    valid: true,
    normalized: cin,
    // 'L' means listed on a stock exchange, 'U' unlisted.
    listed: listing === "L",
    industryCode,
    stateCode,
    state,
    year,
    ownershipCode,
    ownership,
    registrationNumber,
  };
}

/** CIN uses two-letter state abbreviations, not GST's numeric state codes. */
const CIN_STATE_CODES: Readonly<Record<string, string>> = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  CH: "Chandigarh",
  DL: "Delhi",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  JK: "Jammu & Kashmir",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  MH: "Maharashtra",
  ML: "Meghalaya",
  MN: "Manipur",
  MP: "Madhya Pradesh",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  OR: "Odisha (old code)",
  PB: "Punjab",
  PY: "Puducherry",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TR: "Tripura",
  TS: "Telangana",
  UK: "Uttarakhand",
  UR: "Uttarakhand (old code)",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
  AN: "Andaman & Nicobar Islands",
  DN: "Dadra & Nagar Haveli",
  DD: "Daman & Diu",
  LD: "Lakshadweep",
};

/* ── Udyam (MSME) ────────────────────────────────────────────────────────── */

const UDYAM_RE = /^UDYAM[A-Z]{2}\d{2}\d{7}$/;

export type UdyamErrorCode = "empty" | "bad_shape";

/** Udyam registration: `UDYAM-KR-03-0000001`. Replaced Udyog Aadhaar in 2020. */
export function validateUdyam(input: string): IdResult<UdyamErrorCode> {
  const id = upper(input);
  if (!input.trim())
    return bad("empty", "Enter a Udyam registration number.", id);
  if (!UDYAM_RE.test(id)) {
    return bad("bad_shape", "Udyam numbers look like UDYAM-KR-03-0000001.", id);
  }
  return { valid: true, normalized: id };
}

/** Re-insert the hyphens Udyam numbers are printed with. */
export function formatUdyam(input: string): string {
  const id = upper(input).slice(0, 16);
  if (id.length <= 5) return id;
  const parts = [id.slice(0, 5), id.slice(5, 7), id.slice(7, 9), id.slice(9)];
  return parts.filter(Boolean).join("-");
}

/* ── HSN / SAC ───────────────────────────────────────────────────────────── */

export type HsnErrorCode = "empty" | "not_digits" | "bad_length";

export interface HsnResult extends IdResult<HsnErrorCode> {
  /** 2 = chapter, 4 = heading, 6 = subheading, 8 = tariff item. */
  level?: "chapter" | "heading" | "subheading" | "tariff item";
}

/** HSN (goods) and SAC (services) codes are 2, 4, 6 or 8 digits — never 3, 5 or 7. */
export function validateHsn(input: string): HsnResult {
  const code = input.replace(/\D/g, "");
  if (!input.trim()) return bad("empty", "Enter an HSN or SAC code.", code);
  if (/[^\d\s]/.test(input))
    return bad("not_digits", "HSN codes are digits only.", code);

  const levels = {
    2: "chapter",
    4: "heading",
    6: "subheading",
    8: "tariff item",
  } as const;
  const level = levels[code.length as keyof typeof levels];
  if (!level) {
    return bad("bad_length", "An HSN code is 2, 4, 6 or 8 digits long.", code);
  }
  return { valid: true, normalized: code, level };
}

/* ── FSSAI licence ───────────────────────────────────────────────────────── */

export type FssaiErrorCode =
  | "empty"
  | "not_digits"
  | "wrong_length"
  | "bad_prefix";

/**
 * FSSAI licence numbers are 14 digits. The first digit is 1 for a registration
 * and 2 for a state/central licence; anything else is a typo.
 */
export function validateFssai(input: string): IdResult<FssaiErrorCode> {
  const id = input.replace(/\D/g, "");
  if (!input.trim()) return bad("empty", "Enter an FSSAI licence number.", id);
  if (/[^\d\s]/.test(input))
    return bad("not_digits", "An FSSAI number is digits only.", id);
  if (id.length !== 14) {
    return bad(
      "wrong_length",
      `An FSSAI number is 14 digits — ${id.length} so far.`,
      id,
    );
  }
  if (id[0] !== "1" && id[0] !== "2") {
    return bad("bad_prefix", "An FSSAI number starts with 1 or 2.", id);
  }
  return { valid: true, normalized: id };
}
