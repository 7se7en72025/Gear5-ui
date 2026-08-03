// ── Shared field primitives ────────────────────────────────────────────────

// ── Components ─────────────────────────────────────────────────────────────
export {
  AadhaarInput,
  type AadhaarInputProps,
} from "./components/ui/aadhaar-input";
export {
  AmountInput,
  type AmountInputProps,
} from "./components/ui/amount-input";
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
export { GSTINInput, type GSTINInputProps } from "./components/ui/gstin-input";
export { IFSCInput, type IFSCInputProps } from "./components/ui/ifsc-input";
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
export { UPIInput, type UPIInputProps } from "./components/ui/upi-input";
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
  ageFrom,
  type DobErrorCode,
  type DobResult,
  formatDobInput,
  validateDob,
} from "./lib/dob";
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
