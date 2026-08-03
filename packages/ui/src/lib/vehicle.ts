/**
 * Indian vehicle registration number validation.
 *
 * Two live formats:
 *
 *   State series   MH 12 AB 1234   state + RTO district + series + number
 *   Bharat (BH)    22 BH 1234 AA   year + "BH" + number + series
 *
 * The BH series was introduced in 2021 for vehicles that move between states,
 * and its digits-first shape breaks any regex written only for the classic
 * format — which is why plenty of Indian insurance forms still reject it.
 */

const STATE_SERIES_RE = /^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/;
const BH_SERIES_RE = /^(\d{2})(BH)(\d{4})([A-Z]{1,2})$/;

export const RTO_STATE_CODES: Readonly<Record<string, string>> = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  CH: "Chandigarh",
  DD: "Daman & Diu",
  DL: "Delhi",
  DN: "Dadra & Nagar Haveli",
  GA: "Goa",
  GJ: "Gujarat",
  HP: "Himachal Pradesh",
  HR: "Haryana",
  JH: "Jharkhand",
  JK: "Jammu & Kashmir",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
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
  UA: "Uttarakhand (old code)",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
  AN: "Andaman & Nicobar Islands",
};

export type VehicleFormat = "state" | "bharat";

export type VehicleErrorCode =
  | "empty"
  | "too_short"
  | "bad_shape"
  | "unknown_state";

export interface VehicleResult {
  valid: boolean;
  normalized: string;
  format?: VehicleFormat;
  stateCode?: string;
  state?: string;
  /** RTO district number — state format only. */
  districtCode?: string;
  series?: string;
  number?: string;
  /** Registration year — BH series only. */
  year?: string;
  formatted?: string;
  error?: { code: VehicleErrorCode; message: string };
}

function fail(
  code: VehicleErrorCode,
  message: string,
  normalized: string,
): VehicleResult {
  return { valid: false, normalized, error: { code, message } };
}

export function normalizeVehicleNumber(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

export function validateVehicleNumber(input: string): VehicleResult {
  const reg = normalizeVehicleNumber(input);

  if (!input.trim()) return fail("empty", "Enter a registration number.", reg);
  if (reg.length < 6) {
    return fail(
      "too_short",
      "That's too short for a registration number.",
      reg,
    );
  }

  const bh = BH_SERIES_RE.exec(reg);
  if (bh) {
    const [, year, , number, series] = bh;
    return {
      valid: true,
      normalized: reg,
      format: "bharat",
      year: `20${year}`,
      number,
      series,
      formatted: `${year} BH ${number} ${series}`,
    };
  }

  const state = STATE_SERIES_RE.exec(reg);
  if (!state) {
    return fail(
      "bad_shape",
      "Use MH12AB1234, or 22BH1234AA for a Bharat series plate.",
      reg,
    );
  }

  const [, stateCode, districtCode, series, number] = state;
  const stateName = RTO_STATE_CODES[stateCode];
  if (!stateName) {
    return fail(
      "unknown_state",
      `“${stateCode}” isn't a state code we recognise.`,
      reg,
    );
  }

  return {
    valid: true,
    normalized: reg,
    format: "state",
    stateCode,
    state: stateName,
    districtCode,
    series,
    number,
    formatted: `${stateCode} ${districtCode} ${series} ${number}`,
  };
}
