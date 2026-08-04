"use client";

import * as React from "react";
import {
  AadhaarInput,
  AddressForm,
  AmountInput,
  AmountInWords,
  BankAccountInput,
  CINInput,
  CVVInput,
  CardExpiryInput,
  CardNumberInput,
  ConsentCheckbox,
  CopyableId,
  DOBInput,
  DrivingLicenceInput,
  FSSAIInput,
  GSTINInput,
  HSNInput,
  IFSCInput,
  MaskedValue,
  MobileInput,
  OTPInput,
  PANInput,
  PassportInput,
  PincodeInput,
  StateSelect,
  TANInput,
  UPIInput,
  UdyamInput,
  ValidationSummary,
  VehicleNumberInput,
  VoterIdInput,
} from "bharat-ui";

/** A stateful amount demo, since the words update from the field. */
function AmountWordsDemo() {
  const [value, setValue] = React.useState("125000");
  return (
    <div className="space-y-2">
      <AmountInput value={value} onValueChange={setValue} label="Amount" />
      <AmountInWords value={value} />
    </div>
  );
}

/** Card fields wired together — the CVV length follows the detected network. */
function CardDemo() {
  const [cvvLength, setCvvLength] = React.useState(3);
  return (
    <div className="space-y-2">
      <CardNumberInput
        label="Card number"
        defaultValue="6521111111111110"
        onValidationChange={(r) => setCvvLength(r.cvvLength ?? 3)}
      />
      <div className="grid grid-cols-2 gap-2">
        <CardExpiryInput label="Expiry" defaultValue="12/29" />
        <CVVInput label="CVV" length={cvvLength} />
      </div>
    </div>
  );
}

/**
 * Live demo for each component, keyed by name. Kept separate from
 * `gallery-meta.ts` so the server-rendered page can read the metadata without
 * crossing the client boundary.
 */
export const DEMOS: Record<string, React.ReactNode> = {
  UPIInput: <UPIInput label="UPI ID" defaultValue="9876543210@ybl" />,
  PANInput: <PANInput label="PAN" defaultValue="ABCPE1234F" />,
  AadhaarInput: <AadhaarInput label="Aadhaar" defaultValue="234567890124" />,
  DOBInput: <DOBInput label="Date of birth" defaultValue="03/08/2004" minAge={18} />,
  VoterIdInput: <VoterIdInput label="Voter ID" defaultValue="ABC1234567" />,
  DrivingLicenceInput: (
    <DrivingLicenceInput label="Driving licence" defaultValue="MH1220110012345" />
  ),
  PassportInput: <PassportInput label="Passport" defaultValue="A1234567" />,
  VehicleNumberInput: (
    <VehicleNumberInput label="Registration" defaultValue="MH12AB1234" />
  ),

  AmountInput: <AmountInput label="Amount" defaultValue="1234567" />,
  AmountInWords: <AmountWordsDemo />,
  IFSCInput: <IFSCInput label="IFSC" defaultValue="HDFC0001234" />,
  BankAccountInput: (
    <BankAccountInput label="Account number" defaultValue="123456789012" />
  ),
  CardNumberInput: <CardDemo />,
  CardExpiryInput: <CardExpiryInput label="Expiry" defaultValue="12/29" />,
  CVVInput: <CVVInput label="CVV" defaultValue="123" />,

  GSTINInput: <GSTINInput label="GSTIN" defaultValue="27AAPFU0939F1ZV" />,
  TANInput: <TANInput label="TAN" defaultValue="MUMA12345B" />,
  CINInput: <CINInput label="CIN" defaultValue="U72200KA2013PTC098765" />,
  UdyamInput: <UdyamInput label="Udyam" defaultValue="UDYAMKR030000001" />,
  HSNInput: <HSNInput label="HSN / SAC" defaultValue="998314" />,
  FSSAIInput: <FSSAIInput label="FSSAI licence" defaultValue="12345678901234" />,

  MobileInput: <MobileInput label="Mobile" defaultValue="9876543210" />,
  OTPInput: <OTPInput label="Enter OTP" defaultValue="1234" />,
  PincodeInput: <PincodeInput label="PIN code" defaultValue="560001" />,
  StateSelect: <StateSelect label="State" defaultValue="KA" />,
  AddressForm: <AddressForm />,

  MaskedValue: (
    <div className="space-y-2">
      <MaskedValue label="Aadhaar" value="234567890124" preset="aadhaar" />
      <MaskedValue label="PAN" value="ABCPE1234F" preset="pan" copyable />
    </div>
  ),
  CopyableId: (
    <CopyableId label="Transaction ID" value="UTR2026080312345678" hint="NEFT" />
  ),
  ConsentCheckbox: (
    <ConsentCheckbox
      purpose="Verifying your identity to open an account"
      sharedWith="Our KYC partner (Signzy)"
      retention="8 years, as required by the RBI"
    >
      I agree to share my Aadhaar and PAN for verification.
    </ConsentCheckbox>
  ),
  ValidationSummary: (
    <ValidationSummary
      focusOnAppear={false}
      issues={[
        { fieldId: "demo-pan", label: "PAN", message: "A PAN is 10 characters." },
        {
          fieldId: "demo-ifsc",
          label: "IFSC",
          message: "The 5th character is always 0.",
        },
      ]}
    />
  ),
};
