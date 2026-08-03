/**
 * IFSC (Indian Financial System Code) validation.
 *
 * 11 characters: `AAAA0BBBBBB`
 *   - 1–4  bank code (letters)
 *   - 5    always `0`, reserved by RBI for future use
 *   - 6–11 branch code (alphanumeric)
 *
 * There is no checksum. The bank code list below covers the common banks so a
 * UI can name the bank as you type; an unrecognised code is a hint, never an
 * error, because new banks and mergers happen constantly. Branch-level detail
 * needs a lookup API (Razorpay's ifsc.razorpay.com is the usual free one).
 */

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** Bank code (first four characters) → bank name. Best-effort; PRs welcome. */
export const IFSC_BANK_CODES: Readonly<Record<string, string>> = {
  SBIN: "State Bank of India",
  HDFC: "HDFC Bank",
  ICIC: "ICICI Bank",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  PUNB: "Punjab National Bank",
  BARB: "Bank of Baroda",
  CNRB: "Canara Bank",
  UBIN: "Union Bank of India",
  IOBA: "Indian Overseas Bank",
  IDIB: "Indian Bank",
  CBIN: "Central Bank of India",
  MAHB: "Bank of Maharashtra",
  UCBA: "UCO Bank",
  PSIB: "Punjab & Sind Bank",
  BKID: "Bank of India",
  IBKL: "IDBI Bank",
  IDFB: "IDFC FIRST Bank",
  YESB: "Yes Bank",
  INDB: "IndusInd Bank",
  RATN: "RBL Bank",
  FDRL: "Federal Bank",
  SIBL: "South Indian Bank",
  KVBL: "Karur Vysya Bank",
  TMBL: "Tamilnad Mercantile Bank",
  CIUB: "City Union Bank",
  KARB: "Karnataka Bank",
  DLXB: "Dhanlaxmi Bank",
  JAKA: "Jammu & Kashmir Bank",
  BDBL: "Bandhan Bank",
  AUBL: "AU Small Finance Bank",
  ESFB: "Equitas Small Finance Bank",
  UJVN: "Ujjivan Small Finance Bank",
  JSFB: "Jana Small Finance Bank",
  SURY: "Suryoday Small Finance Bank",
  FINO: "Fino Payments Bank",
  AIRP: "Airtel Payments Bank",
  IPOS: "India Post Payments Bank",
  PYTM: "Paytm Payments Bank",
  CITI: "Citibank",
  HSBC: "HSBC",
  SCBL: "Standard Chartered Bank",
  DEUT: "Deutsche Bank",
  DBSS: "DBS Bank India",
};

export type IfscErrorCode =
  | "empty"
  | "wrong_length"
  | "bad_shape"
  | "reserved_char";

export interface IfscResult {
  valid: boolean;
  normalized: string;
  bankCode?: string;
  bank?: string;
  branchCode?: string;
  /** Structurally fine but the bank code isn't in our list. Show, don't block. */
  unrecognisedBank?: boolean;
  error?: { code: IfscErrorCode; message: string };
}

function fail(
  code: IfscErrorCode,
  message: string,
  normalized: string,
): IfscResult {
  return { valid: false, normalized, error: { code, message } };
}

export function normalizeIfsc(input: string): string {
  return input.replace(/\s/g, "").toUpperCase();
}

export function validateIfsc(input: string): IfscResult {
  const ifsc = normalizeIfsc(input);

  if (!input.trim()) return fail("empty", "Enter an IFSC.", ifsc);
  if (ifsc.length !== 11) {
    return fail(
      "wrong_length",
      `An IFSC is 11 characters — ${ifsc.length} so far.`,
      ifsc,
    );
  }
  // Called out separately because it's the single most common IFSC typo.
  if (ifsc[4] !== "0") {
    return fail(
      "reserved_char",
      "The 5th character of an IFSC is always 0.",
      ifsc,
    );
  }
  if (!IFSC_RE.test(ifsc)) {
    return fail(
      "bad_shape",
      "An IFSC looks like HDFC0001234 — four letters, a 0, then six characters.",
      ifsc,
    );
  }

  const bankCode = ifsc.slice(0, 4);
  const bank = IFSC_BANK_CODES[bankCode];

  return {
    valid: true,
    normalized: ifsc,
    bankCode,
    bank,
    branchCode: ifsc.slice(5),
    unrecognisedBank: !bank,
  };
}
