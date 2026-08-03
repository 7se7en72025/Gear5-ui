// ── Shared primitives ──────────────────────────────────────────────────────

// ── Identity & KYC ─────────────────────────────────────────────────────────
export {
  AadhaarInput,
  type AadhaarInputProps,
} from "./components/ui/aadhaar-input";
// ── Contact & address ──────────────────────────────────────────────────────
export {
  AddressForm,
  type AddressFormProps,
  EMPTY_ADDRESS,
  type IndianAddress,
} from "./components/ui/address-form";
export {
  AmountInWords,
  type AmountInWordsProps,
} from "./components/ui/amount-in-words";
// ── Banking & money ────────────────────────────────────────────────────────
export {
  AmountInput,
  type AmountInputProps,
} from "./components/ui/amount-input";
export {
  BankAccountInput,
  type BankAccountInputProps,
} from "./components/ui/bank-account-input";
// ── Business & tax ─────────────────────────────────────────────────────────
export {
  CINInput,
  type CINInputProps,
  FSSAIInput,
  type FSSAIInputProps,
  HSNInput,
  type HSNInputProps,
  TANInput,
  type TANInputProps,
  UdyamInput,
  type UdyamInputProps,
} from "./components/ui/business-id-inputs";
export {
  CardExpiryInput,
  type CardExpiryInputProps,
  CardNumberInput,
  type CardNumberInputProps,
  CVVInput,
  type CVVInputProps,
} from "./components/ui/card-inputs";
// ── Display & form utilities ───────────────────────────────────────────────
export {
  ConsentCheckbox,
  type ConsentCheckboxProps,
} from "./components/ui/consent-checkbox";
export {
  CopyableId,
  type CopyableIdProps,
} from "./components/ui/copyable-id";
export { DOBInput, type DOBInputProps } from "./components/ui/dob-input";
export {
  cn,
  controlClasses,
  Field,
  FieldBadge,
  type FieldProps,
  type FieldTone,
  useFieldState,
  type ValidationLike,
} from "./components/ui/field";
export {
  DrivingLicenceInput,
  type DrivingLicenceInputProps,
  PassportInput,
  type PassportInputProps,
  VoterIdInput,
  type VoterIdInputProps,
} from "./components/ui/gov-id-inputs";
export { GSTINInput, type GSTINInputProps } from "./components/ui/gstin-input";
export {
  IdentifierInput,
  type IdentifierInputProps,
} from "./components/ui/identifier-input";
export { IFSCInput, type IFSCInputProps } from "./components/ui/ifsc-input";
export {
  MaskedValue,
  type MaskedValueProps,
  type MaskPreset,
} from "./components/ui/masked-value";
export {
  MobileInput,
  type MobileInputProps,
} from "./components/ui/mobile-input";
export {
  OTPInput,
  type OTPInputProps,
  type OtpResult,
} from "./components/ui/otp-input";
export { PANInput, type PANInputProps } from "./components/ui/pan-input";
export {
  PincodeInput,
  type PincodeInputProps,
} from "./components/ui/pincode-input";
export {
  StateSelect,
  type StateSelectProps,
} from "./components/ui/state-select";
export { UPIInput, type UPIInputProps } from "./components/ui/upi-input";
export {
  type ValidationIssue,
  ValidationSummary,
  type ValidationSummaryProps,
} from "./components/ui/validation-summary";
export {
  VehicleNumberInput,
  type VehicleNumberInputProps,
} from "./components/ui/vehicle-number-input";

// ── Validation logic ───────────────────────────────────────────────────────
export {
  type AadhaarErrorCode,
  type AadhaarResult,
  formatAadhaar,
  maskAadhaar,
  normalizeAadhaar,
  validateAadhaar,
  verhoeffCheckDigit,
  verhoeffValid,
} from "./lib/aadhaar";
export {
  type AmountErrorCode,
  type AmountParts,
  type AmountResult,
  amountToNumber,
  amountToPaise,
  formatAmountInput,
  formatINR,
  formatIndianShort,
  groupIndian,
  parseAmountInput,
  validateAmount,
} from "./lib/amount";
export {
  type BankAccountErrorCode,
  type BankAccountResult,
  confirmMatches,
  maskBankAccount,
  normalizeBankAccount,
  validateBankAccount,
} from "./lib/bank-account";
export {
  type CinErrorCode,
  type CinResult,
  type FssaiErrorCode,
  formatUdyam,
  type HsnErrorCode,
  type HsnResult,
  type TanErrorCode,
  type UdyamErrorCode,
  validateCin,
  validateFssai,
  validateHsn,
  validateTan,
  validateUdyam,
} from "./lib/business-ids";
export {
  type CardErrorCode,
  type CardNetwork,
  type CardResult,
  type CvvErrorCode,
  type CvvResult,
  detectNetwork,
  type ExpiryErrorCode,
  type ExpiryResult,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  validateCardNumber,
  validateCvv,
  validateExpiry,
} from "./lib/card";
export {
  ageFrom,
  type DobErrorCode,
  type DobResult,
  formatDobInput,
  validateDob,
} from "./lib/dob";
export {
  type IdResult,
  type LicenceErrorCode,
  type LicenceResult,
  type PassportErrorCode,
  type VoterIdErrorCode,
  validateDrivingLicence,
  validatePassport,
  validateVoterId,
} from "./lib/gov-ids";
export {
  GST_STATE_CODES,
  type GstinErrorCode,
  type GstinResult,
  gstinCheckChar,
  gstinMatchesPan,
  normalizeGstin,
  validateGstin,
} from "./lib/gstin";
export {
  IFSC_BANK_CODES,
  type IfscErrorCode,
  type IfscResult,
  normalizeIfsc,
  validateIfsc,
} from "./lib/ifsc";
export {
  formatMobile,
  type MobileErrorCode,
  type MobileResult,
  normalizeMobile,
  validateMobile,
} from "./lib/mobile";
export {
  maskPan,
  normalizePan,
  type PanErrorCode,
  type PanHolderType,
  type PanResult,
  panHolderType,
  validatePan,
} from "./lib/pan";
export {
  normalizePincode,
  PIN_ZONES,
  type PincodeErrorCode,
  type PincodeResult,
  validatePincode,
} from "./lib/pincode";
export {
  INDIAN_STATES,
  type IndianState,
  searchStates,
  stateByCode,
  stateByGstCode,
} from "./lib/states";
export {
  isPhoneVpa,
  isValidVpa,
  lookupHandle,
  searchHandles,
  splitVpa,
  UPI_HANDLES,
  type UpiHandle,
  type UpiHandleKind,
  type VpaError,
  type VpaErrorCode,
  type VpaResult,
  validateVpa,
} from "./lib/upi";
export {
  normalizeVehicleNumber,
  RTO_STATE_CODES,
  type VehicleErrorCode,
  type VehicleFormat,
  type VehicleResult,
  validateVehicleNumber,
} from "./lib/vehicle";
export { amountToWords, numberToIndianWords } from "./lib/words";
