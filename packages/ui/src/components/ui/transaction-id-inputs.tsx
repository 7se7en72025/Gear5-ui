"use client";

import type { IdResult } from "../../lib/gov-ids";
import {
  validateArn,
  validateChequeNumber,
  validateEWayBill,
  validateIrn,
  validateLpgConsumerId,
  validateRrn,
  validateUmrn,
} from "../../lib/transaction-ids";
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

/** UMRN — the e-NACH mandate reference, shown when cancelling an auto-debit. */
export function UMRNInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="HDFC0000012345678901"
      tracking="tracking-[0.04em]"
      {...props}
      validate={validateUmrn}
      transform={alnum(20)}
    />
  );
}

/** Cheque number — the six digits at the bottom-left of the leaf. */
export function ChequeNumberInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="123456"
      tracking="tracking-[0.2em]"
      {...props}
      validate={validateChequeNumber}
      transform={digits(6)}
    />
  );
}

/** E-way bill — 12 digits. No public check digit, despite the rumours. */
export function EWayBillInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="123456789012"
      tracking="tracking-[0.14em]"
      {...props}
      validate={validateEWayBill}
      transform={digits(12)}
    />
  );
}

/** ARN — how a pending GST registration is tracked. */
export function ARNInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="AA0701190003081"
      tracking="tracking-[0.12em]"
      {...props}
      validate={validateArn}
      transform={alnum(13)}
    />
  );
}

/** RRN — the reference a bank asks for when disputing a card transaction. */
export function RRNInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="123456789012"
      tracking="tracking-[0.14em]"
      {...props}
      validate={validateRrn}
      transform={digits(12)}
    />
  );
}

/** IRN — a SHA-256 from the Invoice Registration Portal, not a number. */
export function IRNInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="e7e2e5a0…"
      tracking="tracking-normal"
      {...props}
      validate={validateIrn}
      transform={(raw) =>
        raw
          .toLowerCase()
          .replace(/[^0-9a-f]/g, "")
          .slice(0, 64)
      }
      className="text-[11px]"
    />
  );
}

/** LPG consumer ID — length differs by distributor, so the range is wide. */
export function LPGConsumerInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="12345678901234567"
      tracking="tracking-[0.08em]"
      {...props}
      validate={validateLpgConsumerId}
      transform={digits(17)}
    />
  );
}

export type UMRNInputProps = WrapperProps<IdResult>;
export type ChequeNumberInputProps = WrapperProps<IdResult>;
export type EWayBillInputProps = WrapperProps<IdResult>;
export type ARNInputProps = WrapperProps<IdResult>;
export type RRNInputProps = WrapperProps<IdResult>;
export type IRNInputProps = WrapperProps<IdResult>;
export type LPGConsumerInputProps = WrapperProps<IdResult>;
