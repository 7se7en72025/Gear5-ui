"use client";

import * as React from "react";

import { type DobResult, formatDobInput, validateDob } from "../../lib/dob";
import { cn, controlClasses, Field, FieldBadge, useFieldState } from "./field";

export interface DOBInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: DobResult) => void;
  validateOn?: "blur" | "change";
  /** Reject anyone younger than this. 18 is the usual KYC floor. */
  minAge?: number;
  /** Show the computed age once the date is valid. Default `true`. */
  showAge?: boolean;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function DOBInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  minAge,
  showAge = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: DOBInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `dob-${reactId}`;
  const messageId = `${inputId}-message`;

  const validate = React.useCallback(
    (raw: string) => validateDob(raw, { minAge }),
    [minAge],
  );

  const field = useFieldState<DobResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate,
    // Slashes are inserted as you type, so DD/MM/YYYY is unambiguous on screen
    // even though the user only types digits.
    transform: formatDobInput,
    validateOn,
  });

  const age =
    showAge && field.result.valid && field.result.age !== undefined
      ? `${field.result.age} years`
      : undefined;

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={field.error ?? description}
      tone={field.error ? "error" : "muted"}
      className={containerClassName}
    >
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          placeholder={props.placeholder ?? "DD/MM/YYYY"}
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
            "tracking-[0.14em]",
            age && "pr-28",
            className,
          )}
        />
        {age && <FieldBadge>{age}</FieldBadge>}
      </div>
    </Field>
  );
}
