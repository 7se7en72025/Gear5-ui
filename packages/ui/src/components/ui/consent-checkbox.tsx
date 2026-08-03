"use client";

import * as React from "react";

import { cn } from "./field";

export interface ConsentCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** What the user is agreeing to, in plain language. */
  children: React.ReactNode;
  /**
   * Why you need the data. The DPDP Act requires the purpose to be stated
   * *specifically* at the point of collection — "for our business purposes"
   * is not a purpose.
   */
  purpose: string;
  /** Who the data goes to, if anyone beyond you. */
  sharedWith?: string;
  /** How long you keep it. */
  retention?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * A consent checkbox that states purpose, sharing and retention up front.
 *
 * India's DPDP Act 2023 requires consent to be free, specific, informed and
 * unambiguous, with the purpose given at collection time. A bare "I agree to
 * the terms" checkbox does not meet that bar. This component makes the three
 * things you must disclose into required props, so they cannot be forgotten.
 *
 * Not legal advice — but it is much harder to be non-compliant by accident.
 */
export function ConsentCheckbox({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  children,
  purpose,
  sharedWith,
  retention,
  disabled,
  id,
  className,
}: ConsentCheckboxProps) {
  const reactId = React.useId();
  const checkboxId = id ?? `consent-${reactId}`;
  const detailsId = `${checkboxId}-details`;

  const isControlled = controlledChecked !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked);
  const checked = isControlled ? controlledChecked : uncontrolled;

  function toggle(next: boolean) {
    if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next);
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 p-4 dark:border-neutral-800",
        className,
      )}
    >
      <div className="flex gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => toggle(event.target.checked)}
          aria-describedby={detailsId}
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="min-w-0">
          <label
            htmlFor={checkboxId}
            className="cursor-pointer text-sm leading-relaxed"
          >
            {children}
          </label>

          <dl
            id={detailsId}
            className="mt-2.5 space-y-1 text-xs text-neutral-500 dark:text-neutral-400"
          >
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium">Purpose</dt>
              <dd className="min-w-0">{purpose}</dd>
            </div>
            {sharedWith && (
              <div className="flex gap-2">
                <dt className="shrink-0 font-medium">Shared with</dt>
                <dd className="min-w-0">{sharedWith}</dd>
              </div>
            )}
            {retention && (
              <div className="flex gap-2">
                <dt className="shrink-0 font-medium">Retained for</dt>
                <dd className="min-w-0">{retention}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
