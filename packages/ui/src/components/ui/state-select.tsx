"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import {
  INDIAN_STATES,
  type IndianState,
  searchStates,
} from "../../lib/states";
import { cn, controlClasses, Field } from "./field";

export interface StateSelectProps {
  /** Two-letter state code, e.g. `"KA"`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (code: string, state: IndianState | undefined) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Show the numeric GST code alongside each state. */
  showGstCode?: boolean;
  id?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * A searchable state/UT picker following the APG combobox pattern — options are
 * never focusable, focus stays in the input, and `aria-activedescendant` marks
 * the highlighted row.
 */
export function StateSelect({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  label,
  description,
  placeholder = "Select a state…",
  disabled,
  showGstCode = false,
  id,
  className,
  containerClassName,
}: StateSelectProps) {
  const reactId = React.useId();
  const inputId = id ?? `state-${reactId}`;
  const listboxId = `${inputId}-listbox`;
  const messageId = `${inputId}-message`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const code = isControlled ? controlledValue : uncontrolled;
  const selected = INDIAN_STATES.find((s) => s.code === code);

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const matches = React.useMemo(() => searchStates(query), [query]);

  // Reset the highlight when the query changes — during render, not in an
  // effect, so no frame paints with a stale highlight.
  const [lastQuery, setLastQuery] = React.useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setActiveIndex(0);
  }

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function select(state: IndianState) {
    if (!isControlled) setUncontrolled(state.code);
    onValueChange?.(state.code, state);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % matches.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
        break;
      case "Enter":
        event.preventDefault();
        if (matches[activeIndex]) select(matches[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        setQuery("");
        break;
    }
  }

  return (
    <Field
      id={inputId}
      messageId={messageId}
      label={label}
      message={description}
      className={containerClassName}
    >
      <div ref={containerRef} className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          disabled={disabled}
          placeholder={selected ? selected.name : placeholder}
          value={open ? query : (selected?.name ?? "")}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && matches.length > 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-describedby={description ? messageId : undefined}
          className={cn(
            controlClasses({ success: Boolean(selected) }),
            "cursor-pointer pr-9 font-sans",
            className,
          )}
        />
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
        />

        {open && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Indian states and union territories"
            className="absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-white/10"
          >
            {matches.map((state, index) => (
              // biome-ignore lint/a11y/useFocusableInteractive: APG combobox — focus stays in the input
              // biome-ignore lint/a11y/useKeyWithClickEvents: keys are handled on the input
              <div
                key={state.code}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={state.code === code}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(state)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 text-sm",
                  index === activeIndex && "bg-neutral-100 dark:bg-neutral-800",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {state.code === code ? (
                    <Check className="size-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <span aria-hidden className="size-3.5 shrink-0" />
                  )}
                  <span className="truncate">{state.name}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-neutral-500">
                  {showGstCode ? state.gstCode : state.code}
                </span>
              </div>
            ))}
            {matches.length === 0 && (
              <p className="px-2.5 py-6 text-center text-sm text-neutral-500">
                No state matches “{query}”.
              </p>
            )}
          </div>
        )}
      </div>
    </Field>
  );
}
