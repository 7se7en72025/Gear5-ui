"use client";

import * as React from "react";

import { cn, Field, useFieldState } from "./field";

export interface OtpResult {
  valid: boolean;
  normalized: string;
  error?: { code: "empty" | "incomplete"; message: string };
}

export interface OTPInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: OtpResult) => void;
  /** Fires once the last box is filled — wire your verify call here. */
  onComplete?: (code: string) => void;
  /** Number of boxes. Indian OTPs are almost always 6, sometimes 4. */
  length?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  /** Show the code as dots. Off by default — an SMS code isn't a password. */
  secret?: boolean;
  autoFocus?: boolean;
  className?: string;
  containerClassName?: string;
}

export function OTPInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  onComplete,
  length = 6,
  label,
  description,
  disabled,
  secret = false,
  autoFocus,
  className,
  containerClassName,
}: OTPInputProps) {
  const reactId = React.useId();
  const inputId = `otp-${reactId}`;
  const messageId = `${inputId}-message`;

  const validate = React.useCallback(
    (raw: string): OtpResult => {
      if (!raw) {
        return {
          valid: false,
          normalized: raw,
          error: { code: "empty", message: "Enter the code we sent you." },
        };
      }
      if (raw.length < length) {
        return {
          valid: false,
          normalized: raw,
          error: {
            code: "incomplete",
            message: `Enter all ${length} digits — ${raw.length} so far.`,
          },
        };
      }
      return { valid: true, normalized: raw };
    },
    [length],
  );

  const field = useFieldState<OtpResult>({
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValidationChange,
    validate,
    transform: (raw) => raw.replace(/\D/g, "").slice(0, length),
    validateOn: "blur",
  });

  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = field.value.split("");

  const lastCompleted = React.useRef<string>("");
  React.useEffect(() => {
    if (
      field.value.length === length &&
      field.value !== lastCompleted.current
    ) {
      lastCompleted.current = field.value;
      onComplete?.(field.value);
    } else if (field.value.length < length) {
      lastCompleted.current = "";
    }
  }, [field.value, length, onComplete]);

  function focusBox(index: number) {
    refs.current[Math.max(0, Math.min(length - 1, index))]?.focus();
  }

  function handleChange(index: number, raw: string) {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;

    // Typing or pasting multiple digits fills forward from this box, which is
    // what happens when a browser autofills an SMS code into the first one.
    const next = field.value.split("");
    for (let i = 0; i < typed.length && index + i < length; i++) {
      next[index + i] = typed[i];
    }
    field.setValue(next.join("").slice(0, length));
    focusBox(index + typed.length);
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = field.value.split("");
      if (next[index]) {
        // Clear this box first; only step back once it's already empty.
        next[index] = "";
        field.setValue(next.join("").replace(/\s/g, ""));
      } else {
        next[index - 1] = "";
        field.setValue(next.join("").replace(/\s/g, ""));
        focusBox(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  }

  return (
    <Field
      id={`${inputId}-0`}
      messageId={messageId}
      label={label}
      message={field.error ?? description}
      tone={field.error ? "error" : "muted"}
      className={containerClassName}
    >
      {/* fieldset, not role="group": a screen reader should announce these six
          boxes as one control. The legend is visually hidden but still read. */}
      <fieldset
        disabled={disabled}
        className={cn("flex min-w-0 gap-2 border-0 p-0", className)}
      >
        <legend className="sr-only">{label ?? "One-time code"}</legend>
        {Array.from({ length }, (_, index) => (
          <input
            // The boxes are positional and fixed in number, so the index *is*
            // the stable identity here — there is nothing to reorder.
            // biome-ignore lint/suspicious/noArrayIndexKey: positional by design
            key={index}
            id={`${inputId}-${index}`}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type={secret ? "password" : "text"}
            inputMode="numeric"
            // Lets iOS/Android offer the SMS code straight from the notification.
            autoComplete={index === 0 ? "one-time-code" : "off"}
            // Opt-in only. On a dedicated "enter the code we sent you" screen
            // this is the expected behaviour, not a focus steal.
            // biome-ignore lint/a11y/noAutofocus: opt-in via prop, off by default
            autoFocus={autoFocus && index === 0}
            maxLength={length}
            value={digits[index] ?? ""}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            onBlur={field.markTouched}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={Boolean(field.error)}
            aria-describedby={messageId}
            className={cn(
              "h-12 w-full min-w-0 rounded-lg border bg-transparent text-center font-mono text-lg outline-none transition",
              "focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
              field.error
                ? "border-red-500 focus-visible:ring-red-500/20"
                : field.success
                  ? "border-emerald-500 focus-visible:ring-emerald-500/20"
                  : "border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900/10 dark:border-neutral-700 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-100/10",
            )}
          />
        ))}
      </fieldset>
    </Field>
  );
}
