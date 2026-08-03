"use client";

import {
  type CinResult,
  formatUdyam,
  type HsnResult,
  validateCin,
  validateFssai,
  validateHsn,
  validateTan,
  validateUdyam,
} from "../../lib/business-ids";
import type { IdResult } from "../../lib/gov-ids";
import { IdentifierInput, type IdentifierInputProps } from "./identifier-input";

type WrapperProps<T extends { valid: boolean; error?: { message: string } }> =
  Omit<IdentifierInputProps<T>, "validate" | "transform" | "badge">;

const alnum = (max: number) => (raw: string) =>
  raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, max);

const digits = (max: number) => (raw: string) =>
  raw.replace(/\D/g, "").slice(0, max);

/** TAN — the deductor's tax account number, `MUMA12345B`. */
export function TANInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="MUMA12345B"
      {...props}
      validate={validateTan}
      transform={alnum(10)}
    />
  );
}

/**
 * CIN — 21 characters that decode to listing status, state, incorporation year
 * and company class. The badge shows the class, which is the part people check.
 */
export function CINInput(props: WrapperProps<CinResult>) {
  return (
    <IdentifierInput<CinResult>
      placeholder="U72200KA2013PTC098765"
      tracking="tracking-[0.04em]"
      {...props}
      validate={validateCin}
      transform={alnum(21)}
      badge={(result) => result.ownership}
    />
  );
}

/** Udyam (MSME) registration — `UDYAM-KR-03-0000001`. */
export function UdyamInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="UDYAM-KR-03-0000001"
      tracking="tracking-[0.04em]"
      {...props}
      validate={validateUdyam}
      // Hyphens are re-inserted as you type, matching how it's printed.
      transform={formatUdyam}
    />
  );
}

/** HSN / SAC code — 2, 4, 6 or 8 digits. The badge names the level. */
export function HSNInput(props: WrapperProps<HsnResult>) {
  return (
    <IdentifierInput<HsnResult>
      placeholder="998314"
      tracking="tracking-[0.18em]"
      {...props}
      validate={validateHsn}
      transform={digits(8)}
      badge={(result) => result.level}
    />
  );
}

/** FSSAI food licence number — 14 digits. */
export function FSSAIInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="12345678901234"
      tracking="tracking-[0.12em]"
      {...props}
      validate={validateFssai}
      transform={digits(14)}
    />
  );
}

export type TANInputProps = WrapperProps<IdResult>;
export type CINInputProps = WrapperProps<CinResult>;
export type UdyamInputProps = WrapperProps<IdResult>;
export type HSNInputProps = WrapperProps<HsnResult>;
export type FSSAIInputProps = WrapperProps<IdResult>;
