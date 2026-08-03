"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import {
  type AadhaarResult,
  formatAadhaar,
  maskAadhaar,
  validateAadhaar,
} from "../../lib/aadhaar";
import { cn, controlClasses, Field, useFieldState } from "./field";

export interface AadhaarInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: AadhaarResult) => void;
  validateOn?: "blur" | "change";
  /**
   * Hide all but the last four digits once the field loses focus, with a
   * reveal toggle. On by default — an Aadhaar number should not sit in plain
   * text on screen, and the DPDP Act treats it as sensitive.
   */
  maskOnBlur?: boolean;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function AadhaarInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  maskOnBlur = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  onFocus,
  ...props
}: AadhaarInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `aadhaar-${reactId}`;
  const messageId = `${inputId}-message`;

  const [focused, setFocused] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);

  const field = useFieldState<AadhaarResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validateAadhaar,
    transform: (raw) => formatAadhaar(raw).slice(0, 14),
    validateOn,
  });

  const hidden =
    maskOnBlur && !focused && !revealed && field.result.normalized.length > 0;

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
          autoComplete="off"
          placeholder={props.placeholder ?? "1234 5678 9012"}
          // Swapping the *displayed* value keeps the real one in state, so the
          // consumer never has to unmask anything themselves.
          value={hidden ? maskAadhaar(field.value) : field.value}
          onChange={(event) => field.setValue(event.target.value)}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
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
            "tracking-[0.18em]",
            maskOnBlur && "pr-10",
            className,
          )}
        />
        {maskOnBlur && field.value.length > 0 && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={
              revealed ? "Hide Aadhaar number" : "Reveal Aadhaar number"
            }
            aria-pressed={revealed}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {revealed ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    </Field>
  );
}
