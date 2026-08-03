"use client";

import * as React from "react";

import {
  type AmountResult,
  formatAmountInput,
  formatIndianShort,
  validateAmount,
} from "../../lib/amount";
import { cn, controlClasses, Field, useFieldState } from "./field";

export interface AmountInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "min" | "max" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: AmountResult) => void;
  validateOn?: "blur" | "change";
  /** Minimum accepted amount, in rupees. */
  min?: number;
  /** Maximum accepted amount, in rupees. */
  max?: number;
  /** Show the "₹1.2 L" shorthand beneath the field. Default `true`. */
  showShorthand?: boolean;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function AmountInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  min,
  max,
  showShorthand = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: AmountInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `amount-${reactId}`;
  const messageId = `${inputId}-message`;

  const validate = React.useCallback(
    (raw: string) => validateAmount(raw, { min, max }),
    [min, max],
  );

  const field = useFieldState<AmountResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate,
    // Regroup on every keystroke so the separators move as digits are typed.
    transform: formatAmountInput,
    validateOn,
  });

  const shorthand =
    showShorthand && field.result.value !== null && field.result.value >= 1000
      ? formatIndianShort(field.result.value)
      : undefined;

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={field.error ?? shorthand ?? description}
      tone={field.error ? "error" : shorthand ? "hint" : "muted"}
      className={containerClassName}
    >
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 dark:text-neutral-400"
        >
          ₹
        </span>
        <input
          {...props}
          id={inputId}
          type="text"
          // `text` not `number`: a number input strips our separators, and its
          // spinner is meaningless for currency. inputMode gets the right keypad.
          inputMode="decimal"
          autoComplete="off"
          placeholder={props.placeholder ?? "0"}
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
            "pl-7 text-right tabular-nums",
            className,
          )}
        />
      </div>
    </Field>
  );
}
