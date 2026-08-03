"use client";

import * as React from "react";

import { type IfscResult, normalizeIfsc, validateIfsc } from "../../lib/ifsc";
import { cn, controlClasses, Field, FieldBadge, useFieldState } from "./field";

export interface IFSCInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: IfscResult) => void;
  validateOn?: "blur" | "change";
  /** Name the bank once the code resolves. Default `true`. */
  showBank?: boolean;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function IFSCInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  showBank = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: IFSCInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `ifsc-${reactId}`;
  const messageId = `${inputId}-message`;

  const field = useFieldState<IfscResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validateIfsc,
    transform: (raw) =>
      normalizeIfsc(raw)
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 11),
    validateOn,
  });

  const bank = showBank && field.result.valid ? field.result.bank : undefined;
  // An unrecognised bank code is a hint, never an error — new banks and mergers
  // land faster than any bundled list can track.
  const hint =
    field.result.valid && field.result.unrecognisedBank
      ? "Valid format, but we don't recognise this bank code."
      : undefined;

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={field.error ?? hint ?? description}
      tone={field.error ? "error" : hint ? "hint" : "muted"}
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
          placeholder={props.placeholder ?? "HDFC0001234"}
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
            bank && "pr-36",
            className,
          )}
        />
        {bank && <FieldBadge>{bank}</FieldBadge>}
      </div>
    </Field>
  );
}
