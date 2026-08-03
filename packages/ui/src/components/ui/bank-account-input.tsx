"use client";

import * as React from "react";

import {
  type BankAccountResult,
  confirmMatches,
  normalizeBankAccount,
  validateBankAccount,
} from "../../lib/bank-account";
import { cn, controlClasses, Field, useFieldState } from "./field";

export interface BankAccountInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type"
  > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: BankAccountResult) => void;
  validateOn?: "blur" | "change";
  /**
   * Render a second "confirm account number" field. On by default: account
   * numbers have no checksum, so re-entry is the only client-side defence
   * against a typo that silently pays a stranger.
   */
  requireConfirmation?: boolean;
  confirmLabel?: string;
  label?: string;
  description?: string;
  containerClassName?: string;
}

export function BankAccountInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  requireConfirmation = true,
  confirmLabel = "Confirm account number",
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  ...props
}: BankAccountInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `account-${reactId}`;
  const messageId = `${inputId}-message`;
  const confirmId = `${inputId}-confirm`;
  const confirmMessageId = `${confirmId}-message`;

  const [confirmation, setConfirmation] = React.useState("");
  const [confirmTouched, setConfirmTouched] = React.useState(false);

  const field = useFieldState<BankAccountResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate: validateBankAccount,
    transform: (raw) => normalizeBankAccount(raw).slice(0, 18),
    validateOn,
  });

  const mismatch =
    requireConfirmation && confirmTouched && confirmation.length > 0
      ? !confirmMatches(field.value, confirmation)
      : false;

  return (
    <div className={cn("space-y-3", containerClassName)}>
      <Field
        id={inputId}
        messageId={messageId}
        label={label}
        message={field.error ?? description}
        tone={field.error ? "error" : "muted"}
      >
        <input
          {...props}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={props.placeholder ?? "123456789012"}
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
            className,
          )}
        />
      </Field>

      {requireConfirmation && (
        <Field
          id={confirmId}
          messageId={confirmMessageId}
          label={confirmLabel}
          message={
            mismatch ? "The two account numbers don't match." : undefined
          }
          tone="error"
        >
          <input
            id={confirmId}
            type="text"
            inputMode="numeric"
            // Pasting defeats the point of asking twice.
            onPaste={(event) => event.preventDefault()}
            autoComplete="off"
            placeholder="Re-enter to confirm"
            value={confirmation}
            onChange={(event) =>
              setConfirmation(
                normalizeBankAccount(event.target.value).slice(0, 18),
              )
            }
            onBlur={() => setConfirmTouched(true)}
            aria-invalid={mismatch}
            aria-describedby={confirmMessageId}
            className={cn(
              controlClasses({
                error: mismatch,
                success: confirmation.length > 0 && !mismatch && field.success,
              }),
              "tracking-[0.14em]",
            )}
          />
        </Field>
      )}
    </div>
  );
}
