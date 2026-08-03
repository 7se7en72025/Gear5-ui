"use client";

import { CircleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "./field";

export interface ValidationIssue {
  /** `id` of the offending field, so the summary can focus it. */
  fieldId: string;
  label: string;
  message: string;
}

export interface ValidationSummaryProps {
  issues: ValidationIssue[];
  title?: string;
  /** Move focus to the summary when issues appear. Default `true`. */
  focusOnAppear?: boolean;
  className?: string;
}

/**
 * A form-level error summary, placed above the form and focused on submit.
 *
 * This is the piece most Indian KYC forms skip, and it's the one that matters
 * most for screen reader and keyboard users: without it, a failed submit gives
 * no indication of what went wrong or where. Each entry links to its field.
 */
export function ValidationSummary({
  issues,
  title,
  focusOnAppear = true,
  className,
}: ValidationSummaryProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const count = issues.length;

  // Focus only on the transition from clean to broken, so re-renders while the
  // user is fixing things don't keep yanking focus away from the field.
  const wasEmpty = React.useRef(true);
  React.useEffect(() => {
    if (focusOnAppear && count > 0 && wasEmpty.current) {
      ref.current?.focus();
    }
    wasEmpty.current = count === 0;
  }, [count, focusOnAppear]);

  if (count === 0) return null;

  const heading =
    title ??
    `${count} ${count === 1 ? "field needs" : "fields need"} attention`;

  return (
    <div
      ref={ref}
      // tabIndex -1 makes it programmatically focusable without adding it to
      // the tab order.
      tabIndex={-1}
      role="alert"
      aria-labelledby="validation-summary-heading"
      className={cn(
        "rounded-xl border border-red-500/30 bg-red-500/5 p-4 outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-red-500/20",
        className,
      )}
    >
      <p
        id="validation-summary-heading"
        className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400"
      >
        <CircleAlert className="size-4 shrink-0" aria-hidden />
        {heading}
      </p>

      <ul className="mt-2.5 space-y-1.5">
        {issues.map((issue) => (
          <li key={issue.fieldId} className="text-sm">
            <a
              href={`#${issue.fieldId}`}
              onClick={(event) => {
                // Focus the control itself rather than just scrolling to it.
                const target = document.getElementById(issue.fieldId);
                if (target) {
                  event.preventDefault();
                  target.focus();
                  target.scrollIntoView({
                    block: "center",
                    behavior: "smooth",
                  });
                }
              }}
              className="text-red-600 underline underline-offset-2 hover:no-underline dark:text-red-400"
            >
              {issue.label}
            </a>
            <span className="text-neutral-600 dark:text-neutral-400">
              {" — "}
              {issue.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
