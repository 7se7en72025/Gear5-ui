"use client";

import {
  type IdResult,
  type LicenceResult,
  validateDrivingLicence,
  validatePassport,
  validateVoterId,
} from "../../lib/gov-ids";
import { IdentifierInput, type IdentifierInputProps } from "./identifier-input";

/** Props shared by the three ID fields — everything except the validator. */
type WrapperProps<T extends { valid: boolean; error?: { message: string } }> =
  Omit<IdentifierInputProps<T>, "validate" | "transform" | "badge">;

const alnum = (max: number) => (raw: string) =>
  raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, max);

/** Voter ID / EPIC number — `ABC1234567`. */
export function VoterIdInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="ABC1234567"
      {...props}
      validate={validateVoterId}
      transform={alnum(10)}
    />
  );
}

/** Driving licence — `MH1220110012345`, decoded to state and year of issue. */
export function DrivingLicenceInput(props: WrapperProps<LicenceResult>) {
  return (
    <IdentifierInput<LicenceResult>
      placeholder="MH1220110012345"
      tracking="tracking-[0.08em]"
      {...props}
      validate={validateDrivingLicence}
      transform={alnum(15)}
      badge={(result) => result.state}
    />
  );
}

/** Indian passport — `A1234567`. */
export function PassportInput(props: WrapperProps<IdResult>) {
  return (
    <IdentifierInput<IdResult>
      placeholder="A1234567"
      {...props}
      validate={validatePassport}
      transform={alnum(8)}
    />
  );
}

export type VoterIdInputProps = WrapperProps<IdResult>;
export type DrivingLicenceInputProps = WrapperProps<LicenceResult>;
export type PassportInputProps = WrapperProps<IdResult>;
