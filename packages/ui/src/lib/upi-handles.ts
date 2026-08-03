/**
 * UPI handle registry.
 *
 * Maps a VPA handle (the part after `@`) to the app/PSP that issues it and the
 * bank that actually settles it. NPCI does not publish a machine-readable list,
 * so this is compiled from public PSP documentation and observed VPAs.
 *
 * It is therefore best-effort and will drift as new PSPs launch. Treat an
 * unknown handle as *unrecognised*, never as *invalid* — see `validateVpa`.
 *
 * Corrections and additions are very welcome: one PR per handle, with a link
 * to a public source in the description.
 */

export type UpiHandleKind = "psp" | "bank";

export interface UpiHandle {
  /** Handle without the leading `@`, always lowercase. */
  handle: string;
  /** Consumer-facing app or provider, e.g. "PhonePe". */
  provider: string;
  /** Bank that settles the VPA, e.g. "Yes Bank". */
  bank: string;
  /**
   * `psp` — issued by a third-party payment app (PhonePe, GPay, Paytm).
   * `bank` — issued by the bank's own UPI app / netbanking.
   */
  kind: UpiHandleKind;
}

export const UPI_HANDLES: readonly UpiHandle[] = [
  // ── PhonePe ────────────────────────────────────────────────────────────────
  { handle: "ybl", provider: "PhonePe", bank: "Yes Bank", kind: "psp" },
  { handle: "ibl", provider: "PhonePe", bank: "ICICI Bank", kind: "psp" },
  { handle: "axl", provider: "PhonePe", bank: "Axis Bank", kind: "psp" },

  // ── Google Pay ─────────────────────────────────────────────────────────────
  {
    handle: "okhdfcbank",
    provider: "Google Pay",
    bank: "HDFC Bank",
    kind: "psp",
  },
  {
    handle: "okicici",
    provider: "Google Pay",
    bank: "ICICI Bank",
    kind: "psp",
  },
  { handle: "okaxis", provider: "Google Pay", bank: "Axis Bank", kind: "psp" },
  {
    handle: "oksbi",
    provider: "Google Pay",
    bank: "State Bank of India",
    kind: "psp",
  },

  // ── Paytm ──────────────────────────────────────────────────────────────────
  {
    handle: "paytm",
    provider: "Paytm",
    bank: "Paytm Payments Bank",
    kind: "psp",
  },
  { handle: "ptyes", provider: "Paytm", bank: "Yes Bank", kind: "psp" },
  {
    handle: "ptsbi",
    provider: "Paytm",
    bank: "State Bank of India",
    kind: "psp",
  },
  { handle: "ptaxis", provider: "Paytm", bank: "Axis Bank", kind: "psp" },
  { handle: "pthdfc", provider: "Paytm", bank: "HDFC Bank", kind: "psp" },

  // ── Amazon Pay ─────────────────────────────────────────────────────────────
  { handle: "apl", provider: "Amazon Pay", bank: "Axis Bank", kind: "psp" },
  { handle: "yapl", provider: "Amazon Pay", bank: "Yes Bank", kind: "psp" },
  { handle: "rapl", provider: "Amazon Pay", bank: "RBL Bank", kind: "psp" },

  // ── WhatsApp Pay ───────────────────────────────────────────────────────────
  {
    handle: "waaxis",
    provider: "WhatsApp Pay",
    bank: "Axis Bank",
    kind: "psp",
  },
  {
    handle: "wahdfcbank",
    provider: "WhatsApp Pay",
    bank: "HDFC Bank",
    kind: "psp",
  },
  {
    handle: "waicici",
    provider: "WhatsApp Pay",
    bank: "ICICI Bank",
    kind: "psp",
  },
  {
    handle: "wasbi",
    provider: "WhatsApp Pay",
    bank: "State Bank of India",
    kind: "psp",
  },

  // ── Neobanks / fintech apps ────────────────────────────────────────────────
  { handle: "upi", provider: "BHIM", bank: "NPCI", kind: "psp" },
  {
    handle: "slc",
    provider: "slice",
    bank: "slice Small Finance Bank",
    kind: "psp",
  },
  { handle: "naviaxis", provider: "Navi", bank: "Axis Bank", kind: "psp" },
  {
    handle: "fifederal",
    provider: "Fi Money",
    bank: "Federal Bank",
    kind: "psp",
  },
  {
    handle: "jupiteraxis",
    provider: "Jupiter",
    bank: "Axis Bank",
    kind: "psp",
  },
  { handle: "axisb", provider: "CRED", bank: "Axis Bank", kind: "psp" },
  {
    handle: "superyes",
    provider: "super.money",
    bank: "Yes Bank",
    kind: "psp",
  },
  {
    handle: "abfspay",
    provider: "Aditya Birla Capital",
    bank: "Aditya Birla Finance",
    kind: "psp",
  },
  {
    handle: "freecharge",
    provider: "Freecharge",
    bank: "Axis Bank",
    kind: "psp",
  },
  {
    handle: "airtel",
    provider: "Airtel Payments Bank",
    bank: "Airtel Payments Bank",
    kind: "psp",
  },

  // ── Bank-issued handles ────────────────────────────────────────────────────
  {
    handle: "sbi",
    provider: "SBI (BHIM SBI Pay)",
    bank: "State Bank of India",
    kind: "bank",
  },
  {
    handle: "hdfcbank",
    provider: "HDFC Bank (PayZapp)",
    bank: "HDFC Bank",
    kind: "bank",
  },
  {
    handle: "icici",
    provider: "ICICI Bank (iMobile)",
    bank: "ICICI Bank",
    kind: "bank",
  },
  {
    handle: "axisbank",
    provider: "Axis Bank",
    bank: "Axis Bank",
    kind: "bank",
  },
  {
    handle: "kotak",
    provider: "Kotak Mahindra Bank",
    bank: "Kotak Mahindra Bank",
    kind: "bank",
  },
  {
    handle: "idfcbank",
    provider: "IDFC FIRST Bank",
    bank: "IDFC FIRST Bank",
    kind: "bank",
  },
  { handle: "yesbank", provider: "Yes Bank", bank: "Yes Bank", kind: "bank" },
  {
    handle: "pnb",
    provider: "Punjab National Bank",
    bank: "Punjab National Bank",
    kind: "bank",
  },
  {
    handle: "uboi",
    provider: "Union Bank of India",
    bank: "Union Bank of India",
    kind: "bank",
  },
  {
    handle: "unionbank",
    provider: "Union Bank of India",
    bank: "Union Bank of India",
    kind: "bank",
  },
  {
    handle: "barodampay",
    provider: "Bank of Baroda",
    bank: "Bank of Baroda",
    kind: "bank",
  },
  {
    handle: "cnrb",
    provider: "Canara Bank",
    bank: "Canara Bank",
    kind: "bank",
  },
  {
    handle: "federal",
    provider: "Federal Bank",
    bank: "Federal Bank",
    kind: "bank",
  },
  {
    handle: "indus",
    provider: "IndusInd Bank",
    bank: "IndusInd Bank",
    kind: "bank",
  },
  { handle: "rbl", provider: "RBL Bank", bank: "RBL Bank", kind: "bank" },
  { handle: "idbi", provider: "IDBI Bank", bank: "IDBI Bank", kind: "bank" },
  {
    handle: "mahb",
    provider: "Bank of Maharashtra",
    bank: "Bank of Maharashtra",
    kind: "bank",
  },
  {
    handle: "sib",
    provider: "South Indian Bank",
    bank: "South Indian Bank",
    kind: "bank",
  },
  { handle: "uco", provider: "UCO Bank", bank: "UCO Bank", kind: "bank" },
  {
    handle: "dbs",
    provider: "DBS Bank India",
    bank: "DBS Bank India",
    kind: "bank",
  },
  { handle: "jkb", provider: "J&K Bank", bank: "J&K Bank", kind: "bank" },
  {
    handle: "kbl",
    provider: "Karnataka Bank",
    bank: "Karnataka Bank",
    kind: "bank",
  },
  {
    handle: "dlb",
    provider: "Dhanlaxmi Bank",
    bank: "Dhanlaxmi Bank",
    kind: "bank",
  },
] as const;

const HANDLE_INDEX: ReadonlyMap<string, UpiHandle> = new Map(
  UPI_HANDLES.map((h) => [h.handle, h]),
);

/** Look up a handle (with or without the leading `@`). Case-insensitive. */
export function lookupHandle(handle: string): UpiHandle | undefined {
  return HANDLE_INDEX.get(handle.replace(/^@/, "").toLowerCase());
}

/**
 * Handles whose name starts with `prefix`, ranked so that shorter (and
 * therefore more likely) handles come first. Used to drive autocomplete.
 */
export function searchHandles(prefix: string, limit = 8): UpiHandle[] {
  const q = prefix.replace(/^@/, "").toLowerCase();
  const pool = q
    ? UPI_HANDLES.filter((h) => h.handle.startsWith(q))
    : UPI_HANDLES.filter((h) => h.kind === "psp");

  return [...pool]
    .sort(
      (a, b) =>
        a.handle.length - b.handle.length || a.handle.localeCompare(b.handle),
    )
    .slice(0, limit);
}
