"use client";

import * as React from "react";
import {
  AadhaarInput,
  ABHAInput,
  AddressForm,
  ARNInput,
  AmountInput,
  AmountInWords,
  BankAccountInput,
  ChequeNumberInput,
  CINInput,
  CKYCInput,
  CVVInput,
  CardExpiryInput,
  CardNumberInput,
  ConsentCheckbox,
  CopyableId,
  DematInput,
  DINInput,
  DOBInput,
  DrivingLicenceInput,
  ESICInput,
  EWayBillInput,
  FCRAInput,
  FSSAIInput,
  GSTINInput,
  HSNInput,
  IECInput,
  IFSCInput,
  IRNInput,
  ISINInput,
  LEIInput,
  LLPINInput,
  LPGConsumerInput,
  MaskedValue,
  MICRInput,
  MobileInput,
  OTPInput,
  PANInput,
  PassportInput,
  PincodeInput,
  PRANInput,
  RationCardInput,
  RERAInput,
  RRNInput,
  StateSelect,
  SWIFTInput,
  TANInput,
  TINInput,
  UANInput,
  UdyamInput,
  UMRNInput,
  UPIInput,
  UTRInput,
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
  LEIInput: <LEIInput label="LEI" defaultValue="5493001KJTIIGC8Y1R12" />,
  ISINInput: <ISINInput label="ISIN" defaultValue="INE002A01018" />,
  MICRInput: <MICRInput label="MICR" defaultValue="560002007" />,
  DematInput: <DematInput label="Demat account" defaultValue="IN30012345678901" />,
  SWIFTInput: <SWIFTInput label="SWIFT / BIC" defaultValue="HDFCINBB" />,
  CKYCInput: <CKYCInput label="CKYC number" defaultValue="12345678901234" />,
  UTRInput: <UTRInput label="UTR" defaultValue="123456789012" />,

  ABHAInput: <ABHAInput label="ABHA number" defaultValue="91123456789012" />,
  UANInput: <UANInput label="UAN" defaultValue="100123456789" />,
  ESICInput: <ESICInput label="ESIC number" defaultValue="31001234560000101" />,
  PRANInput: <PRANInput label="PRAN" defaultValue="110012345678" />,
  RationCardInput: <RationCardInput label="Ration card" defaultValue="RJ12345678901" />,

  DINInput: <DINInput label="DIN" defaultValue="01234567" />,
  LLPINInput: <LLPINInput label="LLPIN" defaultValue="AAB1234" />,
  FCRAInput: <FCRAInput label="FCRA registration" defaultValue="123456789" />,
  IECInput: <IECInput label="IEC" defaultValue="ABCPE1234F" />,
  RERAInput: <RERAInput label="RERA registration" defaultValue="PRMKARERA1251446PR123456" />,
  TINInput: <TINInput label="TIN (legacy)" defaultValue="29123456789" />,

  UMRNInput: <UMRNInput label="UMRN" defaultValue="HDFC0000012345678901" />,
  ChequeNumberInput: <ChequeNumberInput label="Cheque number" defaultValue="123456" />,
  EWayBillInput: <EWayBillInput label="E-way bill" defaultValue="123456789012" />,
  ARNInput: <ARNInput label="GST ARN" defaultValue="AA0701190003081" />,
  RRNInput: <RRNInput label="RRN" defaultValue="123456789012" />,
  IRNInput: (
    <IRNInput
      label="IRN"
      defaultValue="e7e2e5a0b1c3d4f5061728394a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e"
    />
  ),
  LPGConsumerInput: <LPGConsumerInput label="LPG consumer ID" defaultValue="12345678901234567" />,
};
