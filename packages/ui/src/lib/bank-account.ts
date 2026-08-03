/**
 * Indian bank account number validation.
 *
 * There is no national standard and no checksum — length and composition vary
 * by bank (SBI uses 11 digits, HDFC 14, ICICI 12, and cooperative banks do
 * their own thing). So the only honest offline checks are: digits only, and a
 * plausible length.
 *
 * Because a typo here silently sends money to a stranger, the real safeguards
 * are elsewhere: make the user type it twice (`confirmMatches`), and verify
 * with a penny-drop / name-match API before the first transfer.
 */

const MIN_LENGTH = 9;
const MAX_LENGTH = 18;

export type BankAccountErrorCode =
  | "empty"
  | "not_digits"
  | "too_short"
  | "too_long"
  | "all_same_digit";

export interface BankAccountResult {
  valid: boolean;
  normalized: string;
  /** `XXXXXX3210` — safe for display and logs. */
  masked?: string;
  error?: { code: BankAccountErrorCode; message: string };
}

function bad(
  code: BankAccountErrorCode,
  message: string,
  normalized: string,
): BankAccountResult {
  return { valid: false, normalized, error: { code, message } };
}

export function normalizeBankAccount(input: string): string {
  return input.replace(/\D/g, "");
}

/** Mask all but the last four digits. */
export function maskBankAccount(input: string): string {
  const digits = normalizeBankAccount(input);
  if (digits.length < 4) return digits.replace(/\d/g, "X");
  return `${"X".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

export function validateBankAccount(input: string): BankAccountResult {
  const digits = normalizeBankAccount(input);

  if (!input.trim()) return bad("empty", "Enter an account number.", digits);
  if (/[^\d\s-]/.test(input)) {
    return bad("not_digits", "An account number is digits only.", digits);
  }
  if (digits.length < MIN_LENGTH) {
    return bad(
      "too_short",
      `Account numbers are at least ${MIN_LENGTH} digits — ${digits.length} so far.`,
      digits,
    );
  }
  if (digits.length > MAX_LENGTH) {
    return bad(
      "too_long",
      `Account numbers are at most ${MAX_LENGTH} digits.`,
      digits,
    );
  }
  // 000000000 / 111111111 are placeholders, never real accounts.
  if (/^(\d)\1+$/.test(digits)) {
    return bad(
      "all_same_digit",
      "That doesn't look like a real account number.",
      digits,
    );
  }

  return { valid: true, normalized: digits, masked: maskBankAccount(digits) };
}

/** True when a re-typed account number matches the original. */
export function confirmMatches(account: string, confirmation: string): boolean {
  return (
    normalizeBankAccount(account) === normalizeBankAccount(confirmation) &&
    normalizeBankAccount(account).length > 0
  );
}
