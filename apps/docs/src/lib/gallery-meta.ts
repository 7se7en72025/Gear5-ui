/**
 * Gallery metadata — deliberately NOT a "use client" module.
 *
 * The landing page is a server component and needs the component count. When a
 * server component imports a value from a "use client" module it receives a
 * client-reference proxy, not the value, so `GALLERY.length` silently reads 0.
 * Keeping the data here and the JSX demos in the client module avoids that.
 */

export type Category =
  | "Identity & KYC"
  | "Banking & money"
  | "Business & tax"
  | "Contact & address"
  | "Health & welfare"
  | "References"
  | "Display & utilities";

export const CATEGORIES: Category[] = [
  "Identity & KYC",
  "Banking & money",
  "Business & tax",
  "Contact & address",
  "Health & welfare",
  "References",
  "Display & utilities",
];

export interface GalleryMeta {
  name: string;
  category: Category;
  /** Registry item to install — several components share one item. */
  registry: string;
  /** The one-line reason this component exists. */
  why: string;
}

export const GALLERY_META: GalleryMeta[] = [
  // ── Identity & KYC ───────────────────────────────────────────────────────
  { name: "UPIInput", category: "Identity & KYC", registry: "upi-input",
    why: "Type @ for ranked handle suggestions; resolves the app and settling bank." },
  { name: "PANInput", category: "Identity & KYC", registry: "pan-input",
    why: "Decodes the 4th character into the holder type. The checksum isn't public — we don't pretend." },
  { name: "AadhaarInput", category: "Identity & KYC", registry: "aadhaar-input",
    why: "Real Verhoeff checksum, masked on blur because the DPDP Act treats it as sensitive." },
  { name: "DOBInput", category: "Identity & KYC", registry: "dob-input",
    why: "Parses DD/MM/YYYY itself — new Date() would read 03/08 as 8 March." },
  { name: "VoterIdInput", category: "Identity & KYC", registry: "gov-id-inputs",
    why: "EPIC number — three letters, seven digits." },
  { name: "DrivingLicenceInput", category: "Identity & KYC", registry: "gov-id-inputs",
    why: "Decodes the issuing state and year from the licence number." },
  { name: "PassportInput", category: "Identity & KYC", registry: "gov-id-inputs",
    why: "Knows Q, X and Z never lead an Indian passport number." },
  { name: "VehicleNumberInput", category: "Identity & KYC", registry: "vehicle-number-input",
    why: "Handles the Bharat (BH) series that most insurance forms still reject." },

  // ── Banking & money ──────────────────────────────────────────────────────
  { name: "AmountInput", category: "Banking & money", registry: "amount-input",
    why: "₹12,34,567 — not ₹1,234,567. Paise handled as integers to dodge float drift." },
  { name: "AmountInWords", category: "Banking & money", registry: "amount-in-words",
    why: "Lakh and crore phrasing, as required on cheques and invoices." },
  { name: "IFSCInput", category: "Banking & money", registry: "ifsc-input",
    why: "Names the bank as you type. The 5th character is always 0 — the most common typo." },
  { name: "BankAccountInput", category: "Banking & money", registry: "bank-account-input",
    why: "No checksum exists, so it asks twice — and blocks paste on the confirmation." },
  { name: "CardNumberInput", category: "Banking & money", registry: "card-inputs",
    why: "Luhn plus RuPay BIN detection, which most card libraries miss entirely. The CVV length follows the detected network." },
  { name: "CardExpiryInput", category: "Banking & money", registry: "card-inputs",
    why: "A card is valid through the last day of its expiry month — an off-by-one that rejects live cards." },
  { name: "CVVInput", category: "Banking & money", registry: "card-inputs",
    why: "Masked as a password so it never lands in a screenshot, and four digits for Amex." },

  // ── Business & tax ───────────────────────────────────────────────────────
  { name: "GSTINInput", category: "Business & tax", registry: "gstin-input",
    why: "The published mod-36 checksum, plus a cross-check against the embedded PAN." },
  { name: "TANInput", category: "Business & tax", registry: "business-id-inputs",
    why: "Tax deduction account number, AAAA99999A." },
  { name: "CINInput", category: "Business & tax", registry: "business-id-inputs",
    why: "21 characters decoded offline: listing status, state, year, company class." },
  { name: "UdyamInput", category: "Business & tax", registry: "business-id-inputs",
    why: "MSME registration, with hyphens re-inserted as you type." },
  { name: "HSNInput", category: "Business & tax", registry: "business-id-inputs",
    why: "2, 4, 6 or 8 digits — never 3, 5 or 7. Names the level." },
  { name: "FSSAIInput", category: "Business & tax", registry: "business-id-inputs",
    why: "14 digits, starting 1 for a registration or 2 for a licence." },

  // ── Contact & address ────────────────────────────────────────────────────
  { name: "MobileInput", category: "Contact & address", registry: "mobile-input",
    why: "Strips +91, 0091 and leading zeroes, so any pasted shape just works." },
  { name: "OTPInput", category: "Contact & address", registry: "otp-input",
    why: "Paste-aware, one-time-code autofill, arrow keys and backspace all handled." },
  { name: "PincodeInput", category: "Contact & address", registry: "pincode-input",
    why: "Derives the postal zone offline while a city lookup is still in flight." },
  { name: "StateSelect", category: "Contact & address", registry: "state-select",
    why: "All 36 states and UTs, searchable, as a proper APG combobox." },
  { name: "AddressForm", category: "Contact & address", registry: "address-form",
    why: "PIN code before city and state — the order that lets a lookup fill the rest." },

  // ── Display & utilities ──────────────────────────────────────────────────
  { name: "MaskedValue", category: "Display & utilities", registry: "masked-value",
    why: "Keeps identifiers out of screenshots and screen shares until asked for." },
  { name: "CopyableId", category: "Display & utilities", registry: "copyable-id",
    why: "Reference numbers users have to quote back to support." },
  { name: "ConsentCheckbox", category: "Display & utilities", registry: "consent-checkbox",
    why: "Makes DPDP purpose, sharing and retention required props — not optional prose." },
  { name: "ValidationSummary", category: "Display & utilities", registry: "validation-summary",
    why: "Without it, a failed submit tells a screen reader user nothing." },

  // ── Markets & banking (wave 3) ───────────────────────────────────────────
  { name: "LEIInput", category: "Banking & money", registry: "market-id-inputs",
    why: "ISO 7064 mod-97 checksum \u2014 verified against S&P Global's real LEI." },
  { name: "ISINInput", category: "Banking & money", registry: "market-id-inputs",
    why: "ISO 6166 check digit, verified against Reliance, Apple and BAE. Badges Indian securities." },
  { name: "MICRInput", category: "Banking & money", registry: "market-id-inputs",
    why: "The nine digits along the bottom of a cheque, split into city/bank/branch." },
  { name: "DematInput", category: "Banking & money", registry: "market-id-inputs",
    why: "Tells NSDL and CDSL apart \u2014 they have genuinely different formats." },
  { name: "SWIFTInput", category: "Banking & money", registry: "market-id-inputs",
    why: "8 characters means head office, 11 means a specific branch." },
  { name: "CKYCInput", category: "Banking & money", registry: "market-id-inputs",
    why: "Central KYC Registry number \u2014 14 digits." },
  { name: "UTRInput", category: "References", registry: "market-id-inputs",
    why: "Infers the rail from length: 12 is UPI, 16 IMPS, 22 NEFT/RTGS." },

  // ── Health & welfare ─────────────────────────────────────────────────────
  { name: "ABHAInput", category: "Health & welfare", registry: "health-id-inputs",
    why: "Health data under DPDP. 14 digits \u2014 and we don't claim a checksum NHA never published." },
  { name: "UANInput", category: "Health & welfare", registry: "health-id-inputs",
    why: "The EPFO number that follows a member across employers." },
  { name: "ESICInput", category: "Health & welfare", registry: "health-id-inputs",
    why: "Employees' State Insurance number, 17 digits." },
  { name: "PRANInput", category: "Health & welfare", registry: "health-id-inputs",
    why: "National Pension System account number." },
  { name: "RationCardInput", category: "Health & welfare", registry: "health-id-inputs",
    why: "Format genuinely differs per state, so validation stays deliberately loose." },

  // ── Corporate & compliance ───────────────────────────────────────────────
  { name: "DINInput", category: "Business & tax", registry: "corporate-id-inputs",
    why: "Director Identification Number \u2014 8 digits, one per person for life." },
  { name: "LLPINInput", category: "Business & tax", registry: "corporate-id-inputs",
    why: "Three letters then four digits, hyphenated as you type." },
  { name: "FCRAInput", category: "Business & tax", registry: "corporate-id-inputs",
    why: "Required of any NGO taking foreign contributions." },
  { name: "IECInput", category: "Business & tax", registry: "corporate-id-inputs",
    why: "Since 2021 an IEC just is the PAN. Pre-2021 regexes still expect 10 digits and reject every modern one." },
  { name: "RERAInput", category: "Business & tax", registry: "corporate-id-inputs",
    why: "Per-state authority formats, so this stays permissive on purpose." },
  { name: "TINInput", category: "Business & tax", registry: "corporate-id-inputs",
    why: "Pre-GST taxpayer number \u2014 still on historical invoices and in ledger migrations." },

  // ── Payment & document references ────────────────────────────────────────
  { name: "UMRNInput", category: "References", registry: "transaction-id-inputs",
    why: "The e-NACH mandate reference every lending product shows when cancelling an auto-debit." },
  { name: "ChequeNumberInput", category: "References", registry: "transaction-id-inputs",
    why: "Six digits, bottom-left of the leaf." },
  { name: "EWayBillInput", category: "References", registry: "transaction-id-inputs",
    why: "12 digits. Widely rumoured to have a check digit \u2014 GSTN never published one." },
  { name: "ARNInput", category: "References", registry: "transaction-id-inputs",
    why: "How a pending GST registration is tracked." },
  { name: "RRNInput", category: "References", registry: "transaction-id-inputs",
    why: "What a bank asks for when you dispute a card transaction." },
  { name: "IRNInput", category: "References", registry: "transaction-id-inputs",
    why: "A SHA-256 from the Invoice Registration Portal \u2014 not a number, despite the name." },
  { name: "LPGConsumerInput", category: "References", registry: "transaction-id-inputs",
    why: "Length differs by distributor, so the accepted range is wide." },
];

export const COMPONENT_COUNT = GALLERY_META.length;
