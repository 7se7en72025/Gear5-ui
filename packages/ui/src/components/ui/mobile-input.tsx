"use client";

import * as React from "react";

import {
  formatMobile,
  type MobileResult,
  validateMobile,
} from "../../lib/mobile";
import { cn, controlClasses, Field, useFieldState } from "./field";

export interface MobileInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: MobileResult) => void;
  validateOn?: "blur" | "change";
  /** Show a non-editable +91 prefix. Default `true`. */
  showCountryCode?: boolean;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function MobileInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  showCountryCode = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: MobileInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `mobile-${reactId}`;
  const messageId = `${inputId}-message`;

  const field = useFieldState<MobileResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validateMobile,
    // normalizeMobile inside formatMobile strips a pasted +91/0 prefix, so
    // pasting a number in any common shape just works.
    transform: formatMobile,
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
      <div className="relative">
        {showCountryCode && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 border-r border-neutral-300 pr-2 font-mono text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
          >
            +91
          </span>
        )}
        <input
          {...props}
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={props.placeholder ?? "98765 43210"}
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
            showCountryCode && "pl-16",
            className,
          )}
        />
      </div>
    </Field>
  );
}
