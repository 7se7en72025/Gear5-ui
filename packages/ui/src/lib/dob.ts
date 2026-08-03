/**
 * Date-of-birth validation for Indian KYC forms.
 *
 * India writes dates DD/MM/YYYY. `new Date("03/08/2006")` parses that as
 * 8 March in a US locale, silently — so this module never hands a
 * user-typed string to the Date constructor. It parses the parts itself and
 * verifies the date round-trips, which is also what catches 31/02.
 */

const DOB_RE = /^(\d{1,2})[/\-. ](\d{1,2})[/\-. ](\d{4})$/;

export type DobErrorCode =
  | "empty"
  | "bad_shape"
  | "bad_day"
  | "bad_month"
  | "impossible_date"
  | "in_future"
  | "too_old"
  | "under_age";

export interface DobResult {
  valid: boolean;
  /** ISO `YYYY-MM-DD` — what an API should receive. */
  iso?: string;
  day?: number;
  month?: number;
  year?: number;
  /** Completed years as of today. */
  age?: number;
  error?: { code: DobErrorCode; message: string };
}

function fail(code: DobErrorCode, message: string): DobResult {
  return { valid: false, error: { code, message } };
}

/** Completed years between `iso` and `asOf`. */
export function ageFrom(iso: string, asOf: Date = new Date()): number {
  const [y, m, d] = iso.split("-").map(Number);
  let age = asOf.getFullYear() - y;
  const beforeBirthday =
    asOf.getMonth() + 1 < m ||
    (asOf.getMonth() + 1 === m && asOf.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

/** Insert slashes as the user types: `03082006` → `03/08/2006`. */
export function formatDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function validateDob(
  input: string,
  options: { minAge?: number; maxAge?: number; asOf?: Date } = {},
): DobResult {
  const { minAge, maxAge = 120, asOf = new Date() } = options;

  if (!input.trim()) return fail("empty", "Enter a date of birth.");

  const match = DOB_RE.exec(input.trim());
  if (!match)
    return fail("bad_shape", "Use DD/MM/YYYY — day first, then month.");

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12)
    return fail("bad_month", "Month must be between 1 and 12.");
  if (day < 1 || day > 31)
    return fail("bad_day", "Day must be between 1 and 31.");

  // Round-trip through UTC to reject 31/02 and friends without touching local
  // timezone rules.
  const date = new Date(Date.UTC(year, month - 1, day));
  const roundTrips =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  if (!roundTrips) {
    return fail("impossible_date", `There's no ${day}/${month} in ${year}.`);
  }

  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const age = ageFrom(iso, asOf);
  const parts = { iso, day, month, year, age };

  if (age < 0)
    return { ...fail("in_future", "That date is in the future."), ...parts };
  if (age > maxAge) {
    return {
      ...fail("too_old", "Check the year — that's over 120 years ago."),
      ...parts,
    };
  }
  if (minAge !== undefined && age < minAge) {
    return {
      ...fail("under_age", `You must be at least ${minAge} to continue.`),
      ...parts,
    };
  }

  return { valid: true, ...parts };
}
