/**
 * GSTIN (Goods and Services Tax Identification Number) validation.
 *
 * 15 characters, and unusually for Indian identifiers the checksum *is*
 * published, so this can be fully validated offline:
 *
 *   ┌──┬──────────┬─┬─┬─┐
 *   │01│AAAAA1111A│1│Z│5│
 *   └──┴──────────┴─┴─┴─┘
 *     │      │      │ │ └─ 15  check character (mod-36)
 *     │      │      │ └─── 14  'Z' by convention
 *     │      │      └───── 13  entity number for that PAN in that state
 *     │      └──────────── 3-12 the holder's PAN
 *     └─────────────────── 1-2 state code
 *
 * Because the PAN is embedded, a GSTIN and a PAN can be cross-checked against
 * each other — which is the most useful thing this module does.
 */

import { type PanResult, validatePan } from "./pan";

const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/;

/** State/UT codes as used in the first two characters. */
export const GST_STATE_CODES: Readonly<Record<string, string>> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman & Diu (pre-merger)",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (pre-bifurcation)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
  "99": "Centre Jurisdiction",
};

/**
 * The published GSTIN check character: weights alternate 1 and 2 across the
 * first 14 characters, each product is folded (quotient + remainder, base 36),
 * and the check is whatever brings the total to a multiple of 36.
 */
export function gstinCheckChar(first14: string): string | null {
  if (first14.length !== 14) return null;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const value = CHARSET.indexOf(first14[i]);
    if (value === -1) return null;
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return CHARSET[(36 - (sum % 36)) % 36];
}

export type GstinErrorCode =
  | "empty"
  | "wrong_length"
  | "bad_shape"
  | "unknown_state"
  | "bad_checksum"
  | "pan_mismatch";

export interface GstinResult {
  valid: boolean;
  normalized: string;
  stateCode?: string;
  state?: string;
  /** Characters 3–12: the holder's PAN. */
  pan?: string;
  panDetails?: PanResult;
  /** 13th character — which registration this is for that PAN in that state. */
  entityNumber?: string;
  error?: { code: GstinErrorCode; message: string };
}

function fail(
  code: GstinErrorCode,
  message: string,
  normalized: string,
): GstinResult {
  return { valid: false, normalized, error: { code, message } };
}

export function normalizeGstin(input: string): string {
  return input.replace(/\s/g, "").toUpperCase();
}

export function validateGstin(input: string): GstinResult {
  const gstin = normalizeGstin(input);

  if (!input.trim()) return fail("empty", "Enter a GSTIN.", gstin);
  if (gstin.length !== 15) {
    return fail(
      "wrong_length",
      `A GSTIN is 15 characters — ${gstin.length} so far.`,
      gstin,
    );
  }
  if (!GSTIN_RE.test(gstin)) {
    return fail(
      "bad_shape",
      "A GSTIN looks like 27ABCDE1234F1Z5 — state code, PAN, then three more.",
      gstin,
    );
  }

  const stateCode = gstin.slice(0, 2);
  const state = GST_STATE_CODES[stateCode];
  if (!state) {
    return fail(
      "unknown_state",
      `“${stateCode}” isn't a valid state code.`,
      gstin,
    );
  }

  const expected = gstinCheckChar(gstin.slice(0, 14));
  if (expected !== gstin[14]) {
    return fail(
      "bad_checksum",
      "That GSTIN failed its checksum — check for a typo.",
      gstin,
    );
  }

  const pan = gstin.slice(2, 12);
  const panDetails = validatePan(pan);
  if (!panDetails.valid) {
    return fail(
      "pan_mismatch",
      "The PAN embedded in this GSTIN isn't itself valid.",
      gstin,
    );
  }

  return {
    valid: true,
    normalized: gstin,
    stateCode,
    state,
    pan,
    panDetails,
    entityNumber: gstin[12],
  };
}

/** True when a GSTIN embeds the given PAN. Cheap cross-check for onboarding. */
export function gstinMatchesPan(gstin: string, pan: string): boolean {
  const g = validateGstin(gstin);
  if (!g.valid || !g.pan) return false;
  return g.pan === pan.replace(/\s/g, "").toUpperCase();
}
