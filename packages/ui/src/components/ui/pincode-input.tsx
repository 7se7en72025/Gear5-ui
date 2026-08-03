"use client";

import * as React from "react";

import {
  normalizePincode,
  type PincodeResult,
  validatePincode,
} from "../../lib/pincode";
import { cn, controlClasses, Field, FieldBadge, useFieldState } from "./field";

export interface PincodeInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: PincodeResult) => void;
  validateOn?: "blur" | "change";
  /** Show the derived postal zone. Default `true`. */
  showZone?: boolean;
  /** Reject 9xxxxx (Army Postal Service) — usually right for a home address. */
  rejectArmyPostal?: boolean;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function PincodeInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  showZone = true,
  rejectArmyPostal = false,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: PincodeInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `pincode-${reactId}`;
  const messageId = `${inputId}-message`;

  const field = useFieldState<PincodeResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validatePincode,
    transform: (raw) => normalizePincode(raw).slice(0, 6),
    validateOn,
  });

  const armyRejected =
    rejectArmyPostal && field.result.valid && field.result.isArmyPostal
      ? "This is an Army Postal Service code — enter a residential PIN code."
      : undefined;

  const zone =
    showZone && field.result.valid && !armyRejected
      ? field.result.zone
      : undefined;

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={
        field.error ?? armyRejected ?? field.result.covers ?? description
      }
      tone={
        field.error || armyRejected
          ? "error"
          : field.result.covers
            ? "hint"
            : "muted"
      }
      className={containerClassName}
    >
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder={props.placeholder ?? "560001"}
          value={field.value}
          onChange={(event) => field.setValue(event.target.value)}
          onBlur={(event) => {
            field.markTouched();
            onBlur?.(event);
          }}
          aria-invalid={Boolean(field.error || armyRejected)}
          aria-describedby={messageId}
          className={cn(
            controlClasses({
              error: Boolean(field.error || armyRejected),
              success: field.success && !armyRejected,
            }),
            "tracking-[0.2em]",
            zone && "pr-32",
            className,
          )}
        />
        {zone && <FieldBadge>{zone}</FieldBadge>}
      </div>
    </Field>
  );
}
