"use client";

import type { IdResult } from "../../lib/gov-ids";
import {
  formatAbha,
  validateAbha,
  validateEsic,
  validatePran,
  validateRationCard,
  validateUan,
} from "../../lib/health-ids";
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
 * ABHA (Ayushman Bharat Health Account) — 14 digits.
 *
 * This is health data under the DPDP Act. Pair it with `MaskedValue` anywhere
 * you display it back, and keep it out of logs.
 */
export function ABHAInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="91-1234-5678-9012"
      tracking="tracking-[0.1em]"
      {...props}
      validate={validateAbha}
      transform={formatAbha}
    />
  );
}

/** UAN — the EPFO number that follows a member across employers. */
export function UANInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="100123456789"
      tracking="tracking-[0.14em]"
      {...props}
      validate={validateUan}
      transform={digits(12)}
    />
  );
}

/** ESIC insurance number — 17 digits. */
export function ESICInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="31001234560000101"
      tracking="tracking-[0.08em]"
      {...props}
      validate={validateEsic}
      transform={digits(17)}
    />
  );
}

/** PRAN — the National Pension System account number. */
export function PRANInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="110012345678"
      tracking="tracking-[0.14em]"
      {...props}
      validate={validatePran}
      transform={digits(12)}
    />
  );
}

/** Ration card — format genuinely differs by state, so validation is loose. */
export function RationCardInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="RJ12345678901"
      tracking="tracking-[0.1em]"
      {...props}
      validate={validateRationCard}
      transform={alnum(16)}
    />
  );
}

export type ABHAInputProps = WrapperProps<IdResult>;
export type UANInputProps = WrapperProps<IdResult>;
export type ESICInputProps = WrapperProps<IdResult>;
export type PRANInputProps = WrapperProps<IdResult>;
export type RationCardInputProps = WrapperProps<IdResult>;
