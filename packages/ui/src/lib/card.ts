/**
 * Payment card validation, with RuPay support.
 *
 * Most card libraries were written for Visa/Mastercard/Amex and silently reject
 * RuPay, which is the majority of debit cards issued in India. The BIN ranges
 * below cover it properly.
 *
 * ⚠️ Never send a raw PAN to your own server unless you are PCI-DSS compliant.
 * Use your gateway's tokenisation (Razorpay, Juspay, Stripe) and treat this as
 * a typo-catcher only.
 */

export type CardNetwork =
  | "RuPay"
  | "Visa"
  | "Mastercard"
  | "American Express"
  | "Diners Club"
  | "Maestro"
  | "Discover";

interface NetworkSpec {
  network: CardNetwork;
  test: (digits: string) => boolean;
  lengths: number[];
  /** Digit-group sizes for display. */
  gaps: number[];
  cvvLength: number;
}

const between = (value: string, lo: number, hi: number) => {
  const n = Number(value);
  return n >= lo && n <= hi;
};

const NETWORKS: readonly NetworkSpec[] = [
  {
    network: "American Express",
    test: (d) => /^3[47]/.test(d),
    lengths: [15],
    gaps: [4, 6, 5],
    cvvLength: 4,
  },
  {
    // Checked before Discover/Maestro: their ranges overlap at 6x, and in India
    // a 6xxx card is overwhelmingly more likely to be RuPay.
    network: "RuPay",
    test: (d) => /^(508[5-9]|60[6-9]|65[23]|81[7-9]|82[0-2])/.test(d),
    lengths: [16],
    gaps: [4, 4, 4, 4],
    cvvLength: 3,
  },
  {
    network: "Visa",
    test: (d) => /^4/.test(d),
    lengths: [13, 16, 19],
    gaps: [4, 4, 4, 4],
    cvvLength: 3,
  },
  {
    network: "Mastercard",
    test: (d) =>
      between(d.slice(0, 2), 51, 55) || between(d.slice(0, 4), 2221, 2720),
    lengths: [16],
    gaps: [4, 4, 4, 4],
    cvvLength: 3,
  },
  {
    network: "Diners Club",
    test: (d) => /^(36|38|30[0-5])/.test(d),
    lengths: [14, 16],
    gaps: [4, 6, 4],
    cvvLength: 3,
  },
  {
    network: "Discover",
    test: (d) => /^(6011|64[4-9]|65)/.test(d),
    lengths: [16, 19],
    gaps: [4, 4, 4, 4],
    cvvLength: 3,
  },
  {
    network: "Maestro",
    test: (d) => /^(5018|5020|5038|56|57|58|6304|6759|676[1-3])/.test(d),
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    gaps: [4, 4, 4, 4],
    cvvLength: 3,
  },
];

/** Identify the network from as few as two digits. */
export function detectNetwork(input: string): NetworkSpec | undefined {
  const digits = input.replace(/\D/g, "");
  if (!digits) return undefined;
  return NETWORKS.find((spec) => spec.test(digits));
}

/** The Luhn (mod-10) check every card network uses. */
export function luhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let value = Number(digits[i]);
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
}

export type CardErrorCode =
  | "empty"
  | "not_digits"
  | "unknown_network"
  | "bad_length"
  | "bad_checksum";

export interface CardResult {
  valid: boolean;
  normalized: string;
  network?: CardNetwork;
  /** How many digits the CVV should be — 4 for Amex, 3 otherwise. */
  cvvLength?: number;
  formatted?: string;
  error?: { code: CardErrorCode; message: string };
}

function bad(
  code: CardErrorCode,
  message: string,
  normalized: string,
): CardResult {
  return { valid: false, normalized, error: { code, message } };
}

/** Group digits for display, using the network's own convention. */
export function formatCardNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 19);
  const gaps = detectNetwork(digits)?.gaps ?? [4, 4, 4, 4];

  const parts: string[] = [];
  let cursor = 0;
  for (const size of gaps) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  if (cursor < digits.length) parts.push(digits.slice(cursor));
  return parts.join(" ");
}

export function validateCardNumber(input: string): CardResult {
  const digits = input.replace(/\D/g, "");

  if (!input.trim()) return bad("empty", "Enter a card number.", digits);
  if (/[^\d\s-]/.test(input)) {
    return bad("not_digits", "A card number is digits only.", digits);
  }

  const spec = detectNetwork(digits);
  if (!spec) {
    return bad(
      "unknown_network",
      "We don't recognise this card network.",
      digits,
    );
  }
  if (!spec.lengths.includes(digits.length)) {
    const expected = spec.lengths.join(" or ");
    return bad(
      "bad_length",
      `A ${spec.network} card is ${expected} digits — ${digits.length} so far.`,
      digits,
    );
  }
  if (!luhnValid(digits)) {
    return bad("bad_checksum", "That card number failed its checksum.", digits);
  }

  return {
    valid: true,
    normalized: digits,
    network: spec.network,
    cvvLength: spec.cvvLength,
    formatted: formatCardNumber(digits),
  };
}

/* ── Expiry ──────────────────────────────────────────────────────────────── */

export type ExpiryErrorCode = "empty" | "bad_shape" | "bad_month" | "expired";

export interface ExpiryResult {
  valid: boolean;
  normalized: string;
  month?: number;
  year?: number;
  error?: { code: ExpiryErrorCode; message: string };
}

/** Insert the slash as the user types: `1229` → `12/29`. */
export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  // A lone 2–9 can only be a month if we pad it, e.g. "3" → "03/".
  if (digits.length === 1 && Number(digits) > 1) return `0${digits}/`;
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validateExpiry(
  input: string,
  asOf: Date = new Date(),
): ExpiryResult {
  const digits = input.replace(/\D/g, "");
  if (!input.trim()) {
    return {
      valid: false,
      normalized: digits,
      error: { code: "empty", message: "Enter the expiry date." },
    };
  }
  if (digits.length !== 4) {
    return {
      valid: false,
      normalized: digits,
      error: { code: "bad_shape", message: "Use MM/YY." },
    };
  }

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));

  if (month < 1 || month > 12) {
    return {
      valid: false,
      normalized: digits,
      month,
      year,
      error: { code: "bad_month", message: "Month must be between 01 and 12." },
    };
  }

  // A card is valid through the *last day* of its expiry month.
  const expiresAfter = new Date(year, month, 0, 23, 59, 59);
  if (expiresAfter < asOf) {
    return {
      valid: false,
      normalized: digits,
      month,
      year,
      error: { code: "expired", message: "This card has expired." },
    };
  }

  return { valid: true, normalized: digits, month, year };
}

/* ── CVV ─────────────────────────────────────────────────────────────────── */

export type CvvErrorCode = "empty" | "not_digits" | "wrong_length";

export interface CvvResult {
  valid: boolean;
  normalized: string;
  error?: { code: CvvErrorCode; message: string };
}

export function validateCvv(input: string, expectedLength = 3): CvvResult {
  const digits = input.replace(/\D/g, "");
  if (!input.trim()) {
    return {
      valid: false,
      normalized: digits,
      error: { code: "empty", message: "Enter the CVV." },
    };
  }
  if (/[^\d\s]/.test(input)) {
    return {
      valid: false,
      normalized: digits,
      error: { code: "not_digits", message: "A CVV is digits only." },
    };
  }
  if (digits.length !== expectedLength) {
    return {
      valid: false,
      normalized: digits,
      error: {
        code: "wrong_length",
        message: `This card's CVV is ${expectedLength} digits.`,
      },
    };
  }
  return { valid: true, normalized: digits };
}
