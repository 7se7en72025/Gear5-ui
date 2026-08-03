/**
 * States and union territories of India, with the code systems that actually
 * appear in forms: the two-letter ISO/vehicle abbreviation and the numeric GST
 * state code.
 */

export interface IndianState {
  /** Two-letter code — matches vehicle registration and ISO 3166-2:IN. */
  code: string;
  name: string;
  /** Numeric GST state code, as used in the first two digits of a GSTIN. */
  gstCode: string;
  type: "state" | "union territory";
}

export const INDIAN_STATES: readonly IndianState[] = [
  {
    code: "AN",
    name: "Andaman & Nicobar Islands",
    gstCode: "35",
    type: "union territory",
  },
  { code: "AP", name: "Andhra Pradesh", gstCode: "37", type: "state" },
  { code: "AR", name: "Arunachal Pradesh", gstCode: "12", type: "state" },
  { code: "AS", name: "Assam", gstCode: "18", type: "state" },
  { code: "BR", name: "Bihar", gstCode: "10", type: "state" },
  { code: "CH", name: "Chandigarh", gstCode: "04", type: "union territory" },
  { code: "CG", name: "Chhattisgarh", gstCode: "22", type: "state" },
  {
    code: "DN",
    name: "Dadra & Nagar Haveli and Daman & Diu",
    gstCode: "26",
    type: "union territory",
  },
  { code: "DL", name: "Delhi", gstCode: "07", type: "union territory" },
  { code: "GA", name: "Goa", gstCode: "30", type: "state" },
  { code: "GJ", name: "Gujarat", gstCode: "24", type: "state" },
  { code: "HR", name: "Haryana", gstCode: "06", type: "state" },
  { code: "HP", name: "Himachal Pradesh", gstCode: "02", type: "state" },
  {
    code: "JK",
    name: "Jammu & Kashmir",
    gstCode: "01",
    type: "union territory",
  },
  { code: "JH", name: "Jharkhand", gstCode: "20", type: "state" },
  { code: "KA", name: "Karnataka", gstCode: "29", type: "state" },
  { code: "KL", name: "Kerala", gstCode: "32", type: "state" },
  { code: "LA", name: "Ladakh", gstCode: "38", type: "union territory" },
  { code: "LD", name: "Lakshadweep", gstCode: "31", type: "union territory" },
  { code: "MP", name: "Madhya Pradesh", gstCode: "23", type: "state" },
  { code: "MH", name: "Maharashtra", gstCode: "27", type: "state" },
  { code: "MN", name: "Manipur", gstCode: "14", type: "state" },
  { code: "ML", name: "Meghalaya", gstCode: "17", type: "state" },
  { code: "MZ", name: "Mizoram", gstCode: "15", type: "state" },
  { code: "NL", name: "Nagaland", gstCode: "13", type: "state" },
  { code: "OD", name: "Odisha", gstCode: "21", type: "state" },
  { code: "PY", name: "Puducherry", gstCode: "34", type: "union territory" },
  { code: "PB", name: "Punjab", gstCode: "03", type: "state" },
  { code: "RJ", name: "Rajasthan", gstCode: "08", type: "state" },
  { code: "SK", name: "Sikkim", gstCode: "11", type: "state" },
  { code: "TN", name: "Tamil Nadu", gstCode: "33", type: "state" },
  { code: "TS", name: "Telangana", gstCode: "36", type: "state" },
  { code: "TR", name: "Tripura", gstCode: "16", type: "state" },
  { code: "UP", name: "Uttar Pradesh", gstCode: "09", type: "state" },
  { code: "UK", name: "Uttarakhand", gstCode: "05", type: "state" },
  { code: "WB", name: "West Bengal", gstCode: "19", type: "state" },
];

const BY_CODE = new Map(INDIAN_STATES.map((s) => [s.code, s]));
const BY_GST = new Map(INDIAN_STATES.map((s) => [s.gstCode, s]));

export function stateByCode(code: string): IndianState | undefined {
  return BY_CODE.get(code.trim().toUpperCase());
}

export function stateByGstCode(gstCode: string): IndianState | undefined {
  return BY_GST.get(gstCode.trim());
}

/** Case-insensitive name/code search, for a filterable select. */
export function searchStates(query: string): IndianState[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...INDIAN_STATES];
  return INDIAN_STATES.filter(
    (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
  );
}
