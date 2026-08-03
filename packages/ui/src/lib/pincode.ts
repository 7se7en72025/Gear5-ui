/**
 * Indian PIN code (Postal Index Number) validation.
 *
 * Six digits. The first digit is the postal zone, the first two identify the
 * sub-zone/circle, and the remaining digits narrow to a delivery post office.
 * A leading 9 means Army Postal Service rather than a geographic region.
 *
 * We can derive the zone offline, but *not* city and state — that needs a
 * lookup (India Post's PIN API, or a bundled dataset). `PIN_ZONES` is here so a
 * UI can show something useful immediately while the lookup is in flight.
 */

const PINCODE_RE = /^[1-9][0-9]{5}$/;

/** First digit → postal zone and the regions it covers. */
export const PIN_ZONES: Readonly<
  Record<string, { zone: string; covers: string }>
> = {
  "1": {
    zone: "Northern",
    covers: "Delhi, Haryana, Punjab, Himachal Pradesh, J&K, Chandigarh",
  },
  "2": { zone: "Northern", covers: "Uttar Pradesh, Uttarakhand" },
  "3": {
    zone: "Western",
    covers: "Rajasthan, Gujarat, Daman & Diu, Dadra & Nagar Haveli",
  },
  "4": {
    zone: "Western",
    covers: "Maharashtra, Madhya Pradesh, Chhattisgarh, Goa",
  },
  "5": { zone: "Southern", covers: "Andhra Pradesh, Telangana, Karnataka" },
  "6": {
    zone: "Southern",
    covers: "Tamil Nadu, Kerala, Puducherry, Lakshadweep",
  },
  "7": {
    zone: "Eastern",
    covers: "West Bengal, Odisha, Assam, Sikkim, North East, A&N Islands",
  },
  "8": { zone: "Eastern", covers: "Bihar, Jharkhand" },
  "9": {
    zone: "Army Postal Service",
    covers: "APO / FPO — not a geographic region",
  },
};

export type PincodeErrorCode =
  | "empty"
  | "not_digits"
  | "too_short"
  | "too_long"
  | "leading_zero";

export interface PincodeResult {
  valid: boolean;
  normalized: string;
  zone?: string;
  covers?: string;
  /** True for 9xxxxx — a field expecting a home address probably shouldn't accept it. */
  isArmyPostal?: boolean;
  error?: { code: PincodeErrorCode; message: string };
}

function fail(
  code: PincodeErrorCode,
  message: string,
  normalized: string,
): PincodeResult {
  return { valid: false, normalized, error: { code, message } };
}

export function normalizePincode(input: string): string {
  return input.replace(/\D/g, "");
}

export function validatePincode(input: string): PincodeResult {
  const pin = normalizePincode(input);

  if (!input.trim()) return fail("empty", "Enter a PIN code.", pin);
  if (/[^\d\s]/.test(input)) {
    return fail("not_digits", "A PIN code is six digits.", pin);
  }
  if (pin.length < 6) {
    return fail(
      "too_short",
      `A PIN code is 6 digits — ${pin.length} so far.`,
      pin,
    );
  }
  if (pin.length > 6)
    return fail("too_long", "A PIN code is exactly 6 digits.", pin);
  if (pin[0] === "0") {
    return fail("leading_zero", "No Indian PIN code starts with 0.", pin);
  }
  if (!PINCODE_RE.test(pin)) {
    return fail("not_digits", "A PIN code is six digits.", pin);
  }

  const zone = PIN_ZONES[pin[0]];
  return {
    valid: true,
    normalized: pin,
    zone: zone?.zone,
    covers: zone?.covers,
    isArmyPostal: pin[0] === "9",
  };
}
