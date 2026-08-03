"use client";

import * as React from "react";

import {
  type CardResult,
  type CvvResult,
  type ExpiryResult,
  formatCardNumber,
  formatExpiry,
  validateCardNumber,
  validateCvv,
  validateExpiry,
} from "../../lib/card";
import { cn, controlClasses, Field, FieldBadge, useFieldState } from "./field";

type Base = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type"
>;

interface Common {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  validateOn?: "blur" | "change";
  label?: string;
  description?: string;
  containerClassName?: string;
}

/* ── Card number ─────────────────────────────────────────────────────────── */

export interface CardNumberInputProps extends Base, Common {
  onValidationChange?: (result: CardResult) => void;
  /** Name the detected network. Default `true`. */
  showNetwork?: boolean;
}

export function CardNumberInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  showNetwork = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: CardNumberInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `card-${reactId}`;
  const messageId = `${inputId}-message`;

  const field = useFieldState<CardResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validateCardNumber,
    // Regroups live, and the grouping itself changes with the network (Amex
    // is 4-6-5, everyone else 4-4-4-4).
    transform: formatCardNumber,
    validateOn,
  });

  const network = showNetwork ? field.result.network : undefined;

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
          autoComplete="cc-number"
          placeholder={props.placeholder ?? "6521 1234 5678 9012"}
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
            "tracking-[0.1em]",
            network && "pr-36",
            className,
          )}
        />
        {network && field.result.valid && <FieldBadge>{network}</FieldBadge>}
      </div>
    </Field>
  );
}

/* ── Expiry ──────────────────────────────────────────────────────────────── */

export interface CardExpiryInputProps extends Base, Common {
  onValidationChange?: (result: ExpiryResult) => void;
}

export function CardExpiryInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: CardExpiryInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `expiry-${reactId}`;
  const messageId = `${inputId}-message`;

  const validate = React.useCallback((raw: string) => validateExpiry(raw), []);

  const field = useFieldState<ExpiryResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate,
    transform: formatExpiry,
    validateOn,
  });

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={field.error ?? description}
      tone={field.error ? "error" : "muted"}
      className={containerClassName}
    >
      <input
        {...props}
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="cc-exp"
        placeholder={props.placeholder ?? "MM/YY"}
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
          "tracking-[0.16em]",
          className,
        )}
      />
    </Field>
  );
}

/* ── CVV ─────────────────────────────────────────────────────────────────── */

export interface CVVInputProps extends Base, Common {
  onValidationChange?: (result: CvvResult) => void;
  /**
   * Expected length — pass `cvvLength` from the card number's result so Amex
   * correctly asks for four digits.
   */
  length?: number;
}

export function CVVInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  length = 3,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: CVVInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `cvv-${reactId}`;
  const messageId = `${inputId}-message`;

  const validate = React.useCallback(
    (raw: string) => validateCvv(raw, length),
    [length],
  );

  const field = useFieldState<CvvResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate,
    transform: (raw) => raw.replace(/\D/g, "").slice(0, length),
    validateOn,
  });

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={field.error ?? description}
      tone={field.error ? "error" : "muted"}
      className={containerClassName}
    >
      <input
        {...props}
        id={inputId}
        // `password` so a CVV never lands in a screenshot or screen share.
        type="password"
        inputMode="numeric"
        autoComplete="cc-csc"
        placeholder={props.placeholder ?? "•".repeat(length)}
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
          "tracking-[0.3em]",
          className,
        )}
      />
    </Field>
  );
}
