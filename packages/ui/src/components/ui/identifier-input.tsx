"use client";

import * as React from "react";

import {
  cn,
  controlClasses,
  Field,
  FieldBadge,
  useFieldState,
  type ValidationLike,
} from "./field";

export interface IdentifierInputProps<T extends ValidationLike>
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: T) => void;
  validateOn?: "blur" | "change";
  validate: (raw: string) => T;
  /** Input mask applied on every keystroke. */
  transform?: (raw: string) => string;
  /** Derives the right-hand badge from a valid result. */
  badge?: (result: T) => string | undefined;
  label?: string;
  description?: string;
  containerClassName?: string;
  /** Extra letter-spacing suits fixed-format identifiers. */
  tracking?: string;
}

/**
 * The shared body of every fixed-format identifier field. The specific
 * components (PAN, TAN, CIN, …) are thin wrappers that supply a validator, a
 * mask and a placeholder — everything else behaves identically by construction.
 */
export function IdentifierInput<T extends ValidationLike>({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  validate,
  transform,
  badge,
  label,
  description,
  className,
  containerClassName,
  tracking = "tracking-[0.12em]",
  id,
  onBlur,
  ...props
}: IdentifierInputProps<T>) {
  const reactId = React.useId();
  const inputId = id ?? `id-${reactId}`;
  const messageId = `${inputId}-message`;

  const field = useFieldState<T>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate,
    transform,
    validateOn,
  });

  const badgeText =
    badge && field.result.valid ? badge(field.result) : undefined;

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
            tracking,
            badgeText && "pr-36",
            className,
          )}
        />
        {badgeText && <FieldBadge>{badgeText}</FieldBadge>}
      </div>
    </Field>
  );
}
