"use client";

import { type ClassValue, clsx } from "clsx";
import { CircleAlert, Info } from "lucide-react";
import * as React from "react";
import { twMerge } from "tailwind-merge";

/**
 * Shared by every bharat-ui field. Defined here rather than imported from a
 * project's `@/lib/utils` so that installing a component can never overwrite
 * the consumer's own utils file.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FieldTone = "error" | "hint" | "muted";

export interface FieldProps {
  id: string;
  /** Id of the element holding the message; wire this into aria-describedby. */
  messageId: string;
  label?: string;
  /** Resolved message text — an error, a warning, or the fallback description. */
  message?: string;
  tone?: FieldTone;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + message, with the aria plumbing already correct. */
export function Field({
  id,
  messageId,
  label,
  message,
  tone = "muted",
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}

      {children}

      {message && (
        <p
          id={messageId}
          // Only errors interrupt a screen reader; hints are read on focus.
          role={tone === "error" ? "alert" : undefined}
          className={cn(
            "mt-1.5 flex items-start gap-1.5 text-xs",
            tone === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400",
          )}
        >
          {tone === "error" ? (
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          ) : tone === "hint" ? (
            <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          ) : null}
          {message}
        </p>
      )}
    </div>
  );
}

/** Border/ring classes shared by every text control, keyed on validity. */
export function controlClasses(state: {
  error?: boolean;
  success?: boolean;
}): string {
  return cn(
    "h-10 w-full rounded-lg border bg-transparent px-3 py-2 font-mono text-sm outline-none transition",
    "placeholder:font-sans placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:ring-[3px]",
    state.error
      ? "border-red-500 focus-visible:ring-red-500/20"
      : state.success
        ? "border-emerald-500 focus-visible:ring-emerald-500/20"
        : "border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900/10 dark:border-neutral-700 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-100/10",
  );
}

export interface ValidationLike {
  valid: boolean;
  error?: { message: string };
}

/**
 * The controlled/uncontrolled + touched + report-upward logic every field here
 * needs. Kept in one place so all of them behave identically: errors appear on
 * blur by default, then update live once the user has been warned.
 */
export function useFieldState<T extends ValidationLike>(options: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValidationChange?: (result: T) => void;
  validate: (raw: string) => T;
  /** Optional input mask applied on every keystroke. */
  transform?: (raw: string) => string;
  validateOn?: "blur" | "change";
}) {
  const {
    value: controlled,
    defaultValue = "",
    onValueChange,
    onValidationChange,
    validate,
    transform,
    validateOn = "blur",
  } = options;

  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? controlled : uncontrolled;
  const [touched, setTouched] = React.useState(false);

  const result = React.useMemo(() => validate(value), [value, validate]);

  // Report upward only when the outcome actually changes, so consumers can put
  // setState directly in the callback without a render loop.
  const lastReported = React.useRef<string>("");
  React.useEffect(() => {
    const key = JSON.stringify(result);
    if (key === lastReported.current) return;
    lastReported.current = key;
    onValidationChange?.(result);
  }, [result, onValidationChange]);

  const setValue = React.useCallback(
    (next: string) => {
      const masked = transform ? transform(next) : next;
      if (!isControlled) setUncontrolled(masked);
      onValueChange?.(masked);
    },
    [isControlled, onValueChange, transform],
  );

  const shouldValidate = validateOn === "change" || touched;
  const error =
    shouldValidate && value.trim() !== "" ? result.error?.message : undefined;

  return {
    value,
    setValue,
    result,
    touched,
    markTouched: () => setTouched(true),
    error,
    success: result.valid,
  };
}

/** Small right-aligned badge inside a control (bank name, entity type, …). */
export function FieldBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute right-2 top-1/2 flex max-w-[45%] -translate-y-1/2 items-center gap-1 truncate rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      {children}
    </span>
  );
}
