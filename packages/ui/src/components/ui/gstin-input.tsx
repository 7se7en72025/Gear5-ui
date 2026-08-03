"use client";

import * as React from "react";

import {
  type GstinResult,
  normalizeGstin,
  validateGstin,
} from "../../lib/gstin";
import { cn, controlClasses, Field, FieldBadge, useFieldState } from "./field";

export interface GSTINInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: GstinResult) => void;
  validateOn?: "blur" | "change";
  /** Show the resolved state once the GSTIN validates. Default `true`. */
  showState?: boolean;
  /**
   * A PAN to cross-check against. A GSTIN embeds its holder's PAN, so if you
   * already collected one you can catch a mismatched pair for free.
   */
  expectedPan?: string;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function GSTINInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  showState = true,
  expectedPan,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: GSTINInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `gstin-${reactId}`;
  const messageId = `${inputId}-message`;

  const field = useFieldState<GstinResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validateGstin,
    transform: (raw) =>
      normalizeGstin(raw)
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 15),
    validateOn,
  });

  const panMismatch =
    field.result.valid &&
    expectedPan &&
    field.result.pan !== expectedPan.replace(/\s/g, "").toUpperCase()
      ? `This GSTIN belongs to PAN ${field.result.pan}, not ${expectedPan.toUpperCase()}.`
      : undefined;

  const state =
    showState && field.result.valid ? field.result.state : undefined;

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={field.error ?? panMismatch ?? description}
      tone={field.error || panMismatch ? "error" : "muted"}
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
          placeholder={props.placeholder ?? "27ABCDE1234F1Z5"}
          value={field.value}
          onChange={(event) => field.setValue(event.target.value)}
          onBlur={(event) => {
            field.markTouched();
            onBlur?.(event);
          }}
          aria-invalid={Boolean(field.error || panMismatch)}
          aria-describedby={messageId}
          className={cn(
            controlClasses({
              error: Boolean(field.error || panMismatch),
              success: field.success && !panMismatch,
            }),
            "uppercase tracking-[0.1em]",
            state && "pr-36",
            className,
          )}
        />
        {state && !panMismatch && <FieldBadge>{state}</FieldBadge>}
      </div>
    </Field>
  );
}
