/**
 * PAN (Permanent Account Number) validation.
 *
 * Format is `AAAAA9999A` — five letters, four digits, one letter.
 *
 * The two letters worth understanding:
 *   - 4th character encodes the holder type (P = individual, C = company, …).
 *   - 5th character is the first letter of the surname for an individual, or of
 *     the entity name otherwise.
 *
 * The 10th character *is* a check digit, but the Income Tax Department has
 * never published the algorithm. Anyone claiming to verify a PAN checksum
 * offline is guessing. We validate structure only and say so — real
 * verification needs the NSDL/Protean or Income Tax verification API.
 */

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export type PanHolderType =
  | "Individual"
  | "Company"
  | "Hindu Undivided Family"
  | "Association of Persons"
  | "Body of Individuals"
  | "Government"
  | "Artificial Juridical Person"
  | "Local Authority"
  | "Firm / LLP"
  | "Trust";

const HOLDER_TYPES: Readonly<Record<string, PanHolderType>> = {
  P: "Individual",
  C: "Company",
  H: "Hindu Undivided Family",
  A: "Association of Persons",
  B: "Body of Individuals",
  G: "Government",
  J: "Artificial Juridical Person",
  L: "Local Authority",
  F: "Firm / LLP",
  T: "Trust",
};

export type PanErrorCode =
  | "empty"
  | "wrong_length"
  | "bad_shape"
  | "bad_holder_type";

export interface PanResult {
  valid: boolean;
  /** Uppercased, whitespace stripped. */
  normalized: string;
  /** Decoded from the 4th character, when recognised. */
  holderType?: PanHolderType;
  /** First letter of the surname / entity name (5th character). */
  nameInitial?: string;
  error?: { code: PanErrorCode; message: string };
}

function fail(
  code: PanErrorCode,
  message: string,
  normalized: string,
): PanResult {
  return { valid: false, normalized, error: { code, message } };
}

export function normalizePan(input: string): string {
  return input.replace(/\s/g, "").toUpperCase();
}

export function validatePan(input: string): PanResult {
  const pan = normalizePan(input);

  if (!input.trim()) return fail("empty", "Enter a PAN.", pan);
  if (pan.length !== 10) {
    return fail(
      "wrong_length",
      `A PAN is 10 characters — ${pan.length} so far.`,
      pan,
    );
  }
  if (!PAN_RE.test(pan)) {
    return fail(
      "bad_shape",
      "A PAN looks like ABCDE1234F — five letters, four digits, one letter.",
      pan,
    );
  }

  const holderType = HOLDER_TYPES[pan[3]];
  if (!holderType) {
    return fail(
      "bad_holder_type",
      `“${pan[3]}” isn't a valid 4th character — it encodes the holder type.`,
      pan,
    );
  }

  return { valid: true, normalized: pan, holderType, nameInitial: pan[4] };
}

/** Just the holder type for a 4th character, if you need it standalone. */
export function panHolderType(char: string): PanHolderType | undefined {
  return HOLDER_TYPES[char.toUpperCase()];
}

/** `ABCDE1234F` → `ABCXXXXX4F`. For display and logs. */
export function maskPan(input: string): string {
  const pan = normalizePan(input);
  if (pan.length !== 10) return pan.replace(/./g, "X");
  return `${pan.slice(0, 3)}XXXXX${pan.slice(8)}`;
}
