<div align="center">

# bharat-ui

**The form primitives Indian fintech keeps rebuilding.**

30 React components for UPI, PAN, Aadhaar, GSTIN, IFSC, RuPay and more — install them with the
shadcn CLI so the code lands in your repo and stays yours, or use the npm package.

[Docs & live playground](https://bharat-ui.vercel.app) · [Contributing](CONTRIBUTING.md) · MIT

</div>

---

## Why

Every Indian product rewrites the same handful of form fields, and most get the
validation subtly wrong — amount fields that group digits as `1,234,567` instead of
`12,34,567`, UPI fields that reject a perfectly good VPA because the regex predates the
PSP, PAN fields that check length and nothing else.

These are those fields, done properly, with the reasoning written down.

## Install

Copy the source into your project (recommended — you own it, you can edit it):

```bash
npx shadcn@latest add https://bharat-ui.vercel.app/r/upi-input.json
```

Or install as a package:

```bash
pnpm add bharat-ui
```

## Usage

```tsx
import { UPIInput } from "bharat-ui";

export function PayoutForm() {
  return (
    <UPIInput
      label="UPI ID"
      description="Where should we send your payout?"
      onValidationChange={(result) => {
        if (result.valid) console.log(result.normalized, result.provider);
      }}
    />
  );
}
```

The validation logic has no React dependency and can be used on its own:

```ts
import { validateVpa, isPhoneVpa } from "bharat-ui";

validateVpa("9876543210@ybl");
// {
//   valid: true,
//   normalized: "9876543210@ybl",
//   local: "9876543210",
//   handle: "ybl",
//   provider: { provider: "PhonePe", bank: "Yes Bank", kind: "psp" },
//   unrecognisedHandle: false,
// }

validateVpa("raiyyan.paytm");
// { valid: false, error: { code: "missing_at", message: "A UPI ID needs an @ — like name@bank." } }

isPhoneVpa("9876543210@ybl"); // true — show a numeric keypad
```

## What it does

| | |
|---|---|
| **Structural validation** | Length and character rules per segment, with a specific error code and message for each failure mode. |
| **Handle autocomplete** | Type `@` and get ranked suggestions from a registry of 50+ handles, as an accessible combobox. |
| **Provider detection** | Resolves `@ybl` → PhonePe, settling through Yes Bank. |
| **Accessible by default** | APG combobox pattern — `aria-expanded`, `aria-activedescendant`, `role="alert"` on errors, full keyboard support. |

## What it deliberately does not do

**It cannot tell you whether a UPI ID exists.** That requires NPCI, reached through your
PSP's ValidateVPA endpoint. Everything here is structural — it catches typos, not
fictional accounts. Always verify server-side before you move money.

**It will not reject an unfamiliar handle.** New PSPs launch constantly and the registry
is maintained by hand, so an unknown handle is surfaced as a hint, not an error. Your
users should never be blocked because this dataset went stale.

## Components

**Identity & KYC** — `UPIInput` `PANInput` `AadhaarInput` `DOBInput` `VoterIdInput`
`DrivingLicenceInput` `PassportInput` `VehicleNumberInput`

**Banking & money** — `AmountInput` `AmountInWords` `IFSCInput` `BankAccountInput`
`CardNumberInput` `CardExpiryInput` `CVVInput`

**Business & tax** — `GSTINInput` `TANInput` `CINInput` `UdyamInput` `HSNInput`
`FSSAIInput`

**Contact & address** — `MobileInput` `OTPInput` `PincodeInput` `StateSelect`
`AddressForm`

**Display & utilities** — `MaskedValue` `CopyableId` `ConsentCheckbox`
`ValidationSummary`

### Which checksums actually run

| Identifier | Algorithm | Verified offline |
|---|---|---|
| Aadhaar | Verhoeff (dihedral group D5) | yes |
| GSTIN | Weighted mod-36 | yes |
| Card number | Luhn (mod 10), plus RuPay BIN detection | yes |
| PAN | 10th-character check digit | **no — the algorithm isn't public** |
| IFSC, account no., Voter ID, passport | none exist | structural only |

## Contributing

The handle registry is only as good as its contributors — **corrections and additions
are the single most useful PR you can send.** See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
