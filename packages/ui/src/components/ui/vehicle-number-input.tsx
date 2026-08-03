"use client";

import * as React from "react";

import {
  normalizeVehicleNumber,
  type VehicleResult,
  validateVehicleNumber,
} from "../../lib/vehicle";
import { cn, controlClasses, Field, FieldBadge, useFieldState } from "./field";

export interface VehicleNumberInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: VehicleResult) => void;
  validateOn?: "blur" | "change";
  /** Name the state (or flag a Bharat-series plate). Default `true`. */
  showState?: boolean;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function VehicleNumberInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  showState = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: VehicleNumberInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `vehicle-${reactId}`;
  const messageId = `${inputId}-message`;

  const field = useFieldState<VehicleResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validateVehicleNumber,
    transform: (raw) =>
      normalizeVehicleNumber(raw)
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 11),
    validateOn,
  });

  const badge =
    showState && field.result.valid
      ? field.result.format === "bharat"
        ? "Bharat series"
        : field.result.state
      : undefined;

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={field.error ?? field.result.formatted ?? description}
      tone={field.error ? "error" : field.result.formatted ? "hint" : "muted"}
      className={containerClassName}
    >
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder={props.placeholder ?? "MH12AB1234"}
          value={field.value}
          onChange={(event) => field.setValue(event.target.value)}
          onBlur={(event) => {
            field.markTouched();
            onBlur?.(event);
          }}
          aria-invalid={Boolean(field.error)}
          aria-describedby={messageId}
          className={cn(
            controlClasses({
              error: Boolean(field.error),
              success: field.success,
            }),
            "uppercase tracking-[0.14em]",
            badge && "pr-36",
            className,
          )}
        />
        {badge && <FieldBadge>{badge}</FieldBadge>}
      </div>
    </Field>
  );
}
