"use client";

import * as React from "react";
import {
  RunError as RunErrorPrimitive,
  RunErrorDetails,
  RunErrorMessage,
  RunErrorRetry,
  RunErrorTitle,
} from "@gear5/core";
import type { RunErrorProps as RunErrorPrimitiveProps } from "@gear5/core";
import { cn } from "./lib/utils";

/** Styled run failure. */
export function RunError({ className, ...props }: RunErrorPrimitiveProps) {
  return (
    <RunErrorPrimitive
      className={cn(
        "animate-rise rounded-panel border border-danger/40 bg-danger/[0.06] p-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger"
        />
        <div className="min-w-0 flex-1">
          <RunErrorTitle className="text-sm font-medium text-fg" />
          <RunErrorMessage className="mt-1 text-[13px] leading-relaxed text-fg-muted" />

          <RunErrorDetails
            className={cn(
              "mt-3",
              "[&_button]:rounded-chip [&_button]:border [&_button]:border-line [&_button]:px-2 [&_button]:py-1",
              "[&_button]:font-mono [&_button]:text-[11px] [&_button]:text-fg-muted",
              "[&_button:hover]:text-fg",
              "[&_pre]:mt-2 [&_pre]:max-h-40 [&_pre]:overflow-auto [&_pre]:rounded-chip",
              "[&_pre]:bg-panel [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[11px] [&_pre]:leading-relaxed",
            )}
          />

          <RunErrorRetry
            className={cn(
              "mt-3 rounded-chip bg-fg px-3 py-1.5 text-[13px] font-medium text-bg",
              "transition-opacity hover:opacity-90",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          />
        </div>
      </div>
    </RunErrorPrimitive>
  );
}
