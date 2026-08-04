/**
 * Generates registry.json from a single manifest.
 *
 * Each item is deliberately self-contained: it ships field.tsx, every sibling
 * component it imports, and every lib it imports. Cross-item
 * `registryDependencies` need absolute URLs for a custom registry, which breaks
 * the moment you test against localhost. Duplicating a few small shared files
 * is the cheaper failure mode — worst case a second install rewrites an
 * identical file.
 *
 * `pnpm registry:manifest` regenerates this; `pnpm registry:build` compiles it
 * into apps/docs/public/r. CI fails if either output has drifted.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * name, component file, sibling components it imports, libs it imports,
 * title, description.
 */
const ITEMS = [
  // ── Identity & KYC ───────────────────────────────────────────────────────
  { name: "upi-input", file: "upi-input.tsx", libs: ["upi.ts", "upi-handles.ts"],
    title: "UPI Input",
    description: "UPI ID field with live VPA validation, handle autocomplete and provider detection." },
  { name: "pan-input", file: "pan-input.tsx", libs: ["pan.ts"],
    title: "PAN Input",
    description: "PAN field validating structure and decoding the holder type." },
  { name: "aadhaar-input", file: "aadhaar-input.tsx", libs: ["aadhaar.ts"],
    title: "Aadhaar Input",
    description: "Aadhaar field with a real Verhoeff checksum, masked by default." },
  { name: "dob-input", file: "dob-input.tsx", libs: ["dob.ts"],
    title: "Date of Birth Input",
    description: "DD/MM/YYYY date of birth with age and minimum-age checks." },
  { name: "vehicle-number-input", file: "vehicle-number-input.tsx", libs: ["vehicle.ts"],
    title: "Vehicle Number Input",
    description: "Registration number supporting both state and Bharat (BH) series." },
  { name: "gov-id-inputs", file: "gov-id-inputs.tsx",
    components: ["identifier-input.tsx"], libs: ["gov-ids.ts", "vehicle.ts"],
    title: "Government ID Inputs",
    description: "Voter ID (EPIC), driving licence and passport fields." },

  // ── Banking & money ──────────────────────────────────────────────────────
  { name: "amount-input", file: "amount-input.tsx", libs: ["amount.ts"],
    title: "Amount Input",
    description: "Rupee amount field using Indian digit grouping — ₹12,34,567." },
  { name: "amount-in-words", file: "amount-in-words.tsx", libs: ["amount.ts", "words.ts"],
    title: "Amount In Words",
    description: "Amount spelled out in Indian English, with lakh and crore." },
  { name: "ifsc-input", file: "ifsc-input.tsx", libs: ["ifsc.ts"],
    title: "IFSC Input",
    description: "IFSC field that names the bank as you type." },
  { name: "bank-account-input", file: "bank-account-input.tsx", libs: ["bank-account.ts"],
    title: "Bank Account Input",
    description: "Account number with a paste-blocked confirmation field." },
  { name: "card-inputs", file: "card-inputs.tsx", libs: ["card.ts"],
    title: "Card Inputs",
    description: "Card number, expiry and CVV — Luhn checked, with RuPay detection." },

  // ── Business & tax ───────────────────────────────────────────────────────
  { name: "gstin-input", file: "gstin-input.tsx", libs: ["gstin.ts", "pan.ts"],
    title: "GSTIN Input",
    description: "GSTIN with the published checksum and a PAN cross-check." },
  { name: "business-id-inputs", file: "business-id-inputs.tsx",
    components: ["identifier-input.tsx"],
    libs: ["business-ids.ts", "gov-ids.ts", "vehicle.ts"],
    title: "Business ID Inputs",
    description: "TAN, CIN, Udyam, HSN/SAC and FSSAI fields." },

  // ── Contact & address ────────────────────────────────────────────────────
  { name: "mobile-input", file: "mobile-input.tsx", libs: ["mobile.ts"],
    title: "Mobile Input",
    description: "Indian mobile field that strips +91, 0091 and leading zeroes." },
  { name: "otp-input", file: "otp-input.tsx", libs: [],
    title: "OTP Input",
    description: "Segmented one-time-code field with paste, autofill and keyboard support." },
  { name: "pincode-input", file: "pincode-input.tsx", libs: ["pincode.ts"],
    title: "Pincode Input",
    description: "PIN code field that derives the postal zone offline." },
  { name: "state-select", file: "state-select.tsx", libs: ["states.ts"],
    title: "State Select",
    description: "Searchable picker for all 36 states and union territories." },
  { name: "address-form", file: "address-form.tsx",
    // Composes both of these, so they have to ship with it.
    components: ["pincode-input.tsx", "state-select.tsx"],
    libs: ["states.ts", "pincode.ts"],
    title: "Address Form",
    description: "Full Indian address, PIN-code first so a lookup can fill the rest." },

  // ── Display & form utilities ─────────────────────────────────────────────
  { name: "masked-value", file: "masked-value.tsx", libs: [],
    title: "Masked Value",
    description: "Sensitive identifier shown masked, with opt-in reveal and copy." },
  { name: "copyable-id", file: "copyable-id.tsx", libs: [],
    title: "Copyable ID",
    description: "Read-only reference number with a copy button." },
  { name: "consent-checkbox", file: "consent-checkbox.tsx", libs: [],
    title: "Consent Checkbox",
    description: "DPDP-shaped consent requiring purpose, sharing and retention." },
  { name: "validation-summary", file: "validation-summary.tsx", libs: [],
    title: "Validation Summary",
    description: "Form-level error summary that focuses on submit and links to fields." },
  { name: "identifier-input", file: "identifier-input.tsx", libs: [],
    title: "Identifier Input",
    description: "Generic base for fixed-format identifier fields." },

  // ── Health, pension & welfare ────────────────────────────────────────────
  { name: "health-id-inputs", file: "health-id-inputs.tsx",
    components: ["identifier-input.tsx"], libs: ["health-ids.ts", "gov-ids.ts", "vehicle.ts"],
    title: "Health & Pension ID Inputs",
    description: "ABHA, UAN, ESIC, PRAN and ration card fields." },

  // ── Capital markets & banking ────────────────────────────────────────────
  { name: "market-id-inputs", file: "market-id-inputs.tsx",
    components: ["identifier-input.tsx"], libs: ["market-ids.ts", "gov-ids.ts", "vehicle.ts"],
    title: "Markets & Banking ID Inputs",
    description: "LEI and ISIN with real checksums, plus MICR, demat, SWIFT, CKYC and UTR." },

  // ── Corporate & compliance ───────────────────────────────────────────────
  { name: "corporate-id-inputs", file: "corporate-id-inputs.tsx",
    components: ["identifier-input.tsx"],
    libs: ["corporate-ids.ts", "gov-ids.ts", "pan.ts", "vehicle.ts"],
    title: "Corporate ID Inputs",
    description: "DIN, LLPIN, FCRA, IEC, RERA and legacy TIN fields." },

  // ── Payment & document references ────────────────────────────────────────
  { name: "transaction-id-inputs", file: "transaction-id-inputs.tsx",
    components: ["identifier-input.tsx"], libs: ["transaction-ids.ts", "gov-ids.ts", "vehicle.ts"],
    title: "Transaction Reference Inputs",
    description: "UMRN, cheque number, e-way bill, ARN, RRN, IRN and LPG consumer ID." },
];

