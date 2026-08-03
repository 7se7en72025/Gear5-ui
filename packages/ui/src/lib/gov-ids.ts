/**
 * Government photo-ID identifiers used in Indian KYC: Voter ID (EPIC),
 * driving licence, and passport.
 *
 * None of these carry a public checksum, so everything here is structural.
 * Real verification means the issuing authority's API — ECI, Parivahan/Sarathi,
 * or the Passport Seva portal respectively.
 */

import { RTO_STATE_CODES } from "./vehicle";

export interface IdResult<E extends string = string> {
  valid: boolean;
  normalized: string;
  error?: { code: E; message: string };
}

function ok<E extends string>(normalized: string): IdResult<E> {
  return { valid: true, normalized };
}

function bad<E extends string>(
  code: E,
  message: string,
  normalized: string,
): IdResult<E> {
  return { valid: false, normalized, error: { code, message } };
}

const upper = (input: string) => input.replace(/[\s-]/g, "").toUpperCase();

/* ── Voter ID (EPIC) ─────────────────────────────────────────────────────── */

const EPIC_RE = /^[A-Z]{3}[0-9]{7}$/;

export type VoterIdErrorCode = "empty" | "wrong_length" | "bad_shape";

/**
 * EPIC numbers are three letters (the Functional Constituency code) followed by
 * seven digits. Older cards used other shapes, but every card issued since the
 * 2000s follows this one.
 */
export function validateVoterId(input: string): IdResult<VoterIdErrorCode> {
  const id = upper(input);
  if (!input.trim()) return bad("empty", "Enter a Voter ID number.", id);
  if (id.length !== 10) {
    return bad(
      "wrong_length",
      `An EPIC number is 10 characters — ${id.length} so far.`,
      id,
    );
  }
  if (!EPIC_RE.test(id)) {
    return bad(
      "bad_shape",
      "A Voter ID looks like ABC1234567 — three letters, seven digits.",
      id,
    );
  }
  return ok(id);
}

/* ── Driving licence ─────────────────────────────────────────────────────── */

const DL_RE = /^([A-Z]{2})(\d{2})(\d{4})(\d{7})$/;

export type LicenceErrorCode =
  | "empty"
  | "wrong_length"
  | "bad_shape"
  | "unknown_state"
  | "bad_year";

export interface LicenceResult extends IdResult<LicenceErrorCode> {
  stateCode?: string;
  state?: string;
  rtoCode?: string;
  year?: number;
}

/**
 * Format is `SSRRYYYYNNNNNNN` — state, RTO office, year of issue, serial.
 * Printed with spaces or hyphens in practice, so we strip them first.
 */
export function validateDrivingLicence(input: string): LicenceResult {
  const dl = upper(input);
  if (!input.trim()) return bad("empty", "Enter a driving licence number.", dl);
  if (dl.length !== 15) {
    return bad(
      "wrong_length",
      `A licence number is 15 characters — ${dl.length} so far.`,
      dl,
    );
  }

  const match = DL_RE.exec(dl);
  if (!match) {
    return bad(
      "bad_shape",
      "A licence looks like MH1220110012345 — state, RTO, year, serial.",
      dl,
    );
  }

  const [, stateCode, rtoCode, yearStr] = match;
  const state = RTO_STATE_CODES[stateCode];
  if (!state)
    return bad(
      "unknown_state",
      `“${stateCode}” isn't a state code we recognise.`,
      dl,
    );

  const year = Number(yearStr);
  const thisYear = new Date().getFullYear();
  if (year < 1950 || year > thisYear) {
    return bad("bad_year", `“${yearStr}” isn't a plausible year of issue.`, dl);
  }

  return { valid: true, normalized: dl, stateCode, state, rtoCode, year };
}

/* ── Passport ────────────────────────────────────────────────────────────── */

const PASSPORT_RE = /^[A-PR-WY][0-9]{7}$/;

export type PassportErrorCode = "empty" | "wrong_length" | "bad_shape";

/**
 * Indian passports are one letter then seven digits. The letters Q, X and Z are
 * not used as the leading character, which is a cheap extra typo check.
 */
export function validatePassport(input: string): IdResult<PassportErrorCode> {
  const id = upper(input);
  if (!input.trim()) return bad("empty", "Enter a passport number.", id);
  if (id.length !== 8) {
    return bad(
      "wrong_length",
      `A passport number is 8 characters — ${id.length} so far.`,
      id,
    );
  }
  if (!PASSPORT_RE.test(id)) {
    return bad(
      "bad_shape",
      "A passport number looks like A1234567 — one letter, seven digits.",
      id,
    );
  }
  return ok(id);
}
