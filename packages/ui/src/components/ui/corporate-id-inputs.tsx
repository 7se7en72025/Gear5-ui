"use client";

import {
  formatLlpin,
  type TinResult,
  validateDin,
  validateFcra,
  validateIec,
  validateLlpin,
  validateRera,
  validateTin,
} from "../../lib/corporate-ids";
import type { IdResult } from "../../lib/gov-ids";
import type { PanResult } from "../../lib/pan";
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

/** DIN — Director Identification Number, 8 digits. */
export function DINInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="01234567"
      tracking="tracking-[0.18em]"
      {...props}
      validate={validateDin}
      transform={digits(8)}
    />
  );
}

/** LLPIN — three letters then four digits, hyphenated as you type. */
export function LLPINInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="AAB-1234"
      tracking="tracking-[0.16em]"
      {...props}
      validate={validateLlpin}
      transform={formatLlpin}
    />
  );
}

/** FCRA registration — 9 digits, required for foreign donations. */
export function FCRAInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="123456789"
      tracking="tracking-[0.18em]"
      {...props}
      validate={validateFcra}
      transform={digits(9)}
    />
  );
}

/**
 * IEC — since 2021 an entity's Import Export Code *is* its PAN, so this
 * validates PAN structure. Regexes written before that change still expect a
 * 10-digit number and reject every modern IEC.
 */
export function IECInput(props: WrapperProps<PanResult>) {
  return (
    <IdentifierInput<PanResult>
      placeholder="ABCPE1234F"
      tracking="tracking-[0.12em]"
      {...props}
      validate={validateIec}
      transform={alnum(10)}
      badge={(result) => result.holderType}
    />
  );
}

/** RERA — per-state formats, so validation is deliberately permissive. */
export function RERAInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="PRM/KA/RERA/1251/446/PR/123456"
      tracking="tracking-[0.02em]"
      {...props}
      validate={validateRera}
      transform={(raw) =>
        raw
          .toUpperCase()
          .replace(/[^A-Z0-9/-]/g, "")
          .slice(0, 40)
      }
    />
  );
}

/** TIN — the pre-GST taxpayer number, still found on historical invoices. */
export function TINInput(props: WrapperProps<TinResult>) {
  return (
    <IdentifierInput<TinResult>
      placeholder="29123456789"
      tracking="tracking-[0.14em]"
      {...props}
      validate={validateTin}
      transform={digits(11)}
    />
  );
}

export type DINInputProps = WrapperProps<IdResult>;
export type LLPINInputProps = WrapperProps<IdResult>;
export type FCRAInputProps = WrapperProps<IdResult>;
export type IECInputProps = WrapperProps<PanResult>;
export type RERAInputProps = WrapperProps<IdResult>;
export type TINInputProps = WrapperProps<TinResult>;
