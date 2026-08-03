"use client";

import { type ClassValue, clsx } from "clsx";
import { Check, CircleAlert, Info } from "lucide-react";
import * as React from "react";
import { twMerge } from "tailwind-merge";

import {
  searchHandles,
  splitVpa,
  type UpiHandle,
  type VpaResult,
  validateVpa,
} from "../../lib/upi";

/**
 * Local rather than imported from a shared `@/lib/utils`: this file has to
 * resolve identically in three places — this repo, the docs app, and whatever
 * project installs it from the registry. A path alias breaks in at least one
 * of those, and shipping our own `lib/utils.ts` would clobber the consumer's.
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UPIInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange"
  > {
  value?: string;
  defaultValue?: string;
  /** Fires on every keystroke with the raw input value. */
  onValueChange?: (value: string) => void;
  /** Fires whenever the validation result changes. */
  onValidationChange?: (result: VpaResult) => void;
  /**
   * When to surface errors. `blur` (default) is kinder — it doesn't yell at
   * someone who is still typing. Once a field has been blurred it revalidates
   * live so the error clears as soon as they fix it.
   */
  validateOn?: "blur" | "change";
  /** Show the bank/app badge once the handle is recognised. Default `true`. */
  showProvider?: boolean;
  /** Suggest handles after the user types `@`. Default `true`. */
  suggestHandles?: boolean;
  label?: string;
  /** Helper text shown under the field when there's nothing else to say. */
  description?: string;
  containerClassName?: string;
}

export function UPIInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onValidationChange,
  validateOn = "blur",
  showProvider = true,
  suggestHandles = true,
  label,
  description,
  className,
  containerClassName,
  id,
  onBlur,
  onFocus,
  onKeyDown,
  disabled,
  ...props
}: UPIInputProps) {
  const reactId = React.useId();
  const inputId = id ?? `upi-${reactId}`;
  const listboxId = `${inputId}-listbox`;
  const messageId = `${inputId}-message`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? controlledValue : uncontrolled;

  const [touched, setTouched] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const result = React.useMemo(() => validateVpa(value), [value]);

  // Report validation upward, but only when the result meaningfully changes.
  const lastReported = React.useRef<string>("");
  React.useEffect(() => {
    const key = `${result.valid}|${result.error?.code ?? ""}|${result.normalized ?? ""}`;
    if (key === lastReported.current) return;
    lastReported.current = key;
    onValidationChange?.(result);
  }, [result, onValidationChange]);

  const { handle: typedHandle } = splitVpa(value);
  const suggestions = React.useMemo<UpiHandle[]>(() => {
    if (!suggestHandles || typedHandle === null) return [];
    // Don't keep suggesting once they've typed an exact, recognised handle.
    const matches = searchHandles(typedHandle);
    if (matches.length === 1 && matches[0].handle === typedHandle.toLowerCase())
      return [];
    return matches;
  }, [suggestHandles, typedHandle]);

  const showSuggestions = open && suggestions.length > 0 && !disabled;

  // Reset the highlight whenever the query changes. Adjusting state during
  // render is the documented React pattern here — an effect would cause a
  // second render pass with a stale highlight painted in between.
  const [highlightKey, setHighlightKey] = React.useState(typedHandle);
  if (highlightKey !== typedHandle) {
    setHighlightKey(typedHandle);
    setActiveIndex(0);
  }

  // Close the dropdown on any outside pointer press.
  React.useEffect(() => {
    if (!showSuggestions) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showSuggestions]);

  function commit(next: string) {
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    commit(next);
    if (splitVpa(next).handle !== null) setOpen(true);
  }

  function selectHandle(handle: UpiHandle) {
    const { local } = splitVpa(value);
    commit(`${local}@${handle.handle}`);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (!showSuggestions) {
      if (event.key === "ArrowDown" && suggestions.length > 0) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + suggestions.length) % suggestions.length,
        );
        break;
      case "Enter":
        // Only intercept Enter while a suggestion is highlighted, so the field
        // still submits its form normally when the dropdown is closed.
        event.preventDefault();
        selectHandle(suggestions[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        selectHandle(suggestions[activeIndex]);
        break;
    }
  }

  const shouldValidate = validateOn === "change" || touched;
  const error =
    shouldValidate && value.trim() !== "" ? result.error : undefined;
  const warn = shouldValidate && result.valid && result.unrecognisedHandle;
  const success = result.valid && !result.unrecognisedHandle;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        <input
          {...props}
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={props.placeholder ?? "name@bank"}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            onFocus?.(event);
            if (splitVpa(value).handle !== null) setOpen(true);
          }}
          onBlur={(event) => {
            setTouched(true);
            onBlur?.(event);
          }}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            showSuggestions ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-invalid={Boolean(error)}
          aria-describedby={
            error || warn || description ? messageId : undefined
          }
          className={cn(
            "h-10 w-full rounded-lg border bg-transparent px-3 py-2 font-mono text-sm outline-none transition",
            "placeholder:font-sans placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:ring-[3px]",
            showProvider && (success || error) && "pr-28",
            error
              ? "border-red-500 focus-visible:ring-red-500/20"
              : success
                ? "border-emerald-500 focus-visible:ring-emerald-500/20"
                : "border-neutral-300 focus-visible:border-neutral-900 focus-visible:ring-neutral-900/10 dark:border-neutral-700 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-100/10",
            className,
          )}
        />

        {showProvider && success && result.provider && (
          <span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <Check className="size-3" aria-hidden />
            {result.provider.provider}
          </span>
        )}

        {showSuggestions && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="UPI handles"
            className="absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-white/10"
          >
            {suggestions.map((handle, index) => (
              // APG combobox: options are deliberately NOT focusable and carry no
              // key handlers. Focus stays in the input, aria-activedescendant marks
              // the active option, and arrows/Enter/Escape are handled there. Making
              // an option focusable would put it in the tab order and break this.
              // biome-ignore lint/a11y/useFocusableInteractive: see above
              // biome-ignore lint/a11y/useKeyWithClickEvents: see above
              <div
                key={handle.handle}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // preventDefault keeps focus in the input so blur doesn't close
                // the list before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectHandle(handle)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                  index === activeIndex && "bg-neutral-100 dark:bg-neutral-800",
                )}
              >
                <span className="font-mono text-[13px]">@{handle.handle}</span>
                <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {handle.provider}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(error || warn || description) && (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={cn(
            "mt-1.5 flex items-start gap-1.5 text-xs",
            error
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400",
          )}
        >
          {error ? (
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          ) : warn ? (
            <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          ) : null}
          {error
            ? error.message
            : warn
              ? "We don't recognise this handle, but it may still be valid."
              : description}
        </p>
      )}
    </div>
  );
}
