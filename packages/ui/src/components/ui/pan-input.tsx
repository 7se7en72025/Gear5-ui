"use client";

import * as React from "react";

import { normalizePan, type PanResult, validatePan } from "../../lib/pan";
import { cn, controlClasses, Field, FieldBadge, useFieldState } from "./field";

export interface PANInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: PanResult) => void;
  validateOn?: "blur" | "change";
  /** Show the decoded holder type once the PAN is well-formed. Default `true`. */
  showHolderType?: boolean;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function PANInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  showHolderType = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: PANInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `pan-${reactId}`;
  const messageId = `${inputId}-message`;

  const field = useFieldState<PanResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validatePan,
    transform: (raw) =>
      normalizePan(raw)
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10),
    validateOn,
  });

  const badge =
    showHolderType && field.result.valid ? field.result.holderType : undefined;

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
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder={props.placeholder ?? "ABCDE1234F"}
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
            "uppercase tracking-[0.12em]",
            badge && "pr-32",
            className,
          )}
        />
        {badge && <FieldBadge>{badge}</FieldBadge>}
      </div>
    </Field>
  );
}