const uiFile = (file) => ({
  path: `packages/ui/src/components/ui/${file}`,
  type: "registry:ui",
  target: `components/ui/${file}`,
});

const libFile = (lib) => ({
  path: `packages/ui/src/lib/${lib}`,
  type: "registry:lib",
  target: `lib/${lib}`,
});

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "bharat-ui",
  homepage: "https://bharat-ui.vercel.app",
  items: ITEMS.map((item) => ({
    name: item.name,
    type: "registry:ui",
    title: item.title,
    description: item.description,
    dependencies: ["lucide-react", "clsx", "tailwind-merge"],
    files: [
      uiFile(item.file),
      // field.tsx carries cn(), the aria wiring and useFieldState — every
      // component needs it, so it ships with every item.
      ...(item.file === "field.tsx" ? [] : [uiFile("field.tsx")]),
      ...(item.components ?? []).map(uiFile),
      ...item.libs.map(libFile),
    ],
  })),
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Every relative import inside a shipped file must itself be shipped by the
 * same item, or the install lands broken in the consumer's project. This is
 * exactly the class of bug that doesn't show up in the docs app, because there
 * the whole source tree is present.
 */
function verify() {
  const problems = [];

  for (const item of registry.items) {
    const shipped = new Set(item.files.map((f) => f.target));

    for (const file of item.files) {
      const source = readFileSync(resolve(root, file.path), "utf8");
      const imports = [...source.matchAll(/from\s+"(\.[^"]+)"/g)].map((m) => m[1]);

      for (const spec of imports) {
        // Resolve the specifier against the file's *target* location, which is
        // where it will actually sit in the consumer's project.
        const fromDir = dirname(file.target);
        const base = resolve("/", fromDir, spec).slice(1);
        const candidates = [`${base}.ts`, `${base}.tsx`];

        if (!candidates.some((c) => shipped.has(c))) {
          problems.push(`${item.name}: ${file.target} imports "${spec}" — not shipped`);
        }
      }
    }
  }

  if (problems.length > 0) {
    console.error("Registry items have unresolved imports:\n");
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
}

writeFileSync(resolve(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
verify();

console.log(
  `Wrote registry.json with ${registry.items.length} items; all imports resolve.`,
);
