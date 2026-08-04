"use client";

import type { IdResult } from "../../lib/gov-ids";
import {
  type DematResult,
  type IsinResult,
  type MicrResult,
  type SwiftResult,
  type UtrResult,
  validateCkyc,
  validateDemat,
  validateIsin,
  validateLei,
  validateMicr,
  validateSwift,
  validateUtr,
} from "../../lib/market-ids";
import { IdentifierInput, type IdentifierInputProps } from "./identifier-input";

type WrapperProps<T extends { valid: boolean; error?: { message: string } }> =
  Omit<IdentifierInputProps<T>, "validate" | "transform" | "badge">;

const digits = (max: number) => (raw: string) =>
  raw.replace(/\D/g, "").slice(0, max);
const alnum = (max: number) => (raw: string) =>
  raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, max);

/**
 * LEI — 20 characters ending in an ISO 7064 MOD 97-10 check.
 * One of the few Indian-form identifiers with a genuinely public checksum.
 */
export function LEIInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="5493001KJTIIGC8Y1R12"
      tracking="tracking-[0.04em]"
      {...props}
      validate={validateLei}
      transform={alnum(20)}
    />
  );
}

/** ISIN — 12 characters with an ISO 6166 check digit. Badges Indian securities. */
export function ISINInput(props: WrapperProps<IsinResult>) {
  return (
    <IdentifierInput<IsinResult>
      placeholder="INE002A01018"
      tracking="tracking-[0.1em]"
      {...props}
      validate={validateIsin}
      transform={alnum(12)}
      badge={(result) => (result.indian ? "Indian security" : result.country)}
    />
  );
}

/** MICR — the nine digits along the bottom of a cheque. */
export function MICRInput(props: WrapperProps<MicrResult>) {
  return (
    <IdentifierInput<MicrResult>
      placeholder="560002007"
      tracking="tracking-[0.18em]"
      {...props}
      validate={validateMicr}
      transform={digits(9)}
    />
  );
}

/** Demat account — badges whether it's NSDL or CDSL. */
export function DematInput(props: WrapperProps<DematResult>) {
  return (
    <IdentifierInput<DematResult>
      placeholder="IN30012345678901"
      tracking="tracking-[0.08em]"
      {...props}
      validate={validateDemat}
      transform={alnum(16)}
      badge={(result) => result.depository}
    />
  );
}

/** SWIFT/BIC — 8 characters for head office, 11 for a specific branch. */
export function SWIFTInput(props: WrapperProps<SwiftResult>) {
  return (
    <IdentifierInput<SwiftResult>
      placeholder="HDFCINBB"
      tracking="tracking-[0.14em]"
      {...props}
      validate={validateSwift}
      transform={alnum(11)}
      badge={(result) => (result.branch ? "Branch" : "Head office")}
    />
  );
}

/** CKYC — the Central KYC Registry number, 14 digits. */
export function CKYCInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="12345678901234"
      tracking="tracking-[0.12em]"
      {...props}
      validate={validateCkyc}
      transform={digits(14)}
    />
  );
}

/** UTR — infers the payment rail from length, which is what support needs. */
export function UTRInput(props: WrapperProps<UtrResult>) {
  return (
    <IdentifierInput<UtrResult>
      placeholder="123456789012"
      tracking="tracking-[0.1em]"
      {...props}
      validate={validateUtr}
      transform={alnum(22)}
      badge={(result) => result.rail}
    />
  );
}

export type LEIInputProps = WrapperProps<IdResult>;
export type ISINInputProps = WrapperProps<IsinResult>;
export type MICRInputProps = WrapperProps<MicrResult>;
export type DematInputProps = WrapperProps<DematResult>;
export type SWIFTInputProps = WrapperProps<SwiftResult>;
export type CKYCInputProps = WrapperProps<IdResult>;
export type UTRInputProps = WrapperProps<UtrResult>;
