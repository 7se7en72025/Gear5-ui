"use client";

import * as React from "react";
import {
  RetryAfter as RetryAfterPrimitive,
  RetryAfterButton,
  RetryAfterMessage,
} from "handoff-ui";
import type { RetryAfterProps as RetryAfterPrimitiveProps } from "handoff-ui";
import { cn } from "./lib/utils";

/** Styled rate limit wait. */
export function RetryAfter({ className, ...props }: RetryAfterPrimitiveProps) {
  return (
    <RetryAfterPrimitive
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-panel border px-3 py-2.5",
        "border-warning/40 bg-warning/[0.06]",
        "data-[ready]:border-line data-[ready]:bg-panel",
        className,
      )}
      {...props}
    >
      <RetryAfterMessage className="min-w-0 flex-1 text-[13px] text-fg-muted" />
      <RetryAfterButton
        className={cn(
          "shrink-0 rounded-chip border border-line px-2.5 py-1 text-[12px] transition-colors",
          "text-fg-muted hover:border-line-strong hover:text-fg",
          "disabled:pointer-events-none disabled:opacity-40",
          "data-[ready]:border-accent data-[ready]:text-accent",
        )}
      />
    </RetryAfterPrimitive>
  );
}
